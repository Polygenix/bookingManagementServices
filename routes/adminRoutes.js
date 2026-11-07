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

module.exports = router;