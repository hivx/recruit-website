const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = require("../utils/generateToken");
const prisma = require("../utils/prisma");
const emailService = require("./emailService");

module.exports = {
  // Đăng ký user mới
  async register({ name, email, password, role }) {
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      const error = new Error("Chỉ chấp nhận email @gmail.com!");
      error.status = 400;
      throw error;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const error = new Error("Email đã tồn tại!");
      error.status = 409;
      throw error;
    }

    let userRole = "applicant";
    if (role === "recruiter") {
      userRole = "recruiter";
    } else if (role === "admin") {
      const error = new Error("Không thể tự đăng ký với quyền admin!");
      error.status = 403;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    // Tạo token xác thực email
    const verifyToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const verifyLink = `${process.env.CLIENT_URL}/api/auth/verify-email?token=${verifyToken}`;

    // Gửi email xác thực
    await emailService.sendEmail(
      email,
      "Xác thực tài khoản",
      `<p>Chào ${name},</p>
       <p>Vui lòng xác thực email của bạn bằng cách nhấn vào đường link dưới đây:</p>
       <p><a href="${verifyLink}">${verifyLink}</a></p>
       <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>`,
    );

    return user;
  },

  // Đăng nhập
  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const error = new Error("Email hoặc mật khẩu không đúng!");
      error.status = 400;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Email hoặc mật khẩu không đúng!");
      error.status = 400;
      throw error;
    }

    if (!user.isVerified) {
      const error = new Error("Tài khoản chưa được xác thực qua email!");
      error.status = 403;
      throw error;
    }

    const token = generateToken(user.id.toString(), user.role);

    return {
      token,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };
  },

  // Đặt lại mật khẩu
  async requestReset(email, newPassword) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const error = new Error("Email không tồn tại!");
      error.status = 404;
      throw error;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { reset_token: token, reset_token_expiry: expiry },
    });

    const resetLink = `${process.env.CLIENT_URL}/api/auth/reset-password?token=${token}&hashed=${encodeURIComponent(hashed)}`;

    await emailService.sendEmail(
      email,
      "Xác nhận đặt lại mật khẩu",
      `<p>Xin chào ${user.name},</p>
      <p>Bạn đã yêu cầu đổi mật khẩu. Nhấn link dưới đây để xác nhận:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Liên kết sẽ hết hạn sau 1 giờ.</p>`,
    );

    return { message: "Liên kết xác nhận đã được gửi tới email của bạn!" };
  },

  // xác nhận khi click link
  async confirmReset(token, hashed) {
    const user = await prisma.user.findFirst({
      where: {
        reset_token: token,
        reset_token_expiry: { gt: new Date() },
      },
    });
    if (!user) {
      return null;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: decodeURIComponent(hashed),
        reset_token: null,
        reset_token_expiry: null,
      },
    });

    return { message: "Mật khẩu đã được đặt lại thành công!" };
  },

  // Lấy thông tin cá nhân
  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        role: true,
        isVerified: true,
        created_at: true,
      },
    });
    if (!user) {
      const error = new Error("Không tìm thấy người dùng");
      error.status = 404;
      throw error;
    }
    return user;
  },

  // Xác thực email
  async verifyEmail(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      const error = new Error("Không tìm thấy người dùng!");
      error.status = 404;
      throw error;
    }
    if (user.isVerified) {
      return { already: true };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    return { success: true };
  },
};
