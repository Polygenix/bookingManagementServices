const mongoose = require("mongoose");

const timeSlotScheduleLockSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    revision: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model(
  "TimeSlotScheduleLock",
  timeSlotScheduleLockSchema
);
