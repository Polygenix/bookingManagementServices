const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

const {
  authenticate,
  authorize
} = require("../middleware/auth");

router.get(
  "/bookings",
  authenticate,
  authorize("admin"),
  adminController.getAllBookings
);
router.get(
  "/bookings/:id",
  authenticate,
  authorize("admin"),
  adminController.getBookingById
);
router.put(
  "/bookings/:id/status",
  authenticate,
  authorize("admin"),
  adminController.updateBookingStatus
);
router.put(
  "/bookings/:id",
  authenticate,
  authorize("admin"),
  adminController.updateBooking
);

router.delete(
  "/bookings/:id",
  authenticate,
  authorize("admin"),
  adminController.deleteBooking
);

module.exports = router;