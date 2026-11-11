const paymentService = require("../services/paymentService");

const getCustomerId = (req) => req.user.id || req.user._id;

const getAllPayments = async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();

    return res.status(200).json({
      success: true,
      message: "All payments fetched successfully",
      count: payments.length,
      data: payments
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const result = await paymentService.createOrder(
      req.body.bookingId,
      getCustomerId(req)
    );

    return res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      data: result
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const payment = await paymentService.verifyPayment(
      req.body,
      getCustomerId(req)
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: payment
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(
      req.params.id,
      getCustomerId(req)
    );

    return res.status(200).json({
      success: true,
      message: "Payment details fetched successfully",
      data: payment
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllPayments,
  createOrder,
  verifyPayment,
  getPaymentById
};