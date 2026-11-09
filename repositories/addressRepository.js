
const Address = require("../models/Address");

const createAddress = async (data) => {
  return await Address.create(data);
};

const getAllAddresses = async (customerId) => {
  return await Address.find({ customer: customerId })
    .sort({ isDefault: -1, createdAt: -1 });
};

const getAddressById = async (id, customerId) => {
  return await Address.findOne({
    _id: id,
    customer: customerId
  });
};

const updateAddress = async (id, customerId, data) => {
  return await Address.findOneAndUpdate(
    { _id: id, customer: customerId },
    { $set: data },
    { new: true, runValidators: true }
  );
};

const deleteAddress = async (id, customerId) => {
  return await Address.findOneAndDelete({
    _id: id,
    customer: customerId
  });
};

const clearDefaultAddress = async (customerId) => {
  return await Address.updateMany(
    { customer: customerId },
    { $set: { isDefault: false } }
  );
};

const getAddressCount = async (customerId) => {
  return await Address.countDocuments({ customer: customerId });
};

const setDefaultAddress = async (id, customerId) => {
  return await Address.findOneAndUpdate(
    { _id: id, customer: customerId },
    { $set: { isDefault: true } },
    { new: true }
  );
};

module.exports = {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  clearDefaultAddress,
  getAddressCount,
  setDefaultAddress
};
