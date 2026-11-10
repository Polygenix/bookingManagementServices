const Payment = require("../models/Payment");

const createPayment = async (data) => {
  return await Payment.create(data);
};

const findByOrderId = async (orderId) => {
  return await Payment.findOne({ razorpayOrderId: orderId });
};

const findByBookingAndStatus = async (bookingId, status) => {
  return await Payment.findOne({ booking: bookingId, status }).sort({
    createdAt: -1
  });
};

const findByPaymentId = async (paymentId) => {
  return await Payment.findOne({ razorpayPaymentId: paymentId });
};

const findById = async (id) => {
  return await Payment.findById(id).populate("booking");
};

const updatePayment = async (id, data) => {
  return await Payment.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
};

module.exports = {
  createPayment,
  findByOrderId,
  findByBookingAndStatus,
  findByPaymentId,
  findById,
  updatePayment
};