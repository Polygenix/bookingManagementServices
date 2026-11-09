const express = require("express");
const router = express.Router();

const customerTimeSlotController = require("../controllers/customerTimeSlotController");

const {
  authenticate,
  authorize
} = require("../middleware/auth");

// Customer authentication
router.use(authenticate, authorize("customer"));

// Get available time slots
router.get(
  "/",
  customerTimeSlotController.getAvailableTimeSlots
);

// Get available time slot by ID
router.get(
  "/:id",
  customerTimeSlotController.getAvailableTimeSlotById
);

module.exports = router;