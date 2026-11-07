
const User = require("../models/User");

const createUser = async (data) => {
  return User.create(data);
};

const findByEmail = async (email) => {
  return User.findOne({ email }).select("+password");
};

const findById = async (id) => {
  return User.findById(id);
};

const emailExists = async (email) => {
  return User.exists({ email });
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  emailExists
};
