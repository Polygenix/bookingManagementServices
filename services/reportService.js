const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const reportRepository = require("../repositories/reportRepository");

const throwError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

// ADD REPORT URL
const uploadReport = async (adminId, data) => {
  const { bookingId, fileUrl } = data;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throwError("Invalid booking ID", 400);
  }

  if (!fileUrl || !/^https?:\/\/\S+$/i.test(fileUrl)) {
    throwError("Valid file URL is required", 400);
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throwError("Booking not found", 404);
  }

  const report = await reportRepository.createReport({
    bookingId,
    fileUrl,
    uploadedBy: adminId,
  });

  return report;
};

// GET REPORTS BY BOOKING ID
const getReportsByBooking = async (bookingId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throwError("Invalid booking ID", 400);
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throwError("Booking not found", 404);
  }

  return await reportRepository.findReportsByBooking(bookingId);
};

// ADMIN GET ALL REPORTS
const getAllReports = async () => {
  const reports = await reportRepository.findAllReports();

  return reports;
};


const deleteReport = async (reportId) => {
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throwError("Invalid report ID", 400);
  }

  const report = await reportRepository.deleteReportById(reportId);

  if (!report) {
    throwError("Report not found", 404);
  }

  return report;
};

module.exports = {
  uploadReport,
  getReportsByBooking,
  getAllReports,
  deleteReport,
};