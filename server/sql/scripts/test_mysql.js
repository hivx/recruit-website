// scripts/test_mysql.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  try {
    // hash mật khẩu demo
    const hash = await bcrypt.hash('demo123', 10);

    // chèn user mới
    const u = await prisma.user.create({
      data: {
        name: 'Chu Văn Hiếu',
        email: 'chuvanhieu357@gmail.com',
        password: hash,
        role: 'applicant'
      },
      select: { id: true, name: true, email: true, role: true, created_at: true }
    });

    console.log('Inserted user:', u);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
