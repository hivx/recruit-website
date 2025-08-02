const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: String,
  description: String,
  salary: String,
  requirements: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByName: { // 👈 Thêm trường này
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
