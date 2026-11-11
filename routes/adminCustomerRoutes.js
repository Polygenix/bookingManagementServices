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

router.put(
  "/updateCustomer/:customerId",
  adminCustomerController.updateCustomer
);

router.patch(
  "/updateCustomerStatus/:customerId",
  adminCustomerController.updateCustomerStatus
);

module.exports = router;