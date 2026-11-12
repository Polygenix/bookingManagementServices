const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Test = require("../models/Test");
const Payment = require("../models/Payment");
const paymentRepository = require("../repositories/paymentRepository");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PAYMENT_ORDER_LOCK_MS = 5 * 60 * 1000;

const paymentOrderResponse = (payment) => ({
  paymentId: payment._id,
  orderId: payment.razorpayOrderId,
  amount: payment.amount,
  currency: payment.currency,
  keyId: process.env.RAZORPAY_KEY_ID
});

const getAllPayments = async () => {
  return await paymentRepository.findAllPayments();
};

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

  if (booking.status !== "pending") {
    const error = new Error("Only pending bookings can be paid");
    error.statusCode = 409;
    throw error;
  }

  const existingPaidPayment = await paymentRepository.findByBookingAndStatus(
    booking._id,
    "paid"
  );

  if (existingPaidPayment) {
    const error = new Error("This booking has already been paid");
    error.statusCode = 409;
    throw error;
  }

  const lockToken = crypto.randomUUID();
  const now = new Date();
  const lockUntil = new Date(now.getTime() + PAYMENT_ORDER_LOCK_MS);
  const lockedBooking = await Booking.findOneAndUpdate(
    {
      _id: booking._id,
      customer: customerId,
      status: "pending",
      $or: [
        { paymentOrderLockUntil: { $exists: false } },
        { paymentOrderLockUntil: null },
        { paymentOrderLockUntil: { $lte: now } }
      ]
    },
    {
      $set: {
        paymentOrderLockToken: lockToken,
        paymentOrderLockUntil: lockUntil
      }
    },
    { new: true }
  );

  if (!lockedBooking) {
    const pendingPayment = await paymentRepository.findByBookingAndStatus(
      booking._id,
      "pending"
    );

    if (pendingPayment) {
      return paymentOrderResponse(pendingPayment);
    }

    const error = new Error("A payment order is already being created");
    error.statusCode = 409;
    throw error;
  }

  try {
    let amountInRupees = lockedBooking.amount;

    if (amountInRupees === undefined || amountInRupees === null) {
      let catalogTest = lockedBooking.testId
        ? await Test.findById(lockedBooking.testId)
        : null;
      let matchingTests = catalogTest ? [catalogTest] : [];

      if (!catalogTest && typeof lockedBooking.testName === "string") {
        const escapedTestName = lockedBooking.testName
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
          `No catalog price found for booking test "${lockedBooking.testName}"`
        );
        error.statusCode = 400;
        throw error;
      }

      amountInRupees = catalogTest.price;

      await Booking.updateOne(
        {
          _id: lockedBooking._id,
          paymentOrderLockToken: lockToken,
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

    const amountInPaise = Math.round(amountInRupees * 100);
    const existingPendingPayment =
      await paymentRepository.findByBookingAndStatus(
        lockedBooking._id,
        "pending"
      );

    if (existingPendingPayment) {
      if (
        existingPendingPayment.amount !== amountInPaise ||
        existingPendingPayment.currency !== "INR"
      ) {
        const error = new Error(
          "An existing pending payment has a different amount; resolve it before creating another order"
        );
        error.statusCode = 409;
        throw error;
      }

      return paymentOrderResponse(existingPendingPayment);
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `booking_${lockedBooking._id}`,
      notes: {
        bookingId: String(lockedBooking._id),
        customerId: String(customerId)
      }
    });

    const payment = await paymentRepository.createPayment({
      booking: lockedBooking._id,
      customer: customerId,
      razorpayOrderId: order.id,
      amount: amountInPaise,
      currency: order.currency,
      status: "pending"
    });

    return {
      ...paymentOrderResponse(payment),
      amount: order.amount
    };
  } finally {
    await Booking.updateOne(
      {
        _id: lockedBooking._id,
        paymentOrderLockToken: lockToken
      },
      {
        $unset: {
          paymentOrderLockToken: "",
          paymentOrderLockUntil: ""
        }
      }
    );
  }
};

const verifyPayment = async (data, customerId) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

  if (
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string" ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
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

  if (payment.status !== "pending" && payment.status !== "paid") {
    const error = new Error("Payment order is not in a payable state");
    error.statusCode = 409;
    throw error;
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

  if (payment.status === "paid") {
    if (payment.razorpayPaymentId !== razorpay_payment_id) {
      const error = new Error(
        "Payment order was already paid with another payment"
      );
      error.statusCode = 409;
      throw error;
    }
    return payment;
  }

  const session = await mongoose.startSession();
  let updatedPayment;

  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findById(payment.booking).session(session);

      if (!booking || !["pending", "confirmed"].includes(booking.status)) {
        const error = new Error("Booking cannot be confirmed for this payment");
        error.statusCode = 409;
        throw error;
      }

      updatedPayment = await Payment.findOneAndUpdate(
        { _id: payment._id, status: "pending" },
        {
          $set: {
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: "paid"
          }
        },
        { new: true, runValidators: true, session }
      );

      if (!updatedPayment) {
        const error = new Error("Payment state changed; retry verification");
        error.statusCode = 409;
        throw error;
      }

      if (booking.status === "pending") {
        const bookingUpdate = await Booking.updateOne(
          { _id: booking._id, status: "pending" },
          { $set: { status: "confirmed" } },
          { session }
        );

        if (bookingUpdate.modifiedCount !== 1) {
          const error = new Error(
            "Booking state changed during payment verification"
          );
          error.statusCode = 409;
          throw error;
        }
      }
    });
  } finally {
    await session.endSession();
  }

  if (updatedPayment) {
    return updatedPayment;
  }

  const currentPayment = await paymentRepository.findByOrderId(razorpay_order_id);
  if (
    currentPayment?.status === "paid" &&
    currentPayment.razorpayPaymentId === razorpay_payment_id
  ) {
    return currentPayment;
  }

  const error = new Error("Payment state changed; retry verification");
  error.statusCode = 409;
  throw error;
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
  getAllPayments,
  createOrder,
  verifyPayment,
  getPaymentById
};