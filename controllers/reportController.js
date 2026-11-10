const reportService = require("../services/reportService");

const uploadReport = async (req, res) => {
  try {
    const report = await reportService.uploadReport(
      req.user._id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Report URL added successfully",
      data: report,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReportsByBooking = async (req, res) => {
  try {
    const reports = await reportService.getReportsByBooking(
      req.params.bookingId
    );

    return res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      data: reports,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadReport,
  getReportsByBooking,
};