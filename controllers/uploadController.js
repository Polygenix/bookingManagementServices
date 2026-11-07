const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file to upload"
      });
    }

    const protocol = req.get("x-forwarded-proto") || req.protocol;

    const fileUrl = `${protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        fileName: req.file.originalname,
        storedFileName: req.file.filename,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        fileUrl
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  uploadFile
};