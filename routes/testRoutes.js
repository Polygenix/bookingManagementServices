const express = require("express");
const router = express.Router();

const testController = require("../controllers/testController");

const {
  authenticate,
  authorize
} = require("../middleware/auth");

// Create Test
router.post(
  "/",
  authenticate,
  authorize("admin"),
  testController.createTest
);

// Get All Tests
router.get(
  "/",
  authenticate,
  authorize("admin"),
  testController.getAllTests
);

// Get Test By ID
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  testController.getTestById
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  testController.updateTest
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  testController.deleteTest
);

module.exports = router;