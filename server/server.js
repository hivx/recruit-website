const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Khởi tạo app
const app = express();

// Load biến môi trường từ .env
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json()); // Đọc JSON từ request body

// Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Kết nối MongoDB thành công!'))
.catch((err) => console.error('Lỗi kết nối MongoDB:', err));

// Route đơn giản để test
app.get('/', (req, res) => {
  res.send('Hello từ API Tuyển dụng!');
});

// Mở cổng server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
  console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
});

// Import và sử dụng route cho xác thực người dùng
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Import và sử dụng route cho việc đăng tin tuyển dụng
const jobRoutes = require('./routes/job');
app.use('/api/jobs', jobRoutes);

// Import và sử dụng route cho ứng tuyển
app.use('/api/applications', require('./routes/application'));

// Import và sử dụng route cho người dùng
const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);
