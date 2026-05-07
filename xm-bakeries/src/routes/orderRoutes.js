const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrder, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validate');

router.post('/', protect, validateOrder, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, authorize('admin', 'manager'), updateOrderStatus);

module.exports = router;
