
const mongoose = require("mongoose");

const contactEnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved"],
      default: "new"
    },
    emailSent: {
      type: Boolean,
      default: false
    },
    emailError: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

contactEnquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("ContactEnquiry", contactEnquirySchema);
