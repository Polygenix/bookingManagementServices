const Test = require("../models/Test");

// Create Test
const createTest = async (data) => {
  return await Test.create(data);
};

// Get All Tests
const getAllTests = async () => {
  return await Test.find().sort({ createdAt: -1 });
};

// Get Test By ID
const getTestById = async (id) => {
  return await Test.findById(id);
};

module.exports = {
  createTest,
  getAllTests,
  getTestById
};