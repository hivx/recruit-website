const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // ví dụ: myemail@gmail.com
    pass: process.env.GMAIL_PASS  // App Password từ Gmail
  }
});

const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Recruit App" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendMail;
