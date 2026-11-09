
const express = require("express");
const router = express.Router();

const customerTestController = require("../controllers/customerTestController");
const { authenticate, authorize } = require("../middleware/auth");

// Get All Active Tests
router.get(
  "/",
  authenticate,
  authorize("customer"),
  customerTestController.getAllActiveTests
);

// Get Active Test Details
router.get(
  "/:id",
  authenticate,
  authorize("customer"),
  customerTestController.getActiveTestById
);

module.exports = router;
