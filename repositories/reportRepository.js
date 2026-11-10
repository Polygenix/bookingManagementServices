const Report = require("../models/Report");

const createReport = async (data) => {
  return await Report.create(data);
};

const findReportsByBooking = async (bookingId) => {
  return await Report.find({ bookingId })
    .populate("uploadedBy", "name email")
    .sort({ createdAt: -1 });
};

// GET ALL REPORTS
const findAllReports = async () => {
  return await Report.find()
    .populate("bookingId")
    .populate("uploadedBy", "name email")
    .sort({ createdAt: -1 });
};

module.exports = {
  createReport,
  findReportsByBooking,
  findAllReports,
};