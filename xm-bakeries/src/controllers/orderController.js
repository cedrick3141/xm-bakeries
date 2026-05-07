const Order = require('../models/Order');
const Product = require('../models/Product');
const logger = require('../utils/logger');

// POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, notes } = req.body;

    let totalAmount = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity}`,
        });
      }

      // Deduct stock in real-time
      product.quantity -= item.quantity;
      await product.save();

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      enrichedItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal,
      });
    }

    const order = await Order.create({
      customer: req.user._id,
      items: enrichedItems,
      totalAmount,
      deliveryAddress,
      notes,
    });

    logger.info(`Order created: ${order._id} by customer ${req.user._id}, total: ${totalAmount}`);
    const populated = await Order.findById(order._id).populate('customer', 'name email phone');
    res.status(201).json({ success: true, message: 'Order placed successfully', data: populated });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders  (admin/manager: all orders; customer: own orders)
const getOrders = async (req, res, next) => {
  try {
    const filter = req.user.role === 'customer' ? { customer: req.user._id } : {};
    const { status, page = 1, limit = 20 } = req.query;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name email phone')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), data: orders });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Customers can only see their own orders
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/orders/:id/status  (admin/manager only)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate(
      'customer',
      'name email'
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // If cancelled, restore inventory
    if (status === 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { quantity: item.quantity } });
      }
      logger.info(`Order ${order._id} cancelled — inventory restored`);
    }

    logger.info(`Order ${order._id} status updated to ${status} by ${req.user._id}`);
    res.json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders, getOrder, updateOrderStatus };
