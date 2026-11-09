
const Booking = require("../models/Booking");
const TimeSlot = require("../models/TimeSlot");

const createBooking = async (bookingData) => {
  return await Booking.create(bookingData);
};

// GET ALL BOOKINGS
const findAllBookings = async () => {
  return await Booking.find()
    .populate("customer")
    .populate("timeSlotId")
    .populate("addressId")
    .sort({ createdAt: -1 });
};

// GET CUSTOMER BOOKINGS
const findBookingsByCustomer = async (customerId) => {
  return await Booking.find({ customer: customerId })
    .populate("timeSlotId")
    .populate("addressId")
    .sort({ createdAt: -1 });
};

// GET BOOKING BY ID
const findBookingById = async (bookingId, customerId) => {
  return await Booking.findOne({
    _id: bookingId,
    customer: customerId,
  })
    .populate("timeSlotId")
    .populate("addressId");
};

// UPDATE BOOKING
const updateBooking = async (bookingId, customerId, data) => {
  return await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      customer: customerId,
    },
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("timeSlotId")
    .populate("addressId");
};

// DELETE BOOKING AND RELEASE SLOT CAPACITY
const deleteBooking = async (bookingId, customerId) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    customer: customerId,
  });

  if (!booking) {
    return null;
  }

  if (booking.status === "cancelled") {
    const error = new Error("Booking is already cancelled");
    error.statusCode = 400;
    throw error;
  }

  if (booking.status === "completed") {
    const error = new Error("Completed booking cannot be deleted");
    error.statusCode = 400;
    throw error;
  }

  const deletedBooking = await Booking.findOneAndDelete({
    _id: bookingId,
    customer: customerId,
  });

  if (!deletedBooking) {
    return null;
  }

  if (deletedBooking.timeSlotId) {
    await TimeSlot.updateOne(
      {
        _id: deletedBooking.timeSlotId,
        bookedCount: { $gt: 0 },
      },
      {
        $inc: { bookedCount: -1 },
      }
    );
  }

  return deletedBooking;
};

module.exports = {
  createBooking,
  findAllBookings,
  findBookingsByCustomer,
  findBookingById,
  updateBooking,
  deleteBooking,
};
