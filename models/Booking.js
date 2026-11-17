
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Link to saved patient profile
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    // Patient details snapshot at booking time
    patientName: {
      type: String,
      required: true,
      trim: true,
    },

    testName: {
      type: String,
      required: true,
      trim: true,
    },

    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
    },

    amount: {
      type: Number,
      min: 0,
    },

    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
      validate: {
        validator: function (value) {
          return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Invalid email address",
      },
    },

    bookingDate: {
      type: Date,
      required: true,
    },

    timeSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeSlot",
      required: true,
    },

    timeSlot: {
      type: String,
      required: true,
    },

    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
