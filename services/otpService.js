
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const otpRepository = require("../repositories/otpRepository");

const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_VERIFY_ATTEMPTS = 5;

const getConfig = () => {
  if (process.env.RENDER && !process.env.RESEND_API_KEY) {
    throw new Error("Missing environment variable: RESEND_API_KEY");
  }

  const required = ["JWT_SECRET"];
  required.push(
    ...(process.env.RESEND_API_KEY
      ? ["EMAIL_FROM"]
      : ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"])
  );

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }
};

const normalizeEmail = (email) => {
  if (typeof email !== "string") {
    throw new Error("Invalid email address");
  }

  const normalized = email.trim().toLowerCase();

  if (
    normalized.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
  ) {
    throw new Error("Invalid email address");
  }

  return normalized;
};

const generateOtp = () =>
  crypto.randomInt(100000, 1000000).toString();

const hashOtp = (otp) =>
  crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(otp)
    .digest("hex");

const sendEmail = async (email, otp) => {
  const text = `Your Booking OTP is ${otp}. It is valid for 5 minutes. Do not share it with anyone.`;
  const html = `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px">
        <h2>Booking Email Verification</h2>
        <p>Your verification OTP is:</p>
        <h1 style="letter-spacing:8px">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
        <p>Do not share this OTP with anyone.</p>
      </div>
    `;

  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [email],
        subject: "Your Booking Verification OTP",
        text,
        html,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Resend email API failed with status ${response.status}: ${details}`
      );
    }

    return;
  }

  const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  await mailer.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Your Booking Verification OTP",
    text,
    html,
  });
};

const sendOtp = async (email) => {
  getConfig();

  email = normalizeEmail(email);

  const otp = generateOtp();
  const otpHash = hashOtp(otp);

  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000
  );
  const resendAvailableAt = new Date(
    now.getTime() + RESEND_COOLDOWN_SECONDS * 1000
  );

  try {
    await otpRepository.saveOtp(
      email,
      otpHash,
      expiresAt,
      resendAvailableAt
    );
  } catch (error) {
    if (error.code === 11000) {
      const existing = await otpRepository.findByEmail(email);

      if (existing && existing.resendAvailableAt > new Date()) {
        const seconds = Math.ceil(
          (existing.resendAvailableAt - new Date()) / 1000
        );

        throw new Error(`Please wait ${seconds} seconds before requesting another OTP`);
      }
    }

    throw error;
  }

  try {
    await sendEmail(email, otp);
  } catch (error) {
    console.error("OTP email delivery failed:", error.message);
    await otpRepository.deleteOtp(email, otpHash);
    throw new Error("Unable to send OTP email. Please try again.");
  }

  return {
    email,
    expiresIn: OTP_EXPIRY_MINUTES * 60,
    resendAfter: RESEND_COOLDOWN_SECONDS,
  };
};

const verifyOtp = async (email, otp) => {
  getConfig();

  email = normalizeEmail(email);

  if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
    throw new Error("Invalid OTP");
  }

  const record = await otpRepository.findByEmail(email);

  if (!record) {
    throw new Error("OTP not found or expired");
  }

  if (record.expiresAt <= new Date()) {
    await otpRepository.deleteOtp(email, record.otpHash);
    throw new Error("OTP expired");
  }

  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    await otpRepository.deleteOtp(email, record.otpHash);
    throw new Error("Maximum OTP attempts exceeded. Request a new OTP.");
  }

  const submittedHash = Buffer.from(hashOtp(otp), "hex");
  const storedHash = Buffer.from(record.otpHash, "hex");

  if (
    submittedHash.length !== storedHash.length ||
    !crypto.timingSafeEqual(submittedHash, storedHash)
  ) {
    const updated = await otpRepository.incrementAttempts(email);

    if (updated && updated.attempts >= MAX_VERIFY_ATTEMPTS) {
      await otpRepository.deleteOtp(email, record.otpHash);
      throw new Error("Maximum OTP attempts exceeded. Request a new OTP.");
    }

    throw new Error("Incorrect OTP");
  }

  const deleted = await otpRepository.deleteOtp(email, record.otpHash);

  if (deleted.deletedCount !== 1) {
    throw new Error("OTP already used or invalid");
  }

  return {
    email,
    verified: true,
  };
};

module.exports = {
  sendOtp,
  verifyOtp,
};
