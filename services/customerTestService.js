
const mongoose = require("mongoose");
const customerTestRepository = require("../repositories/customerTestRepository");

// Get Active Tests
const getAllActiveTests = async () => {
  return await customerTestRepository.getAllActiveTests();
};

// Get Active Test By ID
const getActiveTestById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid test ID");
    error.statusCode = 400;
    throw error;
  }

  const test = await customerTestRepository.getActiveTestById(id);

  if (!test) {
    const error = new Error("Test not found");
    error.statusCode = 404;
    throw error;
  }

  return test;
};

module.exports = {
  getAllActiveTests,
  getActiveTestById
};
