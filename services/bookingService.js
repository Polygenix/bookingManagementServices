
const mongoose = require("mongoose");

const bookingRepository = require("../repositories/bookingRepository");
const TimeSlot = require("../models/TimeSlot");
const Address = require("../models/Address");
const Test = require("../models/Test");
const Patient = require("../models/Patient");

const throwError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

// CREATE BOOKING
const createBooking = async (customerId, data) => {
  const {
    patientId,
    testName,
    testId,
    bookingDate,
    timeSlotId,
    addressId,
    notes,
  } = data;

  if (
    !patientId ||
    (!testId && !testName) ||
    !bookingDate ||
    !timeSlotId ||
    !addressId
  ) {
    throwError("Patient, test, date, time slot and address are required", 400);
  }

  // VALIDATE PATIENT ID
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    throwError("Invalid patient ID", 400);
  }

  // VERIFY PATIENT BELONGS TO LOGGED-IN CUSTOMER
  const patient = await Patient.findOne({
    _id: patientId,
    customer: customerId,
  });

  if (!patient) {
    throwError("Patient not found or does not belong to customer", 404);
  }

  // VALIDATE TEST
  if (testId && !mongoose.Types.ObjectId.isValid(testId)) {
    throwError("Invalid test ID", 400);
  }

  if (!testId && typeof testName !== "string") {
    throwError("Invalid test name", 400);
  }

  const test = testId
    ? await Test.findOne({
        _id: testId,
        isActive: true,
      })
    : await Test.findOne({
        testName: testName.trim(),
        isActive: true,
      });

  if (!test) {
    throwError("Test not found or inactive", 404);
  }

  // VALIDATE PATIENT DETAILS
  if (
    !patient.patientName ||
    !Number.isInteger(patient.age) ||
    patient.age < 1 ||
    patient.age > 120
  ) {
    throwError("Patient profile contains invalid details", 400);
  }

  if (!["Male", "Female", "Other"].includes(patient.gender)) {
    throwError("Invalid patient gender", 400);
  }

  if (!/^[6-9]\d{9}$/.test(patient.phone)) {
    throwError("Invalid patient mobile number", 400);
  }

  // VALIDATE SLOT AND ADDRESS IDS
  if (!mongoose.Types.ObjectId.isValid(timeSlotId)) {
    throwError("Invalid timeSlotId", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throwError("Invalid addressId", 400);
  }

  // VALIDATE BOOKING DATE
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
    // CREATE BOOKING USING SAVED PATIENT DETAILS
    const booking = await bookingRepository.createBooking({
      customer: customerId,

      patientId: patient._id,

      // Historical snapshot
      patientName: patient.patientName,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email || "",

      testName: test.testName,
      testId: test._id,
      amount: test.price,

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
        $inc: {
          bookedCount: -1,
        },
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

  // Patient details must be updated through Patient API.
  // Do not overwrite the historical patient snapshot.
  const allowedFields = [
    "testName",
    "testId",
    "notes",
  ];

  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    throwError("No valid booking fields provided for update", 400);
  }

  if (updateData.testId !== undefined || updateData.testName !== undefined) {
    let test;

    if (updateData.testId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(updateData.testId)) {
        throwError("Invalid test ID", 400);
      }

      test = await Test.findOne({
        _id: updateData.testId,
        isActive: true,
      });
    } else {
      if (typeof updateData.testName !== "string" || !updateData.testName.trim()) {
        throwError("Invalid test name", 400);
      }

      test = await Test.findOne({
        testName: updateData.testName.trim(),
        isActive: true,
      });
    }

    if (!test) {
      throwError("Test not found or inactive", 404);
    }

    updateData.testId = test._id;
    updateData.testName = test.testName;
    updateData.amount = test.price;
  }

  if (
    updateData.notes !== undefined &&
    typeof updateData.notes !== "string"
  ) {
    throwError("Invalid notes", 400);
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
