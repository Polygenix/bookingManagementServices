
const adminRepository = require("../repositories/adminRepository");
const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const TimeSlot = require("../models/TimeSlot");
const Test = require("../models/Test");
const Payment = require("../models/Payment");

// Release reserved slot capacity
const releaseSlotCapacity = async (booking, session) => {
  // Old bookings may not have timeSlotId
  if (!booking.timeSlotId) {
    return;
  }

  const result = await TimeSlot.updateOne(
    {
      _id: booking.timeSlotId,
      bookedCount: { $gt: 0 }
    },
    {
      $inc: { bookedCount: -1 }
    },
    { session }
  );

  if (result.modifiedCount !== 1) {
    const error = new Error("Unable to release time slot capacity");
    error.statusCode = 409;
    throw error;
  }
};

const reserveSlotCapacity = async (booking, session) => {
  if (!booking.timeSlotId) {
    return;
  }

  const result = await TimeSlot.updateOne(
    {
      _id: booking.timeSlotId,
      isActive: true,
      $expr: { $lt: ["$bookedCount", "$capacity"] }
    },
    { $inc: { bookedCount: 1 } },
    { session }
  );

  if (result.modifiedCount !== 1) {
    const error = new Error("Unable to reserve time slot capacity");
    error.statusCode = 409;
    throw error;
  }
};

// 1. Get All Bookings
const getAllBookings = async () => {
  return await adminRepository.findAllBookings();
};

// 2. Get Booking By ID
const getBookingById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid booking ID");
    error.statusCode = 400;
    throw error;
  }

  const booking = await adminRepository.findBookingById(id);

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  return booking;
};

// 3. Update Booking Status
const updateBookingStatus = async (id, status) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid booking ID");
    error.statusCode = 400;
    throw error;
  }

  const allowedStatuses = [
    "pending",
    "confirmed",
    "completed",
    "cancelled"
  ];

  if (!allowedStatuses.includes(status)) {
    const error = new Error("Invalid booking status");
    error.statusCode = 400;
    throw error;
  }

  const session = await mongoose.startSession();

  let updatedBooking;

  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findById(id)
        .select("+paymentOrderLockUntil")
        .session(session);

      if (!booking) {
        const error = new Error("Booking not found");
        error.statusCode = 404;
        throw error;
      }

      const transitions = {
        pending: ["confirmed", "cancelled"],
        confirmed: ["completed", "cancelled"],
        cancelled: ["pending", "confirmed"],
        completed: []
      };

      if (
        status !== booking.status &&
        !transitions[booking.status]?.includes(status)
      ) {
        const error = new Error(
          `Booking cannot transition from ${booking.status} to ${status}`
        );
        error.statusCode = 409;
        throw error;
      }

      if (status === "cancelled" && booking.status !== "cancelled") {
        const activePayment = await Payment.exists({
          booking: booking._id,
          status: { $in: ["pending", "paid"] }
        }).session(session);

        if (activePayment || booking.paymentOrderLockUntil > new Date()) {
          const error = new Error(
            "Resolve the booking payment before cancelling it"
          );
          error.statusCode = 409;
          throw error;
        }
      }

      if (
        status === "cancelled" &&
        booking.status !== "cancelled"
      ) {
        await releaseSlotCapacity(booking, session);
      }

      if (
        booking.status === "cancelled" &&
        ["pending", "confirmed"].includes(status)
      ) {
        await reserveSlotCapacity(booking, session);
      }

      updatedBooking = await Booking.findByIdAndUpdate(
        id,
        { $set: { status } },
        {
          new: true,
          runValidators: true,
          session
        }
      );
    });
  } finally {
    await session.endSession();
  }

  return updatedBooking;
};

// 4. Update Booking Details
const updateBooking = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid booking ID");
    error.statusCode = 400;
    throw error;
  }

  const allowedFields = [
    "patientName",
    "testName",
    "testId",
    "age",
    "gender",
    "phone",
    "email",
    "notes"
  ];

  const updateData = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  if (updateData.testId !== undefined || updateData.testName !== undefined) {
    const activePayment = await Payment.exists({
      booking: id,
      status: { $in: ["pending", "paid"] }
    });

    if (activePayment) {
      const error = new Error(
        "The test cannot be changed while a payment is pending or paid"
      );
      error.statusCode = 409;
      throw error;
    }

    let test;

    if (updateData.testId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(updateData.testId)) {
        const error = new Error("Invalid test ID");
        error.statusCode = 400;
        throw error;
      }

      test = await Test.findOne({
        _id: updateData.testId,
        isActive: true
      });
    } else {
      if (typeof updateData.testName !== "string") {
        const error = new Error("Invalid test name");
        error.statusCode = 400;
        throw error;
      }

      test = await Test.findOne({
        testName: updateData.testName.trim(),
        isActive: true
      });
    }

    if (!test) {
      const error = new Error("Test not found or inactive");
      error.statusCode = 404;
      throw error;
    }

    updateData.testId = test._id;
    updateData.testName = test.testName;
    updateData.amount = test.price;
  }

  if (Object.keys(updateData).length === 0) {
    const error = new Error("No valid fields provided for update");
    error.statusCode = 400;
    throw error;
  }

  const booking = await adminRepository.updateBooking(
    id,
    updateData,
    updateData.testId !== undefined || updateData.testName !== undefined
  );

  if (!booking) {
    if (
      updateData.testId !== undefined ||
      updateData.testName !== undefined
    ) {
      const existingBooking = await Booking.exists({ _id: id });
      if (existingBooking) {
        const error = new Error(
          "Booking test cannot be changed in its current state"
        );
        error.statusCode = 409;
        throw error;
      }
    }

    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  return booking;
};

// 5. Delete Booking
const deleteBooking = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid booking ID");
    error.statusCode = 400;
    throw error;
  }

  const session = await mongoose.startSession();

  let deletedBooking;

  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findById(id)
        .select("+paymentOrderLockUntil")
        .session(session);

      if (!booking) {
        const error = new Error("Booking not found");
        error.statusCode = 404;
        throw error;
      }

      const activePayment = await Payment.exists({
        booking: booking._id,
        status: { $in: ["pending", "paid"] }
      }).session(session);

      if (activePayment || booking.paymentOrderLockUntil > new Date()) {
        const error = new Error(
          "Resolve the booking payment before deleting it"
        );
        error.statusCode = 409;
        throw error;
      }

      // Release capacity only for bookings that still occupy a slot.
      if (
        booking.status !== "cancelled" &&
        booking.status !== "completed"
      ) {
        await releaseSlotCapacity(booking, session);
      }

      deletedBooking = await Booking.findOneAndDelete(
        { _id: id },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  return deletedBooking;
};

module.exports = {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updateBooking,
  deleteBooking
};
