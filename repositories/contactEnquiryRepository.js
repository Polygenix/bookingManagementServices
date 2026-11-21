
const ContactEnquiry = require("../models/ContactEnquiry");

const createEnquiry = async (data) => {
  return ContactEnquiry.create(data);
};

const updateEmailStatus = async (id, emailSent, emailError = null) => {
  return ContactEnquiry.findByIdAndUpdate(
    id,
    {
      $set: { emailSent, emailError }
    },
    { new: true }
  );
};

module.exports = {
  createEnquiry,
  updateEmailStatus
};
