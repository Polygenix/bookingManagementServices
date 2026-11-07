const Booking = require("../models/Booking");

const findAllBookings = async () => {
  return await Booking.find()
    .populate("customer", "name email")
    .sort({ createdAt: -1 });
};
const findBookingById = async (id) => {
  return await Booking.findById(id)
    .populate("customer", "name email");
};

const updateBookingStatus = async (id, status) => {
  return await Booking.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate("customer", "name email");
};

const updateBooking = async (id, updateData) => {
  return await Booking.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).populate("customer", "name email");
};

const deleteBooking = async (id) => {
  return await Booking.findByIdAndDelete(id);
};


module.exports = {
  findAllBookings,
  findBookingById,
  updateBookingStatus,
  updateBooking,
  deleteBooking
};