const testService = require("../services/testService");

// Create Test
const createTest = async (req, res) => {
  try {
    const test = await testService.createTest(req.body);

    res.status(201).json({
      success: true,
      message: "Test created successfully",
      data: test
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Tests
const getAllTests = async (req, res) => {
  try {
    const tests = await testService.getAllTests();

    res.status(200).json({
      success: true,
      message: "Tests fetched successfully",
      count: tests.length,
      data: tests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Test By ID
const getTestById = async (req, res) => {
  try {
    const test = await testService.getTestById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Test fetched successfully",
      data: test
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createTest,
  getAllTests,
  getTestById
};