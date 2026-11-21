
const contactService = require("../services/contactService");

const submitEnquiry = async (req, res) => {
  try {
    const result = await contactService.submitEnquiry(req.body);

    if (!result.emailSent) {
      return res.status(202).json({
        success: true,
        message: "Enquiry saved, but email delivery failed. Please try again later.",
        data: {
          enquiryId: result.enquiryId,
          emailSent: false
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: "Your enquiry has been submitted successfully",
      data: {
        enquiryId: result.enquiryId,
        emailSent: true
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to submit enquiry"
    });
  }
};

module.exports = { submitEnquiry };
