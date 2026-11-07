const adminRepository = require("../repositories/adminRepository");
const mongoose = require("mongoose");
const getAllBookings = async () => {
  const bookings = await adminRepository.findAllBookings();

  return bookings;
};
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

  const booking = await adminRepository.updateBookingStatus(id, status);

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  return booking;
};


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
    "bookingDate",
    "timeSlot",
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

const deleteBooking = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid booking ID");
    error.statusCode = 400;
    throw error;
  }

  const booking = await adminRepository.deleteBooking(id);

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  return booking;
};

module.exports = {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updateBooking,
  deleteBooking
};