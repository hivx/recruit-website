// services/authService.js
const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = require("../utils/generateToken");
const prisma = require("../utils/prisma");
const { toUserDTO } = require("../utils/serializers/user"); // DTO

const emailService = require("./emailService");

// Helper ném lỗi thống nhất
function httpError(message, status = 400) {
  const e = new Error(message);
  e.status = status;
  return e;
}

// helper: gắn company cho user dù schema có/không có relation 'company'
async function attachCompany(u) {
  if (!u) {
    return u;
  }
  // nếu đã có company (quan hệ Prisma), dùng luôn
  if (u.company) {
    return u;
  }
  // fallback: tra theo owner_id
  const comp = await prisma.company.findFirst({
    where: { owner_id: u.id }, // u.id là BigInt sẵn
    include: { verification: true },
  });
  return comp ? { ...u, company: comp } : u;
}

module.exports = {
  // Đăng ký user mới (gửi mail verify bằng JWT)
  async register({ name, email, password, role }) {
    const emailLc = (email || "").toLowerCase().trim();

    if (!emailLc.endsWith("@gmail.com")) {
      throw httpError("Chỉ chấp nhận email @gmail.com!", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: emailLc },
    });
    if (existingUser) {
      throw httpError("Email đã tồn tại!", 409);
    }

    // Chốt role cho an toàn
    let userRole = "applicant";
    if (role === "recruiter") {
      userRole = "recruiter";
    } else if (role === "admin") {
      throw httpError("Không thể tự đăng ký với quyền admin!", 403);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: emailLc,
        avatar: "uploads/pic.jpg",
        password: hashedPassword,
        role: userRole,
        isVerified: false,
      },
    });

    // Tạo token xác thực email (JWT) + gửi email
    const verifyToken = jwt.sign(
      { userId: user.id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );
    const verifyLink = `${process.env.CLIENT_URL}/api/auth/verify-email?token=${verifyToken}`;

    await emailService.sendEmail(
      emailLc,
      "Xác thực tài khoản",
      `<p>Chào ${name},</p>
       <p>Vui lòng xác thực email của bạn bằng cách nhấn vào đường link dưới đây:</p>
       <p><a href="${verifyLink}">${verifyLink}</a></p>
       <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>`,
    );

    // Trả về DTO để FE dùng ngay (không trả password/BigInt)
    return { user: toUserDTO(user) };
  },
  // Đăng nhập
  async login(email, password) {
    const emailLc = (email || "").toLowerCase().trim();

    // 1) Lấy user (không include để tránh lỗi nếu schema không có field 'company')
    let user = await prisma.user.findUnique({ where: { email: emailLc } });
    if (!user) {
      throw httpError("Email hoặc mật khẩu không đúng!", 400);
    }

    // 2) So khớp mật khẩu & trạng thái
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw httpError("Email hoặc mật khẩu không đúng!", 400);
    }
    if (!user.isVerified) {
      throw httpError("Tài khoản chưa được xác thực qua email!", 403);
    }

    // 3) Gắn company (qua relation nếu có, hoặc fallback owner_id)
    user = await attachCompany(user);

    // 4) Trả token + DTO đầy đủ (có company nếu sở hữu)
    const token = generateToken(user.id.toString(), user.role);
    return { token, user: toUserDTO(user) };
  },

  // Yêu cầu đặt lại mật khẩu (gửi link kèm hash mới)
  async requestReset(email, newPassword) {
    const emailLc = (email || "").toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: emailLc } });
    if (!user) {
      throw httpError("Email không tồn tại!", 404);
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
      emailLc,
      "Xác nhận đặt lại mật khẩu",
      `<p>Xin chào ${user.name},</p>
       <p>Bạn đã yêu cầu đổi mật khẩu. Nhấn link dưới đây để xác nhận:</p>
       <p><a href="${resetLink}">${resetLink}</a></p>
       <p>Liên kết sẽ hết hạn sau 1 giờ.</p>`,
    );

    return { message: "Liên kết xác nhận đã được gửi tới email của bạn!" };
  },

  // Xác nhận qua link để đặt lại mật khẩu
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
        password: decodeURIComponent(hashed), // giữ logic cũ
        reset_token: null,
        reset_token_expiry: null,
      },
    });

    return { message: "Mật khẩu đã được đặt lại thành công!" };
  },

  // Lấy thông tin cá nhân — include company + verification, trả DTO
  async getMe(userId) {
    const uid = BigInt(userId);

    // Thử include theo quan hệ 'company' nếu có
    let u = await prisma.user.findUnique({
      where: { id: uid },
      include: { company: { include: { verification: true } } },
    });
    if (!u) {
      const e = new Error("Không tìm thấy người dùng");
      e.status = 404;
      throw e;
    }

    // Fallback: tra company theo owner_id nếu u.company rỗng
    if (!u.company) {
      const comp = await prisma.company.findFirst({
        where: { owner_id: uid },
        include: { verification: true },
      });
      if (comp) {
        u = { ...u, company: comp };
      }
    }

    return toUserDTO(u);
  },

  // Xác thực email (JWT trong link)
  async verifyEmail(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: BigInt(decoded.userId) },
    });

    if (!user) {
      throw httpError("Không tìm thấy người dùng!", 404);
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
