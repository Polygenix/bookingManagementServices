const Booking = require("../models/Booking");

const findAllBookings = async () => {
  return await Booking.find()
    .populate("customer")
    .populate("timeSlotId")
    .populate("addressId")
    .sort({ createdAt: -1 });
};

const findBookingById = async (id) => {
  return await Booking.findById(id)
    .populate("customer")
    .populate("timeSlotId")
    .populate("addressId");
};

const updateBooking = async (id, updateData) => {
  return await Booking.findByIdAndUpdate(
    id,
    { $set: updateData },
    {
      new: true,
      runValidators: true
    }
  )
    .populate("customer")
    .populate("timeSlotId")
    .populate("addressId");
};

module.exports = {
  findAllBookings,
  findBookingById,
  updateBooking
};
