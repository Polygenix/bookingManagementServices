
const Otp = require("../models/otpModel");

const findByEmail = async (email) => {
  return Otp.findOne({ email }).select("+otpHash");
};

const saveOtp = async (email, otpHash, expiresAt, resendAvailableAt) => {
  return Otp.findOneAndUpdate(
    {
      email,
      resendAvailableAt: { $lte: new Date() },
    },
    {
      $set: {
        otpHash,
        expiresAt,
        resendAvailableAt,
        attempts: 0,
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

const incrementAttempts = async (email) => {
  return Otp.findOneAndUpdate(
    { email },
    { $inc: { attempts: 1 } },
    { new: true }
  );
};

const deleteOtp = async (email, otpHash) => {
  return Otp.deleteOne({ email, otpHash });
};

module.exports = {
  findByEmail,
  saveOtp,
  incrementAttempts,
  deleteOtp,
};
