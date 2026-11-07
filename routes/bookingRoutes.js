const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const { authenticate, authorize } = require("../middleware/auth");

router.post("/", authenticate, authorize("customer"), bookingController.createBooking);
router.get("/", authenticate, authorize("customer"), bookingController.getCustomerBookings);
router.get("/:id", authenticate, authorize("customer"), bookingController.getBookingById);
router.put("/:id", authenticate, authorize("customer"), bookingController.updateBooking);
router.delete("/:id", authenticate, authorize("customer"), bookingController.deleteBooking);

module.exports = router;
