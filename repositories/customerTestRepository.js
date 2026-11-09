
const Test = require("../models/Test");

// Get Active Tests
const getAllActiveTests = async () => {
  return await Test.find({ isActive: true })
    .sort({ createdAt: -1 });
};

// Get Active Test By ID
const getActiveTestById = async (id) => {
  return await Test.findOne({
    _id: id,
    isActive: true
  });
};

module.exports = {
  getAllActiveTests,
  getActiveTestById
};
