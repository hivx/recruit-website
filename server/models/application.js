// models/application.js
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coverLetter: {
    type: String,
    required: true,
  },
  cv: {
    type: String,  // Lưu đường dẫn đến file CV
    required: false, // Nếu bạn muốn không bắt buộc thì set là false
  },
  phone: {
    type: String,
    required: false, // Số điện thoại của ứng viên
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Application', ApplicationSchema);
