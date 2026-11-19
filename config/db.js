
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const Payment = require("../models/Payment");

    await Payment.collection.updateMany(
      { razorpayPaymentId: null },
      { $unset: { razorpayPaymentId: "" } }
    );

    try {
      await Payment.collection.dropIndex("razorpayPaymentId_1");
    } catch (error) {
      if (error.codeName !== "IndexNotFound" && error.code !== 27) {
        throw error;
      }
    }

    await Payment.collection.createIndex(
      { razorpayPaymentId: 1 },
      {
        unique: true,
        partialFilterExpression: {
          razorpayPaymentId: { $type: "string" }
        },
        name: "unique_razorpay_payment_id"
      }
    );

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;


