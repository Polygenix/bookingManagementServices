const Booking = require("../models/Booking");

const findAllBookings = async () => {
  return await Booking.find()
    .populate("customer")
    .populate("timeSlotId")
    .populate("addressId")
    .sort({ createdAt: -1 });
};

const findBookingById = async (id) => {
  return await Booking.findById(id)
    .populate("customer")
    .populate("timeSlotId")
    .populate("addressId");
};

const updateBooking = async (id, updateData, requirePaymentUnlocked = false) => {
  const filter = { _id: id };

  if (requirePaymentUnlocked) {
    filter.$or = [
      { paymentOrderLockUntil: { $exists: false } },
      { paymentOrderLockUntil: null },
      { paymentOrderLockUntil: { $lte: new Date() } },
    ];
  }

  return await Booking.findOneAndUpdate(
    filter,
    { $set: updateData },
    {
      new: true,
      runValidators: true
    }
  )
    .populate("customer")
    .populate("timeSlotId")
    .populate("addressId");
};

module.exports = {
  findAllBookings,
  findBookingById,
  updateBooking
};
