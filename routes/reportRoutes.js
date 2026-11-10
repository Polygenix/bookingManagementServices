const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");
const { authenticate, authorize } = require("../middleware/auth");

router.post(
  "/upload",
  authenticate,
  authorize("admin"),
  reportController.uploadReport
);

router.get(
  "/booking/:bookingId",
  authenticate,
  authorize("admin"),
  reportController.getReportsByBooking
);

module.exports = router;