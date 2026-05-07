const User = require('../models/User');

// GET /api/customers  (admin/manager)
const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: 'customer' };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [customers, total] = await Promise.all([
      User.find(filter).select('-password').sort('name').skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), data: customers });
  } catch (error) {
    next(error);
  }
};

// GET /api/customers/:id  (admin/manager)
const getCustomer = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// PUT /api/customers/:id  (admin only)
const updateCustomer = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select('-password');
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer updated', data: customer });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, getCustomer, updateCustomer };
