
const authRepository = require("../repositories/authRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("./emailService");
const emailOtpRepository = require("../repositories/emailOtpRepository");

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER ADMIN OR CUSTOMER
const register = async (data) => {
  const { name, email, password, role } = data;

  if (!name || !email || !password || !role) {
    throw new Error("Name, email, password and role are required");
  }

  if (!["admin", "customer"].includes(role)) {
    throw new Error("Role must be either admin or customer");
  }

  if (password.length < 8) {
    throw new Error("Password must contain at least 8 characters");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await authRepository.emailExists(normalizedEmail);

  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await authRepository.createUser({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role
  });

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};

// LOGIN ADMIN OR CUSTOMER
const login = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await authRepository.findByEmail(
    email.trim().toLowerCase()
  );

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};

const sendOtp = async (data) => {
  const email = typeof data?.email === "string"
    ? data.email.trim().toLowerCase()
    : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error("A valid email is required");
    error.statusCode = 400;
    throw error;
  }

  const otpSecret = process.env.JWT_SECRET;

  if (!otpSecret) {
    const error = new Error("OTP verification is not configured");
    error.statusCode = 500;
    throw error;
  }

  const now = new Date();
  const existingOtp = await emailOtpRepository.findByEmail(email);

  if (
    existingOtp &&
    now.getTime() - existingOtp.lastSentAt.getTime() < OTP_RESEND_COOLDOWN_MS
  ) {
    const error = new Error("Please wait before requesting another OTP");
    error.statusCode = 429;
    throw error;
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const codeHash = crypto
    .createHmac("sha256", otpSecret)
    .update(`${email}:${otp}`)
    .digest("hex");

  try {
    await emailOtpRepository.saveOtp(
      email,
      codeHash,
      new Date(now.getTime() + OTP_EXPIRY_MS),
      now
    );
  } catch (cause) {
    if (cause.code === 11000) {
      const error = new Error("Please wait before requesting another OTP");
      error.statusCode = 429;
      throw error;
    }
    throw cause;
  }

  try {
    await sendEmail(
      email,
      "Your Booking Registration OTP",
      `<p>Your one-time password is <strong>${otp}</strong>.</p><p>It expires in 10 minutes. Do not share this code with anyone.</p>`
    );
  } catch (cause) {
    console.error("OTP email delivery failed:", cause.message);
    const error = new Error(
      cause.code === "EMAIL_CONFIG_MISSING"
        ? "Email service is not configured"
        : "Unable to send OTP email"
    );
    error.statusCode = cause.code === "EMAIL_CONFIG_MISSING" ? 500 : 502;
    throw error;
  }

  return { email };
};

const verifyOtp = async (data) => {
  const email = typeof data?.email === "string"
    ? data.email.trim().toLowerCase()
    : "";
  const otp = typeof data?.otp === "string" ? data.otp.trim() : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error("A valid email is required");
    error.statusCode = 400;
    throw error;
  }

  if (!/^\d{6}$/.test(otp)) {
    const error = new Error("OTP must be a 6-digit string");
    error.statusCode = 400;
    throw error;
  }

  const otpSecret = process.env.JWT_SECRET;

  if (!otpSecret) {
    const error = new Error("OTP verification is not configured");
    error.statusCode = 500;
    throw error;
  }

  const now = new Date();
  const storedOtp = await emailOtpRepository.findByEmail(email);

  if (!storedOtp || storedOtp.expiresAt <= now) {
    const error = new Error("OTP is invalid or expired");
    error.statusCode = 400;
    throw error;
  }

  if (storedOtp.attempts >= OTP_MAX_ATTEMPTS) {
    const error = new Error("Too many attempts; request a new OTP");
    error.statusCode = 429;
    throw error;
  }

  const codeHash = crypto
    .createHmac("sha256", otpSecret)
    .update(`${email}:${otp}`)
    .digest("hex");
  const expectedHash = Buffer.from(storedOtp.codeHash, "hex");
  const suppliedHash = Buffer.from(codeHash, "hex");

  if (expectedHash.length !== suppliedHash.length) {
    const error = new Error("Stored OTP is invalid");
    error.statusCode = 500;
    throw error;
  }

  if (!crypto.timingSafeEqual(expectedHash, suppliedHash)) {
    const updatedOtp = await emailOtpRepository.incrementAttempts(
      storedOtp._id,
      now,
      OTP_MAX_ATTEMPTS
    );

    const error = new Error(
      updatedOtp?.attempts >= OTP_MAX_ATTEMPTS
        ? "Too many attempts; request a new OTP"
        : "OTP is invalid"
    );
    error.statusCode = updatedOtp?.attempts >= OTP_MAX_ATTEMPTS ? 429 : 400;
    throw error;
  }

  const consumedOtp = await emailOtpRepository.consumeOtp(
    storedOtp._id,
    codeHash,
    now,
    OTP_MAX_ATTEMPTS
  );

  if (!consumedOtp) {
    const error = new Error("OTP is invalid or expired");
    error.statusCode = 400;
    throw error;
  }

  return { email, verified: true };
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp
};
