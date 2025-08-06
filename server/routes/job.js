const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const jobController = require('../controllers/jobController');
const authOptional = require('../middleware/authOptional');

// POST: Chỉ recruiter được đăng tin
router.post(
  '/',
  authMiddleware,
  authorizeRoles('recruiter', 'admin'),  // chỉ recruiter hoặc admin
  jobController.createJob
);

// GET all: public
router.get('/', jobController.getAllJobs);

// GET all tags
router.get('/tags', jobController.getAllTags);

// GET by ID: public, nhưng nếu đã đăng nhập thì sẽ trả về thông tin yêu thích
router.get('/:id', authOptional, jobController.getJobById);

// Cập nhật công việc
router.put('/:id', authMiddleware, jobController.updateJob);

// DELETE công việc: chỉ cho phép người tạo hoặc admin
router.delete('/:id', authMiddleware, authorizeRoles('recruiter', 'admin'), jobController.deleteJob);

// GET popular tags: public
router.get('/popular-tags', jobController.getPopularTags);

module.exports = router;
