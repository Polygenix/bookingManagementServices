
const otpService = require("../services/otpService");

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await otpService.sendOtp(email);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: result,
    });
  } catch (error) {
    const message = error.message || "Unable to send OTP";

    const status = message.startsWith("Please wait")
      ? 429
      : message.startsWith("Invalid email")
        ? 400
        : message.startsWith("Missing environment") ||
          message.startsWith("OTP_SECRET")
          ? 500
          : 502;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const result = await otpService.verifyOtp(email, otp);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: result,
    });
  } catch (error) {
    const message = error.message || "OTP verification failed";

    const status =
      message === "Invalid email address" ||
      message === "Invalid OTP"
        ? 400
        : message === "OTP not found or expired" ||
          message === "OTP expired" ||
          message === "Incorrect OTP" ||
          message.startsWith("Maximum OTP attempts") ||
          message === "OTP already used or invalid"
          ? 400
          : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
};
