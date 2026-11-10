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

// ADMIN GET ALL REPORTS
const getAllReports = async (req, res) => {
  try {
    const reports = await reportService.getAllReports();

    return res.status(200).json({
      success: true,
      message: "All reports fetched successfully",
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await reportService.deleteReport(req.params.reportId);

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully",
      data: report,
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
  getAllReports,
  deleteReport,
};
