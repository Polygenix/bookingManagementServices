
const customerTestService = require("../services/customerTestService");

// Get All Active Tests
const getAllActiveTests = async (req, res) => {
  try {
    const tests = await customerTestService.getAllActiveTests();

    return res.status(200).json({
      success: true,
      message: "Active tests fetched successfully",
      total: tests.length,
      data: tests
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Active Test By ID
const getActiveTestById = async (req, res) => {
  try {
    const test = await customerTestService.getActiveTestById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Test details fetched successfully",
      data: test
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllActiveTests,
  getActiveTestById
};
