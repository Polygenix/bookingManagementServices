const express = require("express");
const router = express.Router();

const adminCustomerController = require("../controllers/adminCustomerController");

router.get(
  "/fetchAllCustomers",
  adminCustomerController.fetchAllCustomers
);

router.get(
  "/fetchCustomerById/:customerId",
  adminCustomerController.fetchCustomerById
);

module.exports = router;