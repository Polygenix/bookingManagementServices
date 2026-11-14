const EmailOtp = require("../models/EmailOtp");

const findByEmail = async (email) => {
  return EmailOtp.findOne({ email }).lean();
};

const saveOtp = async (email, codeHash, expiresAt, lastSentAt) => {
  return EmailOtp.findOneAndUpdate(
    { email },
    {
      $set: {
        codeHash,
        expiresAt,
        attempts: 0,
        lastSentAt
      }
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  ).lean();
};

const incrementAttempts = async (id, now, maxAttempts) => {
  return EmailOtp.findOneAndUpdate(
    {
      _id: id,
      expiresAt: { $gt: now },
      attempts: { $lt: maxAttempts }
    },
    { $inc: { attempts: 1 } },
    { new: true }
  ).lean();
};

const consumeOtp = async (id, codeHash, now, maxAttempts) => {
  return EmailOtp.findOneAndDelete({
    _id: id,
    codeHash,
    expiresAt: { $gt: now },
    attempts: { $lt: maxAttempts }
  }).lean();
};

module.exports = {
  findByEmail,
  saveOtp,
  incrementAttempts,
  consumeOtp
};
