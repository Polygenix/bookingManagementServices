const Otp = require("../models/otpModel");

const findByPhone = async (phone) => {
  return Otp.findOne({ phone }).select("+otpHash");
};

const saveOtp = async (phone, otpHash, expiresAt, resendAvailableAt) => {
  return Otp.findOneAndUpdate(
    {
      phone,
      $or: [
        { resendAvailableAt: { $lte: new Date() } },
        { resendAvailableAt: { $exists: false } },
      ],
    },
    {
      $set: {
        otpHash,
        expiresAt,
        resendAvailableAt,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
};

const deleteOtp = async (phone, otpHash) => {
  return Otp.deleteOne({ phone, otpHash });
};

module.exports = {
  findByPhone,
  saveOtp,
  deleteOtp,
};