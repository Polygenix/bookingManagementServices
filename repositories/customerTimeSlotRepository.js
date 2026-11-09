const TimeSlot = require("../models/TimeSlot");

// Get available time slots by date
const getAvailableTimeSlots = async (date) => {
  return await TimeSlot.find({
    date,
    isActive: true,
    $expr: {
      $lt: ["$bookedCount", "$capacity"]
    }
  }).sort({ startTime: 1 });
};

// Get available time slot by ID
const getAvailableTimeSlotById = async (id) => {
  return await TimeSlot.findOne({
    _id: id,
    isActive: true,
    $expr: {
      $lt: ["$bookedCount", "$capacity"]
    }
  });
};

module.exports = {
  getAvailableTimeSlots,
  getAvailableTimeSlotById
};