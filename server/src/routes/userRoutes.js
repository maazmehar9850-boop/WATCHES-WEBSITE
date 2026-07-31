const express = require('express');
const {
  getUsers,
  toggleBlockUser,
  toggleWishlist,
  getWishlist,
  getDashboardStats,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/', protect, admin, getUsers);
router.put('/:id/block', protect, admin, toggleBlockUser);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
