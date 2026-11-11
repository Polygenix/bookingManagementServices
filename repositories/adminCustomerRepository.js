const User = require("../models/User");

// Fetch All Customers
const fetchAllCustomers = async (query, skip, limit) => {
  const [customers, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(query),
  ]);

  return {
    customers,
    total,
  };
};

// Fetch Customer By ID
const fetchCustomerById = async (customerId) => {
  return await User.findOne({
    _id: customerId,
    role: "customer",
  }).select("-password");
};

// Update Customer
const updateCustomer = async (customerId, updateData) => {
  return await User.findOneAndUpdate(
    {
      _id: customerId,
      role: "customer",
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");
};

// Update Customer Status
const updateCustomerStatus = async (customerId, isActive) => {
  return await User.findOneAndUpdate(
    {
      _id: customerId,
      role: "customer",
    },
    {
      $set: { isActive },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");
};

module.exports = {
  fetchAllCustomers,
  fetchCustomerById,
  updateCustomer,
  updateCustomerStatus,
};