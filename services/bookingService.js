const mongoose = require("mongoose");

const bookingRepository = require("../repositories/bookingRepository");
const TimeSlot = require("../models/TimeSlot");

const throwError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

// CREATE BOOKING
const createBooking = async (customerId, data) => {
  const {
    patientName,
    testName,
    age,
    gender,
    phone,
    email,
    bookingDate,
    timeSlotId,
    notes
  } = data;

  // Required fields validation
  if (
    !patientName ||
    !testName ||
    age === undefined ||
    !gender ||
    !phone ||
    !email ||
    !bookingDate ||
    !timeSlotId
  ) {
    throwError("All required booking fields must be provided", 400);
  }

  // Age validation
  if (
    !Number.isInteger(Number(age)) ||
    Number(age) < 1 ||
    Number(age) > 120
  ) {
    throwError("Age must be between 1 and 120", 400);
  }

  // Email validation
  const normalizedEmail = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    throwError("Invalid email address", 400);
  }

  // Gender validation
  const normalizedGender =
    gender.trim().charAt(0).toUpperCase() +
    gender.trim().slice(1).toLowerCase();

  if (!["Male", "Female", "Other"].includes(normalizedGender)) {
    throwError("Invalid gender", 400);
  }

  // Date validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
    throwError("Booking date must be YYYY-MM-DD", 400);
  }

  const parsedDate = new Date(`${bookingDate}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== bookingDate
  ) {
    throwError("Invalid booking date", 400);
  }

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  if (bookingDate < todayString) {
    throwError("Booking date cannot be in the past", 400);
  }

  // Time slot ID validation
  if (!mongoose.Types.ObjectId.isValid(timeSlotId)) {
    throwError("Invalid time slot ID", 400);
  }

  // Reserve slot capacity atomically
  const reservedSlot = await TimeSlot.findOneAndUpdate(
    {
      _id: timeSlotId,
      date: bookingDate,
      isActive: true,
      $expr: {
        $lt: ["$bookedCount", "$capacity"]
      }
    },
    {
      $inc: {
        bookedCount: 1
      }
    },
    {
      new: true
    }
  );

  if (!reservedSlot) {
    throwError("Time slot is unavailable or fully booked", 409);
  }

  try {
    // Create booking
    const booking = await bookingRepository.createBooking({
      customer: customerId,
      patientName: patientName.trim(),
      testName: testName.trim(),
      age: Number(age),
      gender: normalizedGender,
      phone: phone.trim(),
      email: normalizedEmail,
      bookingDate: parsedDate,
      timeSlotId: reservedSlot._id,
      timeSlot: `${reservedSlot.startTime}-${reservedSlot.endTime}`,
      notes: notes || ""
    });

    return booking;

  } catch (error) {
    // Release reserved capacity if booking creation fails
    await TimeSlot.updateOne(
      {
        _id: reservedSlot._id,
        bookedCount: { $gt: 0 }
      },
      {
        $inc: { bookedCount: -1 }
      }
    );

    throw error;
  }
};

// GET CUSTOMER BOOKINGS
const getCustomerBookings = (customerId) =>
  bookingRepository.findBookingsByCustomer(customerId);

// GET BOOKING BY ID
const getBookingById = async (bookingId, customerId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throwError("Invalid booking ID", 400);
  }

  const booking = await bookingRepository.findBookingById(
    bookingId,
    customerId
  );

  if (!booking) {
    throwError("Booking not found", 404);
  }

  return booking;
};

// UPDATE CUSTOMER BOOKING
const updateCustomerBooking = async (bookingId, customerId, data) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throwError("Invalid booking ID", 400);
  }

  const allowedFields = [
    "patientName",
    "testName",
    "age",
    "gender",
    "phone",
    "email",
    "notes"
  ];

  const updateData = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  if (updateData.age !== undefined) {
    if (
      !Number.isInteger(Number(updateData.age)) ||
      Number(updateData.age) < 1 ||
      Number(updateData.age) > 120
    ) {
      throwError("Age must be between 1 and 120", 400);
    }

    updateData.age = Number(updateData.age);
  }

  if (updateData.gender !== undefined) {
    updateData.gender =
      updateData.gender.trim().charAt(0).toUpperCase() +
      updateData.gender.trim().slice(1).toLowerCase();

    if (!["Male", "Female", "Other"].includes(updateData.gender)) {
      throwError("Invalid gender", 400);
    }
  }

  if (updateData.email !== undefined) {
    updateData.email = updateData.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) {
      throwError("Invalid email address", 400);
    }
  }

  if (updateData.patientName !== undefined) {
    updateData.patientName = updateData.patientName.trim();
  }

  if (updateData.testName !== undefined) {
    updateData.testName = updateData.testName.trim();
  }

  if (updateData.phone !== undefined) {
    updateData.phone = updateData.phone.trim();
  }

  if (Object.keys(updateData).length === 0) {
    throwError("No valid fields provided for update", 400);
  }

  const booking = await bookingRepository.updateBooking(
    bookingId,
    customerId,
    updateData
  );

  if (!booking) {
    throwError("Booking not found", 404);
  }

  return booking;
};

// DELETE CUSTOMER BOOKING
const deleteCustomerBooking = async (bookingId, customerId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throwError("Invalid booking ID", 400);
  }

  throwError(
    "Booking deletion must release its reserved time slot. Implement this with the booking repository before enabling deletion.",
    501
  );
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getBookingById,
  updateCustomerBooking,
  deleteCustomerBooking
};