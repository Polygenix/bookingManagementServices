
const mongoose = require("mongoose");

const bookingRepository = require("../repositories/bookingRepository");
const TimeSlot = require("../models/TimeSlot");
const Address = require("../models/Address");
const Test = require("../models/Test");

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
    testId,
    age,
    gender,
    phone,
    email,
    bookingDate,
    timeSlotId,
    addressId,
    notes,
  } = data;

  if (
    !patientName ||
    (!testId && !testName) ||
    !age ||
    !gender ||
    !phone ||
    !email ||
    !bookingDate ||
    !timeSlotId ||
    !addressId
  ) {
    throwError("All required booking fields must be provided", 400);
  }

  if (testId && !mongoose.Types.ObjectId.isValid(testId)) {
    throwError("Invalid test ID", 400);
  }

  if (!testId && typeof testName !== "string") {
    throwError("Invalid test name", 400);
  }

  const test = testId
    ? await Test.findOne({ _id: testId, isActive: true })
    : await Test.findOne({
        testName: testName.trim(),
        isActive: true
      });

  if (!test) {
    throwError("Test not found or inactive", 404);
  }

  if (!Number.isInteger(Number(age)) || age < 1 || age > 120) {
    throwError("Age must be between 1 and 120", 400);
  }

  if (!["Male", "Female", "Other"].includes(gender)) {
    throwError("Invalid gender", 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throwError("Invalid email address", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(timeSlotId)) {
    throwError("Invalid timeSlotId", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throwError("Invalid addressId", 400);
  }

  const selectedDate = new Date(bookingDate);

  if (Number.isNaN(selectedDate.getTime())) {
    throwError("Invalid booking date", 400);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalizedBookingDate = new Date(selectedDate);
  normalizedBookingDate.setHours(0, 0, 0, 0);
  const slotDate = selectedDate.toISOString().slice(0, 10);

  if (normalizedBookingDate < today) {
    throwError("Booking date cannot be in the past", 400);
  }

  // VERIFY CUSTOMER ADDRESS
  const address = await Address.findOne({
    _id: addressId,
    customer: customerId,
  });

  if (!address) {
    throwError("Address not found or does not belong to customer", 404);
  }

  // RESERVE TIME SLOT
  const reservedSlot = await TimeSlot.findOneAndUpdate(
    {
      _id: timeSlotId,
      date: slotDate,
      isActive: true,
      $expr: {
        $lt: ["$bookedCount", "$capacity"],
      },
    },
    {
      $inc: {
        bookedCount: 1,
      },
    },
    {
      new: true,
    }
  );

  if (!reservedSlot) {
    throwError("Selected time slot is unavailable", 400);
  }

  try {
    const booking = await bookingRepository.createBooking({
      customer: customerId,
      patientName,
      testName: test.testName,
      testId: test._id,
      amount: test.price,
      age: Number(age),
      gender,
      phone,
      email: email.toLowerCase(),
      bookingDate: normalizedBookingDate,
      timeSlotId: reservedSlot._id,
      timeSlot: `${reservedSlot.startTime}-${reservedSlot.endTime}`,
      addressId,
      notes: notes || "",
    });

    return await bookingRepository.findBookingById(
      booking._id,
      customerId
    );
  } catch (error) {
    // RELEASE SLOT IF BOOKING CREATION FAILS
    await TimeSlot.updateOne(
      {
        _id: reservedSlot._id,
        bookedCount: { $gt: 0 },
      },
      {
        $inc: { bookedCount: -1 },
      }
    );

    throw error;
  }
};

// GET CUSTOMER BOOKINGS
const getCustomerBookings = async (customerId) => {
  return await bookingRepository.findBookingsByCustomer(customerId);
};

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
    "testId",
    "age",
    "gender",
    "phone",
    "email",
    "notes",
  ];

  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  if (updateData.age !== undefined) {
    if (
      !Number.isInteger(Number(updateData.age)) ||
      updateData.age < 1 ||
      updateData.age > 120
    ) {
      throwError("Age must be between 1 and 120", 400);
    }

    updateData.age = Number(updateData.age);
  }

  if (
    updateData.gender !== undefined &&
    !["Male", "Female", "Other"].includes(updateData.gender)
  ) {
    throwError("Invalid gender", 400);
  }

  if (updateData.email !== undefined) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) {
      throwError("Invalid email address", 400);
    }

    updateData.email = updateData.email.toLowerCase();
  }

  if (updateData.testId !== undefined || updateData.testName !== undefined) {
    let test;

    if (updateData.testId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(updateData.testId)) {
        throwError("Invalid test ID", 400);
      }

      test = await Test.findOne({
        _id: updateData.testId,
        isActive: true
      });
    } else {
      if (typeof updateData.testName !== "string") {
        throwError("Invalid test name", 400);
      }

      test = await Test.findOne({
        testName: updateData.testName.trim(),
        isActive: true
      });
    }

    if (!test) {
      throwError("Test not found or inactive", 404);
    }

    updateData.testId = test._id;
    updateData.testName = test.testName;
    updateData.amount = test.price;
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

  const booking = await bookingRepository.deleteBooking(
    bookingId,
    customerId
  );

  if (!booking) {
    throwError("Booking not found", 404);
  }

  return booking;
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getBookingById,
  updateCustomerBooking,
  deleteCustomerBooking,
};
