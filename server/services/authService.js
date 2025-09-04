const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const generateToken = require("../utils/generateToken");

const prisma = new PrismaClient();

// Đăng ký
exports.register = async ({ name, email, password }) => {
  // Kiểm tra email tồn tại
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email đã tồn tại");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Tạo user mới
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return newUser;
};

// Đăng nhập
exports.login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Email không tồn tại");
  }

  if (!user.isVerified) {
    throw new Error("Tài khoản chưa được xác thực qua email");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Sai mật khẩu");
  }

  const token = generateToken(user.id.toString(), user.role);

  return {
    token,
    user: {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

// Lấy thông tin cá nhân
exports.getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: BigInt(userId) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      created_at: true,
    },
  });

  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }
  return user;
};
