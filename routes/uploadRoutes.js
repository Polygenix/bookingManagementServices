const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const uploadController = require("../controllers/uploadController");

const { authenticate } = require("../middleware/auth");

router.post(
  "/",
  authenticate,
  (req, res, next) => {
    upload.single("file")(req, res, (error) => {
      if (error) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.code === "LIMIT_FILE_SIZE"
            ? "File size cannot exceed 5 MB"
            : error.message
        });
      }

      next();
    });
  },
  uploadController.uploadFile
);

module.exports = router;