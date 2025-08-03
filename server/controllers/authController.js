const authService = require('../services/authService');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Chỉ chấp nhận email @gmail.com
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Chỉ chấp nhận email @gmail.com' });
    }

    // 2. Kiểm tra trùng email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }

    // 3. Xác định role
    let userRole = 'applicant'; // mặc định
    if (role === 'recruiter') userRole = 'recruiter';
    else if (role === 'admin') {
      return res.status(403).json({ message: 'Không thể tự đăng ký với quyền admin' });
    }

    // 4. Tạo user mới
    const user = await User.create({ name, email, password, isVerified: false, role: userRole });

    // 5. Tạo token xác thực
    const verifyToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 6. Tạo link xác thực
    const verifyLink = `${process.env.CLIENT_URL}/api/auth/verify-email?token=${verifyToken}`;

    // 7. Gửi email xác thực
    await emailService.sendEmail(
      email,
      'Xác thực tài khoản',
      `
        <p>Chào ${name},</p>
        <p>Vui lòng xác thực email của bạn bằng cách nhấn vào đường link dưới đây:</p>
        <p><a href="${verifyLink}">${verifyLink}</a></p>
        <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
      `
    );

    res.status(201).json({
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.'
    });

  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Đăng ký thất bại', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.userId);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).send('<h1>❌ Thiếu token xác thực</h1>');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).send('<h1>❌ Không tìm thấy người dùng</h1>');
    }

    if (user.isVerified) {
      return res.send('<h1>✅ Tài khoản của bạn đã được xác thực trước đó</h1>');
    }

    user.isVerified = true;
    await user.save();

    return res.send('<h1>🎉 Tài khoản đã xác thực thành công! Bạn có thể đăng nhập.</h1>');

  } catch (err) {
    console.error('Lỗi xác thực:', err);
    return res.status(400).send('<h1>❌ Token không hợp lệ hoặc đã hết hạn</h1>');
  }
};

