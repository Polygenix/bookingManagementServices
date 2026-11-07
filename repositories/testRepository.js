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

const updateTest = async (id, updateData) => {
  return await Test.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
};

const deleteTest = async (id) => {
  return await Test.findByIdAndDelete(id);
};

module.exports = {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest
};