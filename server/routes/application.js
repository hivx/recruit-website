// routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const applicationController = require('../controllers/applicationController');

// @route   POST /api/applications
// @desc    Ứng tuyển công việc
router.post('/', auth, applicationController.createApplication);

module.exports = router;
