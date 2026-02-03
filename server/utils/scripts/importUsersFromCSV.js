// server/utils/scripts/importUsersFromCSV.js
const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcrypt");
const csv = require("csv-parser");
const prisma = require("../prisma");

// ===== CONFIG =====
const CSV_PATH = path.join(__dirname, "../data/users.csv");
const SALT_ROUNDS = 10;
const VALID_ROLES = new Set(["admin", "recruiter", "applicant"]);

async function importUsers() {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error("Không tìm thấy file users.csv");
  }

  const rows = [];

  // 1. Đọc CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", resolve)
      .on("error", reject);
  });

  if (!rows.length) {
    throw new Error("CSV không có dữ liệu");
  }

  console.log(`Đọc được ${rows.length} dòng`);

  // 2. Chuẩn hóa + validate + hash password
  const users = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const line = i + 2; // dòng CSV (trừ header)

    if (!r.name || !r.email || !r.password) {
      console.warn(`  Bỏ qua dòng ${line}: thiếu dữ liệu bắt buộc`);
      continue;
    }

    const role = String(r.role).trim().toLowerCase();

    if (!VALID_ROLES.has(r.role)) {
      console.warn(` Bỏ qua dòng ${line}: role không hợp lệ`);
      continue;
    }

    if (role === "admin") {
      console.warn(` Bỏ qua dòng ${line}: không cho phép import role admin`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(String(r.password), SALT_ROUNDS);

    users.push({
      name: String(r.name).trim(),
      email: String(r.email).toLowerCase().trim(),
      password: hashedPassword,
      role,
      isVerified: String(r.isVerified).toLowerCase() === "true",
    });
  }

  if (!users.length) {
    throw new Error("Không có user hợp lệ để import");
  }

  // 3. Insert DB
  const result = await prisma.user.createMany({
    data: users,
    skipDuplicates: true, // tránh lỗi email trùng
  });

  console.log(` Import thành công ${result.count} users`);
}

// Chạy import
(async () => {
  try {
    await importUsers();
  } catch (err) {
    console.error("IMPORT FAILED:", err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
