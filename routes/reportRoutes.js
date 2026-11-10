const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");
const {
  authenticate,
  authorize,
} = require("../middleware/auth");

router.post(
  "/upload",
  authenticate,
  authorize("admin"),
  reportController.uploadReport
);


router.get(
  "/fetchAllReports",
  authenticate,
  authorize("admin"),
  reportController.getAllReports
);

router.delete(
  "/deleteReports/:reportId",
  authenticate,
  authorize("admin"),
  reportController.deleteReport
);

module.exports = router;