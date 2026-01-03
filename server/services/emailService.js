// server/services/emailService.js
const transporter = require("../utils/gmailTransport");

exports.sendEmail = async (to, subject, html) => {
  return transporter.sendMail({
    from: `"Recruitment Snart System" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
