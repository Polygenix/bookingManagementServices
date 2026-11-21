
const contactRepository = require("../repositories/contactEnquiryRepository");
const { sendEmail } = require("./emailService");

// Escape HTML to prevent HTML injection in emails
const escapeHtml = (value = "") => {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[char];
  });
};

// Validate and normalize enquiry input
const validateEnquiry = (payload = {}) => {
  const { name, email, phone, subject, message } = payload;

  if (!name || !email || !phone || !subject || !message) {
    const error = new Error("Name, email, phone, subject and message are required");
    error.statusCode = 400;
    throw error;
  }

  const clean = {
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    phone: String(phone).trim(),
    subject: String(subject).trim().replace(/[\r\n]+/g, " "),
    message: String(message).trim()
  };

  if (!clean.name || !clean.email || !clean.phone || !clean.subject || !clean.message) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
  }

  // Length validation
  if (clean.name.length > 100) {
    const error = new Error("Name cannot exceed 100 characters");
    error.statusCode = 400;
    throw error;
  }

  if (clean.email.length > 254) {
    const error = new Error("Email is too long");
    error.statusCode = 400;
    throw error;
  }

  if (clean.phone.length > 20) {
    const error = new Error("Phone cannot exceed 20 characters");
    error.statusCode = 400;
    throw error;
  }

  if (clean.subject.length > 150) {
    const error = new Error("Subject cannot exceed 150 characters");
    error.statusCode = 400;
    throw error;
  }

  if (clean.message.length > 5000) {
    const error = new Error("Message cannot exceed 5000 characters");
    error.statusCode = 400;
    throw error;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(clean.email)) {
    const error = new Error("Invalid email address");
    error.statusCode = 400;
    throw error;
  }

  // Phone validation
  if (!/^[+0-9()\-\s]{7,20}$/.test(clean.phone)) {
    const error = new Error("Invalid phone number");
    error.statusCode = 400;
    throw error;
  }

  return clean;
};

// Modern Contact Us email template
const buildContactEmail = (clean, enquiryId) => {
  const safeName = escapeHtml(clean.name);
  const safeEmail = escapeHtml(clean.email);
  const safePhone = escapeHtml(clean.phone);
  const safeSubject = escapeHtml(clean.subject);
  const safeMessage = escapeHtml(clean.message);
  const safeId = escapeHtml(enquiryId);

  const replySubject = encodeURIComponent(`Re: ${clean.subject}`);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Enquiry</title>
</head>

<body style="margin:0;padding:0;background-color:#f3f5f9;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">

  <div style="padding:35px 12px;background-color:#f3f5f9;">

    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">

      <!-- Header -->
      <div style="background-color:#0f172a;padding:30px 32px;">

        <div style="font-size:12px;color:#93c5fd;letter-spacing:2px;font-weight:bold;">
          CONTACT &amp; SUPPORT
        </div>

        <h1 style="margin:12px 0 0;color:#ffffff;font-size:25px;line-height:1.3;">
          New Enquiry Received
        </h1>

        <p style="margin:10px 0 0;color:#cbd5e1;font-size:14px;line-height:1.6;">
          A new message has been submitted through your Contact Us form.
        </p>

      </div>

      <!-- Main Content -->
      <div style="padding:30px 32px;">

        <!-- Contact Information -->
        <div style="margin-bottom:24px;">

          <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:bold;">
            Contact Information
          </div>

          <div style="margin-top:15px;padding:20px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">

            <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
              <strong style="color:#64748b;">Name</strong><br/>
              <span style="color:#111827;font-size:16px;">${safeName}</span>
            </p>

            <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
              <strong style="color:#64748b;">Email</strong><br/>
              <a href="mailto:${safeEmail}" style="color:#2563eb;text-decoration:none;">
                ${safeEmail}
              </a>
            </p>

            <p style="margin:0;font-size:14px;line-height:1.6;">
              <strong style="color:#64748b;">Phone</strong><br/>
              <a href="tel:${safePhone}" style="color:#2563eb;text-decoration:none;">
                ${safePhone}
              </a>
            </p>

          </div>
        </div>

        <!-- Subject -->
        <div style="margin-bottom:24px;">

          <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:bold;">
            Subject
          </div>

          <div style="margin-top:10px;font-size:18px;font-weight:bold;color:#111827;line-height:1.5;">
            ${safeSubject}
          </div>

        </div>

        <!-- Message -->
        <div>

          <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:bold;">
            Message
          </div>

          <div style="margin-top:10px;padding:20px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:10px;font-size:15px;line-height:1.8;color:#374151;white-space:pre-wrap;word-break:break-word;">
            ${safeMessage}
          </div>

        </div>

        <!-- Reference ID -->
        <div style="margin-top:24px;padding:16px;background-color:#eff6ff;border-radius:8px;">

          <div style="font-size:11px;color:#64748b;letter-spacing:1px;font-weight:bold;">
            ENQUIRY REFERENCE ID
          </div>

          <div style="margin-top:7px;font-size:14px;font-weight:bold;color:#1d4ed8;word-break:break-all;">
            ${safeId}
          </div>

        </div>

        <!-- Reply Button -->
        <div style="margin-top:28px;text-align:center;">

          <a
            href="mailto:${safeEmail}?subject=${replySubject}"
            style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:8px;font-size:14px;font-weight:bold;"
          >
            Reply to Customer
          </a>

        </div>

      </div>

      <!-- Footer -->
      <div style="padding:22px 32px;background-color:#f8fafc;border-top:1px solid #e5e7eb;text-align:center;">

        <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
          This email was automatically generated from your Contact Us form.
        </p>

        <p style="margin:8px 0 0;font-size:11px;line-height:1.6;color:#94a3b8;">
          This is an automated notification from your booking platform.
        </p>

      </div>

    </div>

  </div>

</body>
</html>
`;
};

// Submit contact enquiry
const submitEnquiry = async (payload) => {
  const clean = validateEnquiry(payload);

  // Ensure recipient email is configured
  if (!process.env.CONTACT_US_EMAIL) {
    const error = new Error("Contact enquiry email is not configured");
    error.statusCode = 500;
    throw error;
  }

  // 1. Save enquiry in MongoDB first
  const enquiry = await contactRepository.createEnquiry(clean);

  // 2. Build modern HTML email
  const html = buildContactEmail(clean, enquiry._id);

  let emailSent = false;
  let emailError = null;

  // 3. Send enquiry email
  try {
    await sendEmail(
      process.env.CONTACT_US_EMAIL,
      `Contact Us Enquiry: ${clean.subject}`,
      html
    );

    emailSent = true;
  } catch (error) {
    // Enquiry is already saved; don't lose it if email fails
    emailError = error.code || "EMAIL_SEND_FAILED";

    console.error("Contact Us email delivery failed:", error.message);
  }

  // 4. Update email delivery status in MongoDB
  await contactRepository.updateEmailStatus(
    enquiry._id,
    emailSent,
    emailError
  );

  // 5. Return result to controller
  return {
    enquiryId: enquiry._id,
    emailSent
  };
};

module.exports = {
  submitEnquiry,
  validateEnquiry,
  buildContactEmail
};
