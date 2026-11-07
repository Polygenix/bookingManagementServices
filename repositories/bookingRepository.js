const Booking = require("../models/Booking");

const createBooking = async (bookingData) => Booking.create(bookingData);

const findBookingsByCustomer = async (customerId) =>
  Booking.find({ customer: customerId }).sort({ createdAt: -1 });

const findBookingById = async (bookingId, customerId) =>
  Booking.findOne({ _id: bookingId, customer: customerId });

const updateBooking = async (bookingId, customerId, data) =>
  Booking.findOneAndUpdate(
    { _id: bookingId, customer: customerId },
    { $set: data },
    { new: true, runValidators: true }
  );

const deleteBooking = async (bookingId, customerId) =>
  Booking.findOneAndDelete({ _id: bookingId, customer: customerId });

module.exports = {
  createBooking,
  findBookingsByCustomer,
  findBookingById,
  updateBooking,
  deleteBooking
};
