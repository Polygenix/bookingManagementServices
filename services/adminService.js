
const adminRepository = require("../repositories/adminRepository");
const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const TimeSlot = require("../models/TimeSlot");

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
      const booking = await Booking.findById(id).session(session);

      if (!booking) {
        const error = new Error("Booking not found");
        error.statusCode = 404;
        throw error;
      }

      // Release capacity only once when booking is cancelled.
      // Completed bookings do not release historical capacity.
      if (
        status === "cancelled" &&
        booking.status !== "cancelled" &&
        booking.status !== "completed"
      ) {
        await releaseSlotCapacity(booking, session);
      }

      booking.status = status;

      await booking.save({ session });

      updatedBooking = booking;
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

  if (Object.keys(updateData).length === 0) {
    const error = new Error("No valid fields provided for update");
    error.statusCode = 400;
    throw error;
  }

  const booking = await adminRepository.updateBooking(id, updateData);

  if (!booking) {
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
      const booking = await Booking.findById(id).session(session);

      if (!booking) {
        const error = new Error("Booking not found");
        error.statusCode = 404;
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
