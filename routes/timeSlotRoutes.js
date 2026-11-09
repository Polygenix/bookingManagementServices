const express = require("express");
const router = express.Router();

const timeSlotController = require("../controllers/timeSlotController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate, authorize("admin"));

router.post("/", timeSlotController.createTimeSlot);

router.get("/", timeSlotController.getAllTimeSlots);

router.get("/:id", timeSlotController.getTimeSlotById);

router.put("/:id", timeSlotController.updateTimeSlot);

router.delete("/:id", timeSlotController.deleteTimeSlot);

module.exports = router;