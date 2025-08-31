// server/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// ✅ Dùng Prisma thay vì Mongoose
const prisma = require('./utils/prisma');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// Khởi tạo app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Health check: kiểm tra kết nối MySQL/Prisma
app.get('/sql', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: 'mysql' });
  } catch (e) {
    console.error('DB health error:', e);
    res.status(500).json({ ok: false, error: 'DB not reachable' });
  }
});

// Route đơn giản test
app.get('/', (req, res) => {
  res.send('Hello từ API Tuyển dụng (MySQL/Prisma)!');
});

// Routes chính
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/job'));
app.use('/api/applications', require('./routes/application'));
app.use('/api/users', require('./routes/user'));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Graceful shutdown: đóng Prisma khi dừng app
process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
  console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
});
