const Report = require("../models/Report");

const createReport = async (data) => {
  return await Report.create(data);
};

const findReportsByBooking = async (bookingId) => {
  return await Report.find({ bookingId })
    .populate("uploadedBy", "name email")
    .sort({ createdAt: -1 });
};

const findReportsByBookings = async (bookingIds) => {
  return await Report.find({ bookingId: { $in: bookingIds } })
    .populate("bookingId", "patientName testName bookingDate status")
    .sort({ createdAt: -1 });
};

// GET ALL REPORTS
const findAllReports = async () => {
  return await Report.find()
    .populate("bookingId")
    .populate("uploadedBy", "name email")
    .sort({ createdAt: -1 });
};

const deleteReportById = async (reportId) => {
  return await Report.findByIdAndDelete(reportId);
};

module.exports = {
  createReport,
  findReportsByBooking,
  findReportsByBookings,
  findAllReports,
  deleteReportById,
};