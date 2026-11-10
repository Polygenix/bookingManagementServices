const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");
const {
  authenticate,
  authorize,
} = require("../middleware/auth");

const { uploadReport } = require("../middleware/reportUploadMiddleware");

// Upload report
router.post(
  "/upload",
  authenticate,
  authorize("admin"),
  (req, res, next) => {
    uploadReport.single("report")(req, res, (error) => {
      if (error) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message:
            error.code === "LIMIT_FILE_SIZE"
              ? "Maximum report size is 10 MB"
              : error.message,
        });
      }

      next();
    });
  },
  reportController.uploadReport
);

// Get reports by booking ID
router.get(
  "/booking/:bookingId",
  authenticate,
  authorize("admin"),
  reportController.getReportsByBooking
);

// Download report
router.get(
  "/file/:reportId",
  authenticate,
  authorize("admin"),
  reportController.getReportFile
);

module.exports = router;