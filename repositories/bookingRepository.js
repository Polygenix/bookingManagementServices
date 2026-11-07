const Booking = require("../models/Booking");

const createBooking = async (bookingData) => {
  return await Booking.create(bookingData);
};

module.exports = {
  createBooking
};
