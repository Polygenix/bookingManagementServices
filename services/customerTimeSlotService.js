const mongoose = require("mongoose");

const customerTimeSlotRepository = require("../repositories/customerTimeSlotRepository");

const throwError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

// Get all available time slots
const getAvailableTimeSlots = async (date) => {

  if (!date) {
    throwError("Date is required", 400);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throwError("Invalid date format. Use YYYY-MM-DD", 400);
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    throwError("Invalid date", 400);
  }

  const slots =
    await customerTimeSlotRepository.getAvailableTimeSlots(date);

  return slots.map((slot) => ({
    ...slot.toObject(),
    availableSeats: slot.capacity - slot.bookedCount,
    isAvailable: true
  }));
};

// Get available time slot by ID
const getAvailableTimeSlotById = async (id) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throwError("Invalid time slot ID", 400);
  }

  const slot =
    await customerTimeSlotRepository.getAvailableTimeSlotById(id);

  if (!slot) {
    throwError("Time slot not found or unavailable", 404);
  }

  return {
    ...slot.toObject(),
    availableSeats: slot.capacity - slot.bookedCount,
    isAvailable: true
  };
};

module.exports = {
  getAvailableTimeSlots,
  getAvailableTimeSlotById
};