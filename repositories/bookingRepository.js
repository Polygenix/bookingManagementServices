const Booking = require("../models/Booking");
const TimeSlot = require("../models/TimeSlot");

const createBooking = async (bookingData) => {
  return await Booking.create(bookingData);
};

const findBookingsByCustomer = async (customerId) => {
  return await Booking.find({ customer: customerId })
    .populate("timeSlotId")
    .sort({ createdAt: -1 });
};

const findBookingById = async (bookingId, customerId) => {
  return await Booking.findOne({
    _id: bookingId,
    customer: customerId
  }).populate("timeSlotId");
};

const updateBooking = async (bookingId, customerId, data) => {
  return await Booking.findOneAndUpdate(
    { _id: bookingId, customer: customerId },
    { $set: data },
    { new: true, runValidators: true }
  );
};

// Delete booking and release slot capacity
const deleteBooking = async (bookingId, customerId) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    customer: customerId
  });

  if (!booking) {
    return null;
  }

  if (booking.status === "cancelled") {
    const error = new Error("Booking is already cancelled");
    error.statusCode = 400;
    throw error;
  }

  if (booking.status === "completed") {
    const error = new Error("Completed booking cannot be deleted");
    error.statusCode = 400;
    throw error;
  }

  // Delete booking
  const deletedBooking = await Booking.findOneAndDelete({
    _id: bookingId,
    customer: customerId
  });

  if (!deletedBooking) {
    return null;
  }

  // Release reserved slot capacity
  if (deletedBooking.timeSlotId) {
    await TimeSlot.updateOne(
      {
        _id: deletedBooking.timeSlotId,
        bookedCount: { $gt: 0 }
      },
      {
        $inc: { bookedCount: -1 }
      }
    );
  }

  return deletedBooking;
};

module.exports = {
  createBooking,
  findBookingsByCustomer,
  findBookingById,
  updateBooking,
  deleteBooking
};