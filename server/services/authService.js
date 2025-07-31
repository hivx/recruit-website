const bcrypt = require('bcryptjs');
const User = require('../models/user');
const generateToken = require('../utils/generateToken');

exports.register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email đã tồn tại');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();

  return newUser;
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Email không tồn tại');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Sai mật khẩu');

  const token = generateToken(user._id);

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email }
  };
};

exports.getMe = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('Không tìm thấy người dùng');
  return user;
};
