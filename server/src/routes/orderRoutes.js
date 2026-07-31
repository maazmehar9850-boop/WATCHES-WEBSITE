const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  trackOrder,
  orderAction,
  updateTracking,
  getInvoice,
} = require('../controllers/orderController');
const { protect, admin, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/track', trackOrder);
router.get('/track/:id', trackOrder);
router.get('/invoice/:id', getInvoice);
router.get('/my', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders);
router.post('/:id/action', protect, admin, orderAction);
router.put('/:id/tracking', protect, admin, updateTracking);
router.get('/:id', optionalAuth, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
