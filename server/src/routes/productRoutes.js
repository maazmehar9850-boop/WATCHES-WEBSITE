const express = require('express');
const {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getAdminProducts,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload, processImages } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/admin/all', protect, admin, getAdminProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProduct);
router.post('/', protect, admin, upload.array('images', 6), processImages, createProduct);
router.put('/:id', protect, admin, upload.array('images', 6), processImages, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
