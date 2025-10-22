// controllers/authController.js
const authService = require("../services/authService");

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    // Validate nhanh input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Thiếu name/email/password!" });
    }
    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
    }

    const { user } = await authService.register({
      name,
      email,
      password,
      role,
    });
    return res.status(201).json({
      message:
        "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản!",
      user, // DTO: id (string), name, email, avatar, role, isVerified, company?
    });
  } catch (err) {
    console.error("[Register Error]", err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Đăng ký thất bại" });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const result = await authService.login(email, password);
    return res.status(200).json(result); // { token, user: DTO }
  } catch (err) {
    return res
      .status(err.status || 400)
      .json({ message: err.message || "Đăng nhập thất bại" });
  }
};

// Lấy thông tin user hiện tại — trả DTO trong key `user`
exports.getMe = async (req, res) => {
  try {
    // KHÔNG trả req.user trực tiếp
    const user = await authService.getMe(req.user.userId);
    return res.status(200).json({ user }); // nested DTO
  } catch (err) {
    return res
      .status(err.status || 404)
      .json({ message: err.message || "Không tìm thấy người dùng" });
  }
};

// Xác thực email
exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).send("<h1>Thiếu token xác thực!</h1>");
    }

    const result = await authService.verifyEmail(token);
    if (result.already) {
      return res.send("<h1>Tài khoản của bạn đã được xác thực trước đó!</h1>");
    }
    return res.send(
      "<h1>Tài khoản đã xác thực thành công! Bạn có thể đăng nhập.</h1>",
    );
  } catch (err) {
    console.error("[Verify Email Error]", err);
    return res.status(400).send("<h1>Token không hợp lệ hoặc đã hết hạn!</h1>");
  }
};

// Quên mật khẩu
exports.forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body || {};

    if (!newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập mật khẩu và xác nhận mật khẩu!" });
    }
    if (String(newPassword).length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp!" });
    }

    const result = await authService.requestReset(email, newPassword);
    return res.json(result); // message
  } catch (err) {
    console.error("[Request Reset Error]", err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi server!" });
  }
};

// GET /auth/reset-password?token=xxx&hashed=yyy
exports.resetPassword = async (req, res) => {
  try {
    const { token, hashed } = req.query || {};
    if (!token || !hashed) {
      return res.status(400).send("<h1>Thiếu token hoặc mật khẩu!</h1>");
    }

    const result = await authService.confirmReset(token, hashed);
    if (!result) {
      return res
        .status(400)
        .send("<h1>Token không hợp lệ hoặc đã hết hạn!</h1>");
    }

    return res.send(
      "<h1>Mật khẩu đã được cập nhật thành công! Bạn có thể đăng nhập.</h1>",
    );
  } catch (err) {
    console.error("[Reset Password Error]", err);
    return res.status(500).send("<h1>Lỗi server!</h1>");
  }
};
