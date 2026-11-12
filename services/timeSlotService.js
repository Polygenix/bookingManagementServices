const mongoose = require("mongoose");
const timeSlotRepository = require("../repositories/timeSlotRepository");

const throwError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

// Validate Time Slot
const validateSlot = (data) => {
  const { date, startTime, endTime, capacity } = data;

  if (!date || !startTime || !endTime || capacity === undefined) {
    throwError("All time slot fields are required", 400);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throwError("Date must be YYYY-MM-DD format", 400);
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    throwError("Invalid date", 400);
  }

  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throwError("Time must be HH:mm format", 400);
  }

  if (startTime >= endTime) {
    throwError("End time must be later than start time", 400);
  }

  if (!Number.isInteger(capacity) || capacity < 1) {
    throwError("Capacity must be a positive integer", 400);
  }
};

// Create Time Slot
const createTimeSlot = async (data) => {
  validateSlot(data);

  const duplicate = await timeSlotRepository.findDuplicateSlot(
    data.date,
    data.startTime,
    data.endTime
  );

  if (duplicate) {
    throwError("This time slot already exists", 409);
  }

  return await timeSlotRepository.createTimeSlot(data);
};

// Get All Time Slots
const getAllTimeSlots = async (date) => {
  const filter = {};

  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throwError("Invalid date format", 400);
    }

    filter.date = date;
  }

  return await timeSlotRepository.getAllTimeSlots(filter);
};

// Get Time Slot By ID
const getTimeSlotById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throwError("Invalid time slot ID", 400);
  }

  const slot = await timeSlotRepository.getTimeSlotById(id);

  if (!slot) {
    throwError("Time slot not found", 404);
  }

  return slot;
};

// Update Time Slot
const updateTimeSlot = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throwError("Invalid time slot ID", 400);
  }

  const existingSlot = await timeSlotRepository.getTimeSlotById(id);

  if (!existingSlot) {
    throwError("Time slot not found", 404);
  }

  const updatedData = {
    date: data.date ?? existingSlot.date,
    startTime: data.startTime ?? existingSlot.startTime,
    endTime: data.endTime ?? existingSlot.endTime,
    capacity: data.capacity ?? existingSlot.capacity,
    isActive: data.isActive ?? existingSlot.isActive
  };

  validateSlot(updatedData);

  if (updatedData.capacity < existingSlot.bookedCount) {
    throwError("Capacity cannot be less than booked count", 400);
  }

  const duplicate = await timeSlotRepository.findDuplicateSlot(
    updatedData.date,
    updatedData.startTime,
    updatedData.endTime,
    id
  );

  if (duplicate) {
    throwError("This time slot already exists", 409);
  }

  return await timeSlotRepository.updateTimeSlot(id, updatedData);
};

// Delete Time Slot
const deleteTimeSlot = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throwError("Invalid time slot ID", 400);
  }

  const slot = await timeSlotRepository.getTimeSlotById(id);

  if (!slot) {
    throwError("Time slot not found", 404);
  }

  return await timeSlotRepository.deleteTimeSlot(id);
};

module.exports = {
  createTimeSlot,
  getAllTimeSlots,
  getTimeSlotById,
  updateTimeSlot,
  deleteTimeSlot
};