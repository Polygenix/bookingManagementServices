
const bookingRepository = require("../repositories/bookingRepository");

const createBooking = async (customerId, data) => {
  const {
    patientName,
    testName,
    age,
    gender,
    phone,
    email,
    bookingDate,
    timeSlot,
    notes
  } = data;

  if (
    !patientName ||
    !testName ||
    age === undefined ||
    !gender ||
    !phone ||
    !email ||
    !bookingDate ||
    !timeSlot
  ) {
    const error = new Error("All required booking fields must be provided");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(Number(age)) || Number(age) < 1 || Number(age) > 120) {
    const error = new Error("Age must be between 1 and 120");
    error.statusCode = 400;
    throw error;
  }

  if (!["Male", "Female", "Other"].includes(gender)) {
    const error = new Error("Invalid gender");
    error.statusCode = 400;
    throw error;
  }

  const parsedDate = new Date(bookingDate);

  if (Number.isNaN(parsedDate.getTime())) {
    const error = new Error("Invalid booking date");
    error.statusCode = 400;
    throw error;
  }

  if (parsedDate < new Date(new Date().setHours(0, 0, 0, 0))) {
    const error = new Error("Booking date cannot be in the past");
    error.statusCode = 400;
    throw error;
  }

  const booking = await bookingRepository.createBooking({
    customer: customerId,
    patientName: patientName.trim(),
    testName: testName.trim(),
    age: Number(age),
    gender,
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    bookingDate: parsedDate,
    timeSlot: timeSlot.trim(),
    notes: notes || ""
  });

  return booking;
};


module.exports = {
  createBooking
};
