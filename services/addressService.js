
const mongoose = require("mongoose");
const addressRepository = require("../repositories/addressRepository");
const User = require("../models/User");

const validateId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid address ID");
    error.statusCode = 400;
    throw error;
  }
};

const serializeAddressChanges = async (customerId, session) => {
  const result = await User.updateOne(
    { _id: customerId },
    { $inc: { addressRevision: 1 } },
    { session }
  );

  if (result.modifiedCount !== 1) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
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

  if (data.isDefault !== undefined && typeof data.isDefault !== "boolean") {
    const error = new Error("isDefault must be true or false");
    error.statusCode = 400;
    throw error;
  }

  const session = await mongoose.startSession();
  let address;

  try {
    await session.withTransaction(async () => {
      await serializeAddressChanges(customerId, session);
      const count = await addressRepository.getAddressCount(customerId, session);
      const addressData = {
        addressType: data.addressType,
        fullName: data.fullName,
        phone: data.phone,
        houseNo: data.houseNo,
        street: data.street,
        landmark: data.landmark,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        latitude: data.latitude,
        longitude: data.longitude,
        customer: customerId,
        isDefault: count === 0 || data.isDefault === true
      };

      if (addressData.isDefault) {
        await addressRepository.clearDefaultAddress(customerId, session);
      }

      address = await addressRepository.createAddress(addressData, session);
    });
  } finally {
    await session.endSession();
  }

  return address;
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

  const session = await mongoose.startSession();
  let address;

  try {
    await session.withTransaction(async () => {
      await serializeAddressChanges(customerId, session);
      address = await addressRepository.deleteAddress(id, customerId, session);

      if (!address) {
        const error = new Error("Address not found");
        error.statusCode = 404;
        throw error;
      }

      if (address.isDefault) {
        const replacement = await addressRepository.findMostRecentAddress(
          customerId,
          session
        );

        if (replacement) {
          await addressRepository.setDefaultAddress(
            replacement._id,
            customerId,
            session
          );
        }
      }
    });
  } finally {
    await session.endSession();
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

  const session = await mongoose.startSession();
  let defaultAddress;

  try {
    await session.withTransaction(async () => {
      await serializeAddressChanges(customerId, session);
      const ownedAddress = await addressRepository.getAddressById(id, customerId);

      if (!ownedAddress) {
        const error = new Error("Address not found");
        error.statusCode = 404;
        throw error;
      }

      await addressRepository.clearDefaultAddress(customerId, session);
      defaultAddress = await addressRepository.setDefaultAddress(
        id,
        customerId,
        session
      );
    });
  } finally {
    await session.endSession();
  }

  return defaultAddress;
};

module.exports = {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
