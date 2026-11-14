const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 2587,
  secure: false,
  requireTLS: true,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000
});

const sendEmail = async (to, subject, html) => {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    const error = new Error(
      "RESEND_API_KEY and RESEND_FROM_EMAIL must be configured"
    );
    error.code = "EMAIL_CONFIG_MISSING";
    throw error;
  }

  return transporter.sendMail({
    from: `"Booking Management" <${process.env.RESEND_FROM_EMAIL}>`,
    to,
    subject,
    html
  });
};

module.exports = { sendEmail, transporter };
