const Payment = require("../models/Payment");

const createPayment = async (data) => {
  return await Payment.create(data);
};

const findByOrderId = async (orderId) => {
  return await Payment.findOne({ razorpayOrderId: orderId });
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
  findByPaymentId,
  findById,
  updatePayment
};