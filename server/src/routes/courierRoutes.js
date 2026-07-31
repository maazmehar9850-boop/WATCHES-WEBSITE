const express = require('express');
const {
  getCouriers,
  getActiveCouriers,
  createCourier,
  updateCourier,
  addEmployee,
  addVehicle,
  deleteCourier,
} = require('../controllers/courierController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/active', getActiveCouriers);
router.get('/', protect, admin, getCouriers);
router.post('/', protect, admin, createCourier);
router.put('/:id', protect, admin, updateCourier);
router.post('/:id/employees', protect, admin, addEmployee);
router.post('/:id/vehicles', protect, admin, addVehicle);
router.delete('/:id', protect, admin, deleteCourier);

module.exports = router;
