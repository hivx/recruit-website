// server/middleware/validateGmail.js
module.exports = function (req, res, next) {
  const { email } = req.body;
  if (!email || !email.endsWith('@gmail.com')) {
    return res.status(400).json({ message: 'Chỉ chấp nhận email @gmail.com' });
  }
  next();
};
