const express = require("express");
const router = express.Router();

const adminCustomerController = require("../controllers/adminCustomerController");

router.get(
  "/fetchAllCustomers",
  adminCustomerController.fetchAllCustomers
);

module.exports = router;