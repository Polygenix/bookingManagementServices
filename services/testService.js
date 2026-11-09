
const mongoose = require("mongoose");
const testRepository = require("../repositories/testRepository");

// Create Test
const createTest = async (data) => {
  const {
    testName,
    description,
    imageUrl,
    price,
    preparationInstructions,
    duration,
    isActive
  } = data;

  if (!testName || price === undefined || !duration) {
    const error = new Error(
      "Test name, price and duration are required"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  ) {
    const error = new Error("Invalid test price");
    error.statusCode = 400;
    throw error;
  }

  return await testRepository.createTest({
    testName,
    description,
    imageUrl,
    price: Number(price),
    preparationInstructions,
    duration,
    ...(isActive !== undefined && { isActive })
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

// Update Test
const updateTest = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid test ID");
    error.statusCode = 400;
    throw error;
  }

  const allowedFields = [
    "testName",
    "description",
    "imageUrl",
    "price",
    "preparationInstructions",
    "duration",
    "isActive"
  ];

  const updateData = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    const error = new Error("No valid fields provided");
    error.statusCode = 400;
    throw error;
  }

  if (updateData.price !== undefined) {
    if (
      !Number.isFinite(Number(updateData.price)) ||
      Number(updateData.price) < 0
    ) {
      const error = new Error("Invalid test price");
      error.statusCode = 400;
      throw error;
    }

    updateData.price = Number(updateData.price);
  }

  const test = await testRepository.updateTest(id, updateData);

  if (!test) {
    const error = new Error("Test not found");
    error.statusCode = 404;
    throw error;
  }

  return test;
};

// Delete Test
const deleteTest = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid test ID");
    error.statusCode = 400;
    throw error;
  }

  const test = await testRepository.deleteTest(id);

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
  getTestById,
  updateTest,
  deleteTest
};
