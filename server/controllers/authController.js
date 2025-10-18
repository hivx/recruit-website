const authService = require("../services/authService");

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check mật khẩu tối thiểu 6 ký tự
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
    }

    await authService.register({ name, email, password, role });
    res.status(201).json({
      message:
        "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản!",
    });
  } catch (err) {
    console.error("[Register Error]", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Đăng ký thất bại" });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

// Lấy thông tin user hiện tại (đã cập nhật để trả company nếu có)
exports.getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.userId);
    res.status(200).json(user);
  } catch (err) {
    res.status(err.status || 404).json({ message: err.message });
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
    const { email, newPassword, confirmPassword } = req.body;
    // Check có đủ field
    if (!newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập mật khẩu và xác nhận mật khẩu!" });
    }
    // Check độ dài tối thiểu
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
    }
    // Check khớp nhau
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp!" });
    }
    const result = await authService.requestReset(email, newPassword);
    res.json(result);
  } catch (err) {
    console.error("[Request Reset Error]", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi server!" });
  }
};

// GET /auth/reset-password?token=xxx&hashed=yyy
exports.resetPassword = async (req, res) => {
  try {
    const { token, hashed } = req.query;
    if (!token || !hashed) {
      return res.status(400).send("<h1>Thiếu token hoặc mật khẩu!</h1>");
    }

    const result = await authService.confirmReset(token, hashed);
    if (!result) {
      return res
        .status(400)
        .send("<h1>Token không hợp lệ hoặc đã hết hạn!</h1>");
    }

    res.send(
      "<h1>Mật khẩu đã được cập nhật thành công! Bạn có thể đăng nhập.</h1>",
    );
  } catch (err) {
    console.error("[Reset Password Error]", err);
    res.status(500).send("<h1>Lỗi server!</h1>");
  }
};
