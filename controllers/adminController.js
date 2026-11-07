const adminService = require("../services/adminService");

const getAllBookings = async (req, res) => {
  try {
    const bookings = await adminService.getAllBookings();

    return res.status(200).json({
      success: true,
      message: "All bookings fetched successfully",
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error("Admin Get All Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await adminService.getBookingById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Booking fetched successfully",
      data: booking
    });

  } catch (error) {
    console.error("Get Booking By ID Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const booking = await adminService.updateBookingStatus(
      req.params.id,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await adminService.updateBooking(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};
const deleteBooking = async (req, res) => {
  try {
    await adminService.deleteBooking(req.params.id);

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully"
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updateBooking,
  deleteBooking
};