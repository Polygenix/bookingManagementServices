const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const { authenticate, authorize } = require("../middleware/auth");

router.post(
  "/create-order",
  authenticate,
  authorize("customer"),
  paymentController.createOrder
);

router.post(
  "/verify",
  authenticate,
  authorize("customer"),
  paymentController.verifyPayment
);

router.get(
  "/:id",
  authenticate,
  authorize("customer"),
  paymentController.getPaymentById
);

module.exports = router;