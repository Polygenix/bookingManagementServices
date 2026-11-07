const Booking = require("../models/Booking");

const findAllBookings = async () => {
  return await Booking.find()
    .populate("customer", "name email")
    .sort({ createdAt: -1 });
};

module.exports = {
  findAllBookings
};