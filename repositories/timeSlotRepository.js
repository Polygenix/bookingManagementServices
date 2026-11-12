const TimeSlot = require("../models/TimeSlot");
const TimeSlotScheduleLock = require("../models/TimeSlotScheduleLock");
const mongoose = require("mongoose");

const withScheduleLock = async (date, callback) => {
  try {
    await TimeSlotScheduleLock.updateOne(
      { _id: date },
      { $setOnInsert: { _id: date } },
      { upsert: true }
    );
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }
  }

  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const lockUpdate = await TimeSlotScheduleLock.updateOne(
        { _id: date },
        { $inc: { revision: 1 } },
        { session }
      );

      if (lockUpdate.modifiedCount !== 1) {
        const error = new Error("Unable to lock the time-slot schedule");
        error.statusCode = 409;
        throw error;
      }

      result = await callback(session);
    });
  } finally {
    await session.endSession();
  }

  return result;
};

// Create Time Slot
const createTimeSlot = async (data, session) => {
  const slot = new TimeSlot(data);
  return await slot.save({ session });
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
const updateTimeSlot = async (
  id,
  data,
  requireUnbooked = false,
  session
) => {
  const filter = {
    _id: id,
    bookedCount: { $lte: data.capacity }
  };

  if (requireUnbooked) {
    filter.bookedCount = 0;
  }

  return await TimeSlot.findOneAndUpdate(
    filter,
    { $set: data },
    {
      new: true,
      runValidators: true,
      session
    }
  );
};

// Delete Time Slot
const deleteTimeSlot = async (id) => {
  return await TimeSlot.findOneAndDelete({ _id: id, bookedCount: 0 });
};

const findOverlappingSlot = async (
  date,
  startTime,
  endTime,
  excludeId = null,
  session
) => {
  const filter = {
    date,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return await TimeSlot.findOne(filter).session(session);
};

module.exports = {
  withScheduleLock,
  createTimeSlot,
  getAllTimeSlots,
  getTimeSlotById,
  updateTimeSlot,
  deleteTimeSlot,
  findOverlappingSlot
};