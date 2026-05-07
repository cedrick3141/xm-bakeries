const express = require('express');
const router = express.Router();
const { getSalesReport, getProductPerformance, getLowStockAlerts } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'manager'));

router.get('/sales', getSalesReport);
router.get('/products', getProductPerformance);
router.get('/low-stock', getLowStockAlerts);

module.exports = router;
