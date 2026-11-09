const timeSlotService = require("../services/timeSlotService");

// Create Time Slot
const createTimeSlot = async (req, res) => {
  try {
    const slot = await timeSlotService.createTimeSlot(req.body);

    return res.status(201).json({
      success: true,
      message: "Time slot created successfully",
      data: slot
    });
  } catch (error) {
    return res.status(
      error.statusCode || (error.code === 11000 ? 409 : 500)
    ).json({
      success: false,
      message: error.code === 11000
        ? "This time slot already exists"
        : error.message
    });
  }
};

// Get All Time Slots
const getAllTimeSlots = async (req, res) => {
  try {
    const slots = await timeSlotService.getAllTimeSlots(req.query.date);

    return res.status(200).json({
      success: true,
      message: "Time slots fetched successfully",
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

// Get Time Slot By ID
const getTimeSlotById = async (req, res) => {
  try {
    const slot = await timeSlotService.getTimeSlotById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Time slot details fetched successfully",
      data: slot
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Time Slot
const updateTimeSlot = async (req, res) => {
  try {
    const slot = await timeSlotService.updateTimeSlot(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Time slot updated successfully",
      data: slot
    });
  } catch (error) {
    return res.status(
      error.statusCode || (error.code === 11000 ? 409 : 500)
    ).json({
      success: false,
      message: error.code === 11000
        ? "This time slot already exists"
        : error.message
    });
  }
};

// Delete Time Slot
const deleteTimeSlot = async (req, res) => {
  try {
    await timeSlotService.deleteTimeSlot(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Time slot deleted successfully"
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createTimeSlot,
  getAllTimeSlots,
  getTimeSlotById,
  updateTimeSlot,
  deleteTimeSlot
};