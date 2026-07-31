const express = require('express');
const { login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const AppError = require('../utils/AppError');

const router = express.Router();

// Public user registration disabled — guests order without an account
router.post('/register', (req, res, next) => {
  next(new AppError('Registration is disabled. You can order as a guest.', 403));
});

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;
