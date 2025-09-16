const authService = require("../services/authService");

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
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

// Lấy thông tin user hiện tại
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
