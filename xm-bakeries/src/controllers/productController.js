const Product = require('../models/Product');
const logger = require('../utils/logger');

// GET /api/products  (with advanced search, filter, sort)
const getProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, minQty, search, sortBy = 'name', page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minQty) filter.quantity = { $gte: Number(minQty) };
    if (search) filter.$text = { $search: search };

    // Build sort
    const sortField = sortBy.startsWith('-') ? sortBy.slice(1) : sortBy;
    const sortOrder = sortBy.startsWith('-') ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// POST /api/products  (admin/manager only)
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    logger.info(`Product created: ${product.name} by user ${req.user._id}`);
    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id  (admin/manager only)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    logger.info(`Product updated: ${product._id} by user ${req.user._id}`);
    res.json({ success: true, message: 'Product updated', data: product });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id  (admin only — soft delete)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    logger.info(`Product deleted: ${product._id} by user ${req.user._id}`);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
