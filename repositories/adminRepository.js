
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

// Update Test
const updateTest = async (id, updateData) => {
  return await Test.findByIdAndUpdate(
    id,
    { $set: updateData },
    {
      new: true,
      runValidators: true
    }
  );
};

// Delete Test
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
