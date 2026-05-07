const { body, query, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  handleValidationErrors,
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('category')
    .isIn(['bread', 'cake', 'pastry', 'cookie', 'beverage', 'other'])
    .withMessage('Invalid category'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  handleValidationErrors,
];

const validateOrder = [
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
  body('deliveryAddress').optional().trim(),
  handleValidationErrors,
];

const validateProductSearch = [
  query('category')
    .optional()
    .isIn(['bread', 'cake', 'pastry', 'cookie', 'beverage', 'other'])
    .withMessage('Invalid category'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be non-negative'),
  query('minQty').optional().isInt({ min: 0 }).withMessage('minQty must be non-negative'),
  query('sortBy')
    .optional()
    .isIn(['price', '-price', 'name', '-name', 'quantity', '-quantity', 'createdAt', '-createdAt'])
    .withMessage('Invalid sort field'),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateOrder,
  validateProductSearch,
};
