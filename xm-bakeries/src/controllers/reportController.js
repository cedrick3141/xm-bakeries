const Order = require('../models/Order');
const Product = require('../models/Product');

// GET /api/reports/sales  — total sales summary
const getSalesReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const matchStage = { status: { $in: ['confirmed', 'processing', 'delivered'] } };
    if (from || to) {
      matchStage.createdAt = {};
      if (from) matchStage.createdAt.$gte = new Date(from);
      if (to) matchStage.createdAt.$lte = new Date(to);
    }

    const [summary] = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $count: {} },
          averageOrderValue: { $avg: '$totalAmount' },
        },
      },
    ]);

    // Revenue by day
    const dailySales = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $count: {} },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        summary: summary || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
        dailySales,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/products — product performance
const getProductPerformance = async (req, res, next) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'processing', 'delivered'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    res.json({ success: true, data: topProducts });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/low-stock — low stock alerts
const getLowStockAlerts = async (req, res, next) => {
  try {
    const products = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $project: {
          name: 1,
          category: 1,
          quantity: 1,
          lowStockThreshold: 1,
          isLow: { $lte: ['$quantity', '$lowStockThreshold'] },
        },
      },
      { $match: { isLow: true } },
      { $sort: { quantity: 1 } },
    ]);

    res.json({
      success: true,
      count: products.length,
      message: products.length === 0 ? 'All stock levels are healthy' : `${products.length} product(s) need restocking`,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSalesReport, getProductPerformance, getLowStockAlerts };
