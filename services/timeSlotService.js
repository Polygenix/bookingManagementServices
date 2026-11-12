const mongoose = require("mongoose");
const timeSlotRepository = require("../repositories/timeSlotRepository");

const throwError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const isValidDate = (date) => {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === date;
};

// Validate Time Slot
const validateSlot = (data) => {
  const { date, startTime, endTime, capacity } = data;

  if (!date || !startTime || !endTime || capacity === undefined) {
    throwError("All time slot fields are required", 400);
  }

  if (!isValidDate(date)) {
    throwError("Date must be YYYY-MM-DD format", 400);
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

  if (data.isActive !== undefined && typeof data.isActive !== "boolean") {
    throwError("isActive must be true or false", 400);
  }
};

// Create Time Slot
const createTimeSlot = async (data) => {
  validateSlot(data);

  return await timeSlotRepository.withScheduleLock(data.date, async (session) => {
    const overlap = await timeSlotRepository.findOverlappingSlot(
      data.date,
      data.startTime,
      data.endTime,
      null,
      session
    );

    if (overlap) {
      throwError("Time slots cannot overlap", 409);
    }

    return await timeSlotRepository.createTimeSlot({
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      capacity: data.capacity,
      ...(data.isActive !== undefined && { isActive: data.isActive })
    }, session);
  });
};

// Get All Time Slots
const getAllTimeSlots = async (date) => {
  const filter = {};

  if (date) {
    if (!isValidDate(date)) {
      throwError("Invalid date", 400);
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

  const scheduleChanged =
    updatedData.date !== existingSlot.date ||
    updatedData.startTime !== existingSlot.startTime ||
    updatedData.endTime !== existingSlot.endTime;

  if (scheduleChanged && existingSlot.bookedCount > 0) {
    throwError("A time slot with bookings cannot be rescheduled", 409);
  }

  return await timeSlotRepository.withScheduleLock(
    updatedData.date,
    async (session) => {
      const overlap = await timeSlotRepository.findOverlappingSlot(
        updatedData.date,
        updatedData.startTime,
        updatedData.endTime,
        id,
        session
      );

      if (overlap) {
        throwError("Time slots cannot overlap", 409);
      }

      const slot = await timeSlotRepository.updateTimeSlot(
        id,
        updatedData,
        scheduleChanged,
        session
      );

      if (!slot) {
        throwError(
          "Time slot changed or capacity was reserved; retry the update",
          409
        );
      }

      return slot;
    }
  );
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

  if (slot.bookedCount > 0) {
    throwError("Cannot delete time slot with existing bookings", 400);
  }

  const deletedSlot = await timeSlotRepository.deleteTimeSlot(id);

  if (!deletedSlot) {
    throwError("Time slot has bookings and cannot be deleted", 409);
  }

  return deletedSlot;
};

module.exports = {
  createTimeSlot,
  getAllTimeSlots,
  getTimeSlotById,
  updateTimeSlot,
  deleteTimeSlot
};