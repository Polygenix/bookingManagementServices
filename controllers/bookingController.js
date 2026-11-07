
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

module.exports = {
  createBooking
};
