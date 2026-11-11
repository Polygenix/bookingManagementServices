const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");
const { authenticate, authorize } = require("../middleware/auth");

router.get(
  "/",
  authenticate,
  authorize("customer"),
  reportController.getCustomerReports
);

module.exports = router;
