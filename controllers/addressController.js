
const addressService = require("../services/addressService");

const getCustomerId = (req) => req.user.id || req.user._id;

// Create Address
const createAddress = async (req, res, next) => {
  try {
    const address = await addressService.createAddress(
      getCustomerId(req),
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: address
    });
  } catch (error) {
    next(error);
  }
};

// Get All Addresses
const getAllAddresses = async (req, res, next) => {
  try {
    const addresses = await addressService.getAllAddresses(
      getCustomerId(req)
    );

    res.status(200).json({
      success: true,
      total: addresses.length,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

// Get Address By ID
const getAddressById = async (req, res, next) => {
  try {
    const address = await addressService.getAddressById(
      req.params.id,
      getCustomerId(req)
    );

    res.status(200).json({
      success: true,
      data: address
    });
  } catch (error) {
    next(error);
  }
};

// Update Address
const updateAddress = async (req, res, next) => {
  try {
    const address = await addressService.updateAddress(
      req.params.id,
      getCustomerId(req),
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address
    });
  } catch (error) {
    next(error);
  }
};

// Delete Address
const deleteAddress = async (req, res, next) => {
  try {
    const address = await addressService.deleteAddress(
      req.params.id,
      getCustomerId(req)
    );

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: address
    });
  } catch (error) {
    next(error);
  }
};

// Set Default Address
const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await addressService.setDefaultAddress(
      req.params.id,
      getCustomerId(req)
    );

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: address
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
