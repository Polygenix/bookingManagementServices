const mongoose = require("mongoose");
const testRepository = require("../repositories/testRepository");

// Create Test
const createTest = async (data) => {
  const {
    testName,
    description,
    price,
    preparationInstructions,
    duration
  } = data;

  if (
    !testName ||
    typeof testName !== "string" ||
    price === undefined ||
    !duration
  ) {
    const error = new Error(
      "Test name, price and duration are required"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    const error = new Error("Invalid test price");
    error.statusCode = 400;
    throw error;
  }

  return await testRepository.createTest({
    testName,
    description,
    price,
    preparationInstructions,
    duration
  });
};

// Get All Tests
const getAllTests = async () => {
  return await testRepository.getAllTests();
};

// Get Test By ID
const getTestById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid test ID");
    error.statusCode = 400;
    throw error;
  }

  const test = await testRepository.getTestById(id);

  if (!test) {
    const error = new Error("Test not found");
    error.statusCode = 404;
    throw error;
  }

  return test;
};

module.exports = {
  createTest,
  getAllTests,
  getTestById
};