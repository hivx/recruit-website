const bcrypt = require("bcryptjs");
const prisma = require("../../utils/prisma");

async function main() {
  // hash mật khẩu demo
  const hash = await bcrypt.hash("demo123", 10);

  // chèn user mới
  const u = await prisma.user.create({
    data: {
      name: "Chu Văn Hiếu",
      email: "chuvanhieu357@gmail.com",
      password: hash,
      role: "applicant",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
    },
  });

  console.log("Inserted user:", u);
}

function run() {
  main()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error("Error:", err);
      return prisma.$disconnect();
    });
}

run();
