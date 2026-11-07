
const authRepository = require("../repositories/authRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

module.exports = {
  register,
  login
};
