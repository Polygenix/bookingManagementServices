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

module.exports = {
  getAllBookings
};