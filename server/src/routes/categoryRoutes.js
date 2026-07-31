const express = require('express');
const {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload, processImages } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getCategories);
router.get('/admin/all', protect, admin, getAllCategories);
router.post('/', protect, admin, upload.single('image'), processImages, createCategory);
router.put('/:id', protect, admin, upload.single('image'), processImages, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
