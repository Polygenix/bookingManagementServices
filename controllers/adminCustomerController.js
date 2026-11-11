const adminCustomerService = require("../services/adminCustomerService");

// Fetch All Customers
const fetchAllCustomers = async (req, res) => {
  try {
    const result = await adminCustomerService.fetchAllCustomers(
      req.query.page,
      req.query.limit,
      req.query.search
    );

    return res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: result.customers,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Fetch All Customers Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Fetch Customer By ID
const fetchCustomerById = async (req, res) => {
  try {
    const customer = await adminCustomerService.fetchCustomerById(
      req.params.customerId
    );

    return res.status(200).json({
      success: true,
      message: "Customer fetched successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Fetch Customer By ID Error:", error);

    const statusCode =
      error.message === "Invalid customer ID" ? 400 :
      error.message === "Customer not found" ? 404 : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Customer
const updateCustomer = async (req, res) => {
  try {
    const customer = await adminCustomerService.updateCustomer(
      req.params.customerId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Update Customer Error:", error);

    const statusCode =
      error.message === "Invalid customer ID" ||
      error.message.includes("must be") ||
      error.message.includes("required") ? 400 :
      error.message === "Customer not found" ? 404 :
      error.code === 11000 ? 409 : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.code === 11000
        ? "Email or phone already exists"
        : error.message,
    });
  }
};

// Update Customer Status
const updateCustomerStatus = async (req, res) => {
  try {
    const customer = await adminCustomerService.updateCustomerStatus(
      req.params.customerId,
      req.body.isActive
    );

    return res.status(200).json({
      success: true,
      message: `Customer ${customer.isActive ? "activated" : "deactivated"} successfully`,
      data: customer,
    });
  } catch (error) {
    console.error("Update Customer Status Error:", error);

    const statusCode =
      error.message === "Invalid customer ID" ||
      error.message.includes("must be") ? 400 :
      error.message === "Customer not found" ? 404 : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  fetchAllCustomers,
  fetchCustomerById,
  updateCustomer,
  updateCustomerStatus,
};