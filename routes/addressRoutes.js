
const express = require("express");
const router = express.Router();

const addressController = require("../controllers/addressController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate, authorize("customer"));

router.post("/", addressController.createAddress);
router.get("/", addressController.getAllAddresses);
router.get("/:id", addressController.getAddressById);
router.put("/:id", addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);
router.put("/:id/default", addressController.setDefaultAddress);

module.exports = router;
