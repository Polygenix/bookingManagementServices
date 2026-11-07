
const mongoose = require("mongoose");
const bookingRepository = require("../repositories/bookingRepository");

const createBooking = async (customerId, data) => {
  const {
    patientName,
    testName,
    age,
    gender,
    phone,
    email,
    bookingDate,
    timeSlot,
    notes
  } = data;

  if (
    !patientName ||
    !testName ||
    age === undefined ||
    !gender ||
    !phone ||
    !email ||
    !bookingDate ||
    !timeSlot
  ) {
    const error = new Error("All required booking fields must be provided");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(Number(age)) || Number(age) < 1 || Number(age) > 120) {
    const error = new Error("Age must be between 1 and 120");
    error.statusCode = 400;
    throw error;
  }

  const normalizedGender = typeof gender === "string"
    ? gender.trim().charAt(0).toUpperCase() + gender.trim().slice(1).toLowerCase()
    : "";

  if (!["Male", "Female", "Other"].includes(normalizedGender)) {
    const error = new Error("Invalid gender");
    error.statusCode = 400;
    throw error;
  }

  const parsedDate = new Date(bookingDate);

  if (Number.isNaN(parsedDate.getTime())) {
    const error = new Error("Invalid booking date");
    error.statusCode = 400;
    throw error;
  }

  if (parsedDate < new Date(new Date().setHours(0, 0, 0, 0))) {
    const error = new Error("Booking date cannot be in the past");
    error.statusCode = 400;
    throw error;
  }

  const booking = await bookingRepository.createBooking({
    customer: customerId,
    patientName: patientName.trim(),
    testName: testName.trim(),
    age: Number(age),
    gender: normalizedGender,
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    bookingDate: parsedDate,
    timeSlot: timeSlot.trim(),
    notes: notes || ""
  });

  return booking;
};


const getCustomerBookings = (customerId) =>
  bookingRepository.findBookingsByCustomer(customerId);

const getBookingById = (bookingId, customerId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    const error = new Error("Invalid booking ID");
    error.statusCode = 400;
    throw error;
  }
  return bookingRepository.findBookingById(bookingId, customerId);
};

const updateCustomerBooking = async (bookingId, customerId, data) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    const error = new Error("Invalid booking ID");
    error.statusCode = 400;
    throw error;
  }

  const allowedFields = ["patientName", "testName", "age", "gender", "phone", "email", "bookingDate", "timeSlot", "notes"];
  const updateData = {};
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) updateData[field] = data[field];
  });

  if (updateData.gender) {
    updateData.gender = updateData.gender.trim().charAt(0).toUpperCase() + updateData.gender.trim().slice(1).toLowerCase();
    if (!["Male", "Female", "Other"].includes(updateData.gender)) {
      const error = new Error("Invalid gender");
      error.statusCode = 400;
      throw error;
    }
  }

  if (Object.keys(updateData).length === 0) {
    const error = new Error("No valid fields provided for update");
    error.statusCode = 400;
    throw error;
  }

  return bookingRepository.updateBooking(bookingId, customerId, updateData);
};

const deleteCustomerBooking = (bookingId, customerId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    const error = new Error("Invalid booking ID");
    error.statusCode = 400;
    throw error;
  }
  return bookingRepository.deleteBooking(bookingId, customerId);
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getBookingById,
  updateCustomerBooking,
  deleteCustomerBooking
};
