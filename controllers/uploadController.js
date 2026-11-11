
const mongoose = require("mongoose");
const { Readable } = require("stream");
const getUploadBucket = require("../config/gridfs");

// UPLOAD FILE TO MONGODB
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file to upload"
      });
    }

    const bucket = getUploadBucket();

    const uploadStream = bucket.openUploadStream(
      req.file.originalname,
      {
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          fileSize: req.file.size,
          uploadedAt: new Date()
        }
      }
    );

    await new Promise((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);

      Readable.from(req.file.buffer).pipe(uploadStream);
    });

    const protocol =
      req.get("x-forwarded-proto") || req.protocol;

    const fileUrl =
      `${protocol}://${req.get("host")}/api/common/upload/${uploadStream.id}`;

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully to MongoDB",
      data: {
        fileId: uploadStream.id,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        fileUrl
      }
    });

  } catch (error) {
    console.error("Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "File upload failed"
    });
  }
};

// GET FILE FROM MONGODB
const getFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file ID"
      });
    }

    const bucket = getUploadBucket();
    const objectId = new mongoose.Types.ObjectId(fileId);

    const files = await bucket.find({
      _id: objectId
    }).toArray();

    if (!files.length) {
      return res.status(404).json({
        success: false,
        message: "File not found in MongoDB"
      });
    }

    const file = files[0];

    res.set("Content-Type",
      file.contentType || "application/octet-stream"
    );

    res.set("Content-Disposition", "inline");

    res.set("Cache-Control", "public, max-age=31536000, immutable");

    const downloadStream = bucket.openDownloadStream(objectId);

    downloadStream.on("error", (error) => {
      console.error("File Read Error:", error);

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Unable to read file"
        });
      } else {
        res.destroy(error);
      }
    });

    downloadStream.pipe(res);

  } catch (error) {
    console.error("Get File Error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message || "Unable to fetch file"
      });
    }
  }
};

module.exports = {
  uploadFile,
  getFile
};
