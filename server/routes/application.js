const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const applicationController = require('../controllers/applicationController');

// @route   POST /api/applications
// @desc    Ứng tuyển công việc (chỉ dành cho applicant)
router.post(
  '/',
  auth,
  authorizeRoles('applicant', 'admin'), // chỉ applicant hoặc admin
  applicationController.createApplication
);

module.exports = router;
