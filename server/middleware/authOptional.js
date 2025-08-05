const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authOptional = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = { userId: user._id, role: user.role };
      }
    } catch (err) {
      console.warn('[Auth Optional] Token invalid, ignoring user');
    }
  }
  next();
};

module.exports = authOptional;
