const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Test = require("../models/Test");
const paymentRepository = require("../repositories/paymentRepository");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (bookingId, customerId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    const error = new Error("Invalid booking ID");
    error.statusCode = 400;
    throw error;
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  // Assumption: booking.customer stores the customer's MongoDB ID.
  if (String(booking.customer) !== String(customerId)) {
    const error = new Error("You are not authorized for this booking");
    error.statusCode = 403;
    throw error;
  }

  let amountInRupees = booking.amount;

  if (amountInRupees === undefined || amountInRupees === null) {
    let catalogTest = booking.testId
      ? await Test.findById(booking.testId)
      : null;
    let matchingTests = catalogTest ? [catalogTest] : [];

    if (!catalogTest && typeof booking.testName === "string") {
      const escapedTestName = booking.testName
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      matchingTests = await Test.find({
        testName: new RegExp(`^\\s*${escapedTestName}\\s*$`, "i")
      }).limit(2);
    }

    if (matchingTests.length > 1) {
      const error = new Error(
        "Multiple catalog tests match this booking; update the booking test before payment"
      );
      error.statusCode = 409;
      throw error;
    }

    catalogTest = matchingTests[0];

    if (!catalogTest) {
      const error = new Error(
        `No catalog price found for booking test "${booking.testName}"`
      );
      error.statusCode = 400;
      throw error;
    }

    amountInRupees = catalogTest.price;

    await Booking.updateOne(
      {
        _id: booking._id,
        $or: [{ amount: { $exists: false } }, { amount: null }]
      },
      { $set: { amount: amountInRupees } }
    );
  }

  amountInRupees = Number(amountInRupees);

  if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
    const error = new Error(
      "Booking amount must be greater than zero to create a payment order"
    );
    error.statusCode = 400;
    throw error;
  }

  const existingPaidPayment = await paymentRepository.findByOrderId(
    booking.razorpayOrderId
  );

  if (existingPaidPayment?.status === "paid") {
    const error = new Error("This booking has already been paid");
    error.statusCode = 409;
    throw error;
  }

  const amountInPaise = Math.round(amountInRupees * 100);

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `booking_${booking._id}`,
    notes: {
      bookingId: String(booking._id),
      customerId: String(customerId)
    }
  });

  const payment = await paymentRepository.createPayment({
    booking: booking._id,
    customer: customerId,
    razorpayOrderId: order.id,
    amount: amountInPaise,
    currency: order.currency,
    status: "pending"
  });

  return {
    paymentId: payment._id,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID
  };
};

const verifyPayment = async (data, customerId) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    const error = new Error("Payment verification details are required");
    error.statusCode = 400;
    throw error;
  }

  const payment = await paymentRepository.findByOrderId(razorpay_order_id);

  if (!payment) {
    const error = new Error("Payment order not found");
    error.statusCode = 404;
    throw error;
  }

  if (String(payment.customer) !== String(customerId)) {
    const error = new Error("You are not authorized for this payment");
    error.statusCode = 403;
    throw error;
  }

  if (payment.status === "paid") {
    return payment;
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const signatureBuffer = Buffer.from(generatedSignature);
  const receivedBuffer = Buffer.from(razorpay_signature);

  if (
    signatureBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, receivedBuffer)
  ) {
    const error = new Error("Invalid payment signature");
    error.statusCode = 400;
    throw error;
  }

  const updatedPayment = await paymentRepository.updatePayment(payment._id, {
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    status: "paid"
  });

  // Assumption: your Booking model has a status field.
  await Booking.findByIdAndUpdate(payment.booking, {
    status: "confirmed"
  });

  return updatedPayment;
};

const getPaymentById = async (paymentId, customerId) => {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    const error = new Error("Invalid payment ID");
    error.statusCode = 400;
    throw error;
  }

  const payment = await paymentRepository.findById(paymentId);

  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  if (String(payment.customer) !== String(customerId)) {
    const error = new Error("You are not authorized to view this payment");
    error.statusCode = 403;
    throw error;
  }

  return payment;
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentById
};