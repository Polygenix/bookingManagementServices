
const Address = require("../models/Address");

const createAddress = async (data, session) => {
  const address = new Address(data);
  return await address.save({ session });
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

const deleteAddress = async (id, customerId, session) => {
  return await Address.findOneAndDelete({
    _id: id,
    customer: customerId
  }, { session });
};

const clearDefaultAddress = async (customerId, session) => {
  return await Address.updateMany(
    { customer: customerId },
    { $set: { isDefault: false } },
    { session }
  );
};

const getAddressCount = async (customerId, session) => {
  return await Address.countDocuments({ customer: customerId }).session(session);
};

const setDefaultAddress = async (id, customerId, session) => {
  return await Address.findOneAndUpdate(
    { _id: id, customer: customerId },
    { $set: { isDefault: true } },
    { new: true, session }
  );
};

const findMostRecentAddress = async (customerId, session) => {
  return await Address.findOne({ customer: customerId })
    .sort({ createdAt: -1 })
    .session(session);
};

module.exports = {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  clearDefaultAddress,
  getAddressCount,
  setDefaultAddress,
  findMostRecentAddress
};
