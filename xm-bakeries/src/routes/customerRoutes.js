const express = require('express');
const router = express.Router();
const { getCustomers, getCustomer, updateCustomer } = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'manager'));

router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.put('/:id', authorize('admin'), updateCustomer);

module.exports = router;
