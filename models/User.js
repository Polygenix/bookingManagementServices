
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },

    role: {
      type: String,
      enum: ["admin", "customer"],
      required: [true, "Role is required"]
    },

    isActive: {
      type: Boolean,
      default: true
    },

    addressRevision: {
      type: Number,
      default: 0,
      select: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
