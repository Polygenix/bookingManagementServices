const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const error = new Error("EMAIL_USER and EMAIL_PASS must be configured");
    error.code = "EMAIL_CONFIG_MISSING";
    throw error;
  }

  return transporter.sendMail({
    from: `"Booking Management" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};

module.exports = { sendEmail, transporter };
