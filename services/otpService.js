const crypto = require("crypto");
const axios = require("axios");

const otpRepository = require("../repositories/otpRepository");

const OTP_EXPIRY = 5 * 60 * 1000;
const RESEND_COOLDOWN = 60 * 1000;

const normalizePhone = (phone) => {
  const value = String(phone || "").replace(/[\s-]/g, "");

  let normalized;

  if (/^[6-9]\d{9}$/.test(value)) {
    normalized = `91${value}`;
  } else if (/^91[6-9]\d{9}$/.test(value)) {
    normalized = value;
  } else if (/^\+91[6-9]\d{9}$/.test(value)) {
    normalized = value.substring(1);
  } else {
    throw new Error("Please enter a valid Indian phone number");
  }

  return normalized;
};

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOtp = (phone, otp) => {
  if (!process.env.OTP_SECRET || process.env.OTP_SECRET.length < 32) {
    throw new Error("OTP_SECRET must be at least 32 characters");
  }

  return crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(`${phone}:${otp}`)
    .digest("hex");
};

const sendSms = async (phone, otp) => {
  const {
    MSG91_AUTH_KEY,
    MSG91_TEMPLATE_ID,
    MSG91_SENDER_ID,
  } = process.env;

  if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID || !MSG91_SENDER_ID) {
    throw new Error("MSG91 configuration is missing");
  }

  const response = await axios.post(
    "https://control.msg91.com/api/v5/flow/",
    {
      template_id: MSG91_TEMPLATE_ID,
      sender: MSG91_SENDER_ID,
      short_url: "0",
      mobiles: phone,
      var1: otp,
    },
    {
      headers: {
        authkey: MSG91_AUTH_KEY,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );

  return response.data;
};

const sendOtp = async (phoneNumber) => {
  const phone = normalizePhone(phoneNumber);

  const otp = generateOtp();
  const otpHash = hashOtp(phone, otp);

  const now = Date.now();

  const expiresAt = new Date(now + OTP_EXPIRY);
  const resendAvailableAt = new Date(now + RESEND_COOLDOWN);

  try {
    await otpRepository.saveOtp(
      phone,
      otpHash,
      expiresAt,
      resendAvailableAt
    );
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Please wait 60 seconds before requesting another OTP");
    }

    throw error;
  }

  try {
    await sendSms(phone, otp);
  } catch (error) {
    // Remove only this request's OTP if the SMS provider fails.
    await otpRepository.deleteOtp(phone, otpHash);

    throw new Error("Unable to send OTP. Please try again");
  }

  return {
    phone: `+${phone}`,
    expiresIn: 300,
    resendAfter: 60,
  };
};

module.exports = {
  sendOtp,
};