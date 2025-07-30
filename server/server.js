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

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Kết nối MongoDB thành công!'))
.catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// Route đơn giản để test
app.get('/', (req, res) => {
  res.send('Hello từ API Tuyển dụng!');
});

// Mở cổng server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});

// Import và sử dụng các route
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Import và sử dụng route cho việc đăng tin tuyển dụng
const jobRoutes = require('./routes/job');
app.use('/api/jobs', jobRoutes);

// Import và sử dụng route cho ứng tuyển
app.use('/api/applications', require('./routes/application'));
