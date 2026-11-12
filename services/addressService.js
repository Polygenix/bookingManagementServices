
const mongoose = require("mongoose");
const addressRepository = require("../repositories/addressRepository");

const validateId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid address ID");
    error.statusCode = 400;
    throw error;
  }
};

const createAddress = async (customerId, data) => {
  const requiredFields = [
    "fullName",
    "phone",
    "houseNo",
    "street",
    "city",
    "state",
    "pincode"
  ];

  for (const field of requiredFields) {
    if (!data[field] || !String(data[field]).trim()) {
      const error = new Error(`${field} is required`);
      error.statusCode = 400;
      throw error;
    }
  }

  const count = await addressRepository.getAddressCount(customerId);

  const addressData = {
    ...data,
    customer: customerId,
    isDefault: count === 0 || data.isDefault === true
  };

  if (addressData.isDefault) {
    await addressRepository.clearDefaultAddress(customerId);
  }

  return await addressRepository.createAddress(addressData);
};

const getAllAddresses = async (customerId) => {
  return await addressRepository.getAllAddresses(customerId);
};

const getAddressById = async (id, customerId) => {
  validateId(id);

  const address = await addressRepository.getAddressById(id, customerId);

  if (!address) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  return address;
};

const updateAddress = async (id, customerId, data) => {
  validateId(id);

  const allowedFields = [
    "addressType",
    "fullName",
    "phone",
    "houseNo",
    "street",
    "landmark",
    "city",
    "state",
    "pincode",
    "latitude",
    "longitude"
  ];

  const updateData = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    const error = new Error("No valid fields provided for update");
    error.statusCode = 400;
    throw error;
  }

  const address = await addressRepository.updateAddress(
    id,
    customerId,
    updateData
  );

  if (!address) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  return address;
};

const deleteAddress = async (id, customerId) => {
  validateId(id);

  const address = await addressRepository.deleteAddress(id, customerId);

  if (!address) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  return address;
};

const setDefaultAddress = async (id, customerId) => {
  validateId(id);

  const address = await addressRepository.getAddressById(id, customerId);

  if (!address) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  await addressRepository.clearDefaultAddress(customerId);

  return await addressRepository.setDefaultAddress(id, customerId);
};

module.exports = {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
