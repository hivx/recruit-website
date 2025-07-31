const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json(req.user); // Trả về user đã gán từ middleware
});

module.exports = router;
