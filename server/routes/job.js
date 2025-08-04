const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const jobController = require('../controllers/jobController');

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

// GET by ID: public
router.get('/:id', jobController.getJobById);

// GET popular tags: public
router.get('/popular-tags', jobController.getPopularTags);

module.exports = router;
