const mongoose = require("mongoose");
const adminCustomerRepository = require("../repositories/adminCustomerRepository");

// Fetch All Customers
const fetchAllCustomers = async (page = 1, limit = 10, search = "") => {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 10));

  const skip = (page - 1) * limit;

  const query = {
    role: "customer",
  };

  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
      { phone: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const result = await adminCustomerRepository.fetchAllCustomers(
    query,
    skip,
    limit
  );

  return {
    customers: result.customers,
    pagination: {
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    },
  };
};

// Fetch Customer By ID
const fetchCustomerById = async (customerId) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new Error("Invalid customer ID");
  }

  const customer =
    await adminCustomerRepository.fetchCustomerById(customerId);

  if (!customer) {
    throw new Error("Customer not found");
  }

  return customer;
};

// Update Customer
const updateCustomer = async (customerId, data) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new Error("Invalid customer ID");
  }

  const allowedFields = ["name", "email", "phone"];
  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      if (typeof data[field] !== "string" || !data[field].trim()) {
        throw new Error(`${field} must be a valid non-empty string`);
      }

      updateData[field] = data[field].trim();
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("At least one field is required to update");
  }

  const customer = await adminCustomerRepository.updateCustomer(
    customerId,
    updateData
  );

  if (!customer) {
    throw new Error("Customer not found");
  }

  return customer;
};

// Update Customer Status
const updateCustomerStatus = async (customerId, isActive) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new Error("Invalid customer ID");
  }

  if (typeof isActive !== "boolean") {
    throw new Error("isActive must be true or false");
  }

  const customer =
    await adminCustomerRepository.updateCustomerStatus(
      customerId,
      isActive
    );

  if (!customer) {
    throw new Error("Customer not found");
  }

  return customer;
};

module.exports = {
  fetchAllCustomers,
  fetchCustomerById,
  updateCustomer,
  updateCustomerStatus,
};