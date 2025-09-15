const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const emailService = require("../services/emailService");
const prisma = require("../utils/prisma");

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Chỉ chấp nhận email @gmail.com
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      return res
        .status(400)
        .json({ message: "Chỉ chấp nhận email @gmail.com" });
    }

    // 2. Kiểm tra trùng email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email đã tồn tại" });
    }

    // 3. Xác định role
    let userRole = "applicant"; // mặc định
    if (role === "recruiter") {
      userRole = "recruiter";
    } else if (role === "admin") {
      return res
        .status(403)
        .json({ message: "Không thể tự đăng ký với quyền admin" });
    }

    // 4. Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Tạo user mới
    const user = await prisma.user.create({
      data: {
        name,
        email,
        avatar: "uploads/pic.jpg",
        password: hashedPassword,
        role: userRole,
        isVerified: false,
      },
    });

    // 6. Tạo token xác thực
    const verifyToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // 7. Link xác thực
    const verifyLink = `${process.env.CLIENT_URL}/api/auth/verify-email?token=${verifyToken}`;

    // 8. Gửi email
    await emailService.sendEmail(
      email,
      "Xác thực tài khoản",
      `
        <p>Chào ${name},</p>
        <p>Vui lòng xác thực email của bạn bằng cách nhấn vào đường link dưới đây:</p>
        <p><a href="${verifyLink}">${verifyLink}</a></p>
        <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
      `,
    );

    res.status(201).json({
      message:
        "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Đăng ký thất bại", error: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user theo email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // 2. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // 3. Check verify
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Tài khoản chưa được xác thực qua email" });
    }

    // 4. Tạo token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({ token, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lấy thông tin user hiện tại
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Xác thực email
exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).send("<h1>Thiếu token xác thực</h1>");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).send("<h1>Không tìm thấy người dùng</h1>");
    }

    if (user.isVerified) {
      return res.send("<h1>Tài khoản của bạn đã được xác thực trước đó</h1>");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    return res.send(
      "<h1>Tài khoản đã xác thực thành công! Bạn có thể đăng nhập.</h1>",
    );
  } catch (err) {
    console.error("Lỗi xác thực:", err);
    return res.status(400).send("<h1>Token không hợp lệ hoặc đã hết hạn</h1>");
  }
};
