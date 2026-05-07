const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { validateProduct, validateProductSearch } = require('../middleware/validate');

router.get('/', validateProductSearch, getProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('admin', 'manager'), validateProduct, createProduct);
router.put('/:id', protect, authorize('admin', 'manager'), validateProduct, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
