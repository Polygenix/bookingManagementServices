const TimeSlot = require("../models/TimeSlot");

// Create Time Slot
const createTimeSlot = async (data) => {
  return await TimeSlot.create(data);
};

// Get All Time Slots
const getAllTimeSlots = async (filter = {}) => {
  return await TimeSlot.find(filter).sort({
    date: 1,
    startTime: 1
  });
};

// Get Time Slot By ID
const getTimeSlotById = async (id) => {
  return await TimeSlot.findById(id);
};

// Update Time Slot
const updateTimeSlot = async (id, data) => {
  return await TimeSlot.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
};

// Delete Time Slot
const deleteTimeSlot = async (id) => {
  return await TimeSlot.findByIdAndDelete(id);
};

// Find Duplicate Time Slot
const findDuplicateSlot = async (date, startTime, endTime, excludeId = null) => {
  const filter = { date, startTime, endTime };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return await TimeSlot.findOne(filter);
};

module.exports = {
  createTimeSlot,
  getAllTimeSlots,
  getTimeSlotById,
  updateTimeSlot,
  deleteTimeSlot,
  findDuplicateSlot
};