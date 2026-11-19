const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true
    },
    razorpayPaymentId: {
      type: String
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "INR"
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    razorpaySignature: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

paymentSchema.index(
  { booking: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
    name: "one_pending_payment_per_booking"
  }
);

paymentSchema.index(
  { razorpayPaymentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      razorpayPaymentId: { $type: "string" }
    },
    name: "unique_razorpay_payment_id"
  }
);

module.exports = mongoose.model("Payment", paymentSchema);