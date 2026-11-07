const adminRepository = require("../repositories/adminRepository");

const getAllBookings = async () => {
  const bookings = await adminRepository.findAllBookings();

  return bookings;
};

module.exports = {
  getAllBookings
};