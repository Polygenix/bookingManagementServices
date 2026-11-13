
const express = require("express");
const rateLimit = require("express-rate-limit");
const otpController = require("../controllers/otpController");

const router = express.Router();

const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again later.",
  },
});

const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts. Please try again later.",
  },
});

router.post("/send", sendOtpLimiter, otpController.sendOtp);
router.post("/verify", verifyOtpLimiter, otpController.verifyOtp);

module.exports = router;
