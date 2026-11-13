const otpService = require("../services/otpService");

const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const result = await otpService.sendOtp(phone);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: result,
    });
  } catch (error) {
    const statusCode =
      error.message.includes("wait 60 seconds") ? 429 :
      error.message.includes("valid Indian phone") ? 400 :
      error.message.includes("configuration is missing") ? 500 :
      502;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  sendOtp,
};