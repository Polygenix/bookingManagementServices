const customerTimeSlotService = require("../services/customerTimeSlotService");

// Get all available time slots
const getAvailableTimeSlots = async (req, res) => {
  try {
    const slots =
      await customerTimeSlotService.getAvailableTimeSlots(
        req.query.date
      );

    return res.status(200).json({
      success: true,
      total: slots.length,
      data: slots
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// Get available time slot by ID
const getAvailableTimeSlotById = async (req, res) => {
  try {
    const slot =
      await customerTimeSlotService.getAvailableTimeSlotById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: slot
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAvailableTimeSlots,
  getAvailableTimeSlotById
};

