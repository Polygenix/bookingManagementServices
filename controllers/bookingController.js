
const bookingService = require("../services/bookingService");

const createBooking = async (req, res) => {
  try {
    const customerId = req.user._id;

    const booking = await bookingService.createBooking(
      customerId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getCustomerBookings(req.user._id);
    return res.status(200).json({ success: true, message: "Bookings fetched successfully", count: bookings.length, data: bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user._id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    return res.status(200).json({ success: true, message: "Booking fetched successfully", data: booking });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await bookingService.updateCustomerBooking(req.params.id, req.user._id, req.body);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    return res.status(200).json({ success: true, message: "Booking updated successfully", data: booking });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await bookingService.deleteCustomerBooking(req.params.id, req.user._id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    return res.status(200).json({ success: true, message: "Booking deleted successfully", data: booking });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getBookingById,
  updateBooking,
  deleteBooking
};
