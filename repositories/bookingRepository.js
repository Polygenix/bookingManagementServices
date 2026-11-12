
const Booking = require("../models/Booking");
const TimeSlot = require("../models/TimeSlot");
const mongoose = require("mongoose");

const createBooking = async (bookingData) => {
  return await Booking.create(bookingData);
};

// GET ALL BOOKINGS
const findAllBookings = async () => {
  return await Booking.find()
    .populate("customer")
    .populate("timeSlotId")
    .populate("addressId")
    .sort({ createdAt: -1 });
};

// GET CUSTOMER BOOKINGS
const findBookingsByCustomer = async (customerId) => {
  return await Booking.find({ customer: customerId })
    .populate("timeSlotId")
    .populate("addressId")
    .sort({ createdAt: -1 });
};

// GET BOOKING BY ID
const findBookingById = async (bookingId, customerId) => {
  return await Booking.findOne({
    _id: bookingId,
    customer: customerId,
  })
    .populate("timeSlotId")
    .populate("addressId");
};

// UPDATE BOOKING
const updateBooking = async (
  bookingId,
  customerId,
  data,
  requirePaymentUnlocked = false
) => {
  const filter = {
    _id: bookingId,
    customer: customerId,
  };

  if (requirePaymentUnlocked) {
    filter.$or = [
      { paymentOrderLockUntil: { $exists: false } },
      { paymentOrderLockUntil: null },
      { paymentOrderLockUntil: { $lte: new Date() } },
    ];
  }

  return await Booking.findOneAndUpdate(
    filter,
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("timeSlotId")
    .populate("addressId");
};

// DELETE BOOKING AND RELEASE SLOT CAPACITY
const deleteBooking = async (bookingId, customerId) => {
  const session = await mongoose.startSession();
  let deletedBooking;

  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findOne({
        _id: bookingId,
        customer: customerId,
      })
        .select("+paymentOrderLockUntil")
        .session(session);

      if (!booking) {
        return;
      }

      if (booking.status === "cancelled") {
        const error = new Error("Booking is already cancelled");
        error.statusCode = 400;
        throw error;
      }

      if (booking.status === "completed" || booking.status === "confirmed") {
        const error = new Error(
          "Confirmed or completed bookings cannot be deleted"
        );
        error.statusCode = 409;
        throw error;
      }

      if (booking.paymentOrderLockUntil > new Date()) {
        const error = new Error("Booking payment order is being created");
        error.statusCode = 409;
        throw error;
      }

      deletedBooking = await Booking.findOneAndDelete(
        {
          _id: bookingId,
          customer: customerId,
          status: "pending",
          $or: [
            { paymentOrderLockUntil: { $exists: false } },
            { paymentOrderLockUntil: null },
            { paymentOrderLockUntil: { $lte: new Date() } },
          ],
        },
        { session }
      );

      if (!deletedBooking) {
        const error = new Error("Booking changed while it was being deleted");
        error.statusCode = 409;
        throw error;
      }

      if (deletedBooking.timeSlotId) {
        const result = await TimeSlot.updateOne(
          {
            _id: deletedBooking.timeSlotId,
            bookedCount: { $gt: 0 },
          },
          {
            $inc: { bookedCount: -1 },
          },
          { session }
        );

        if (result.modifiedCount !== 1) {
          const error = new Error("Unable to release time slot capacity");
          error.statusCode = 409;
          throw error;
        }
      }
    });
  } finally {
    await session.endSession();
  }

  return deletedBooking || null;
};

module.exports = {
  createBooking,
  findAllBookings,
  findBookingsByCustomer,
  findBookingById,
  updateBooking,
  deleteBooking,
};
