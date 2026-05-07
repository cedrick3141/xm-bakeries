require('./setup');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

jest.mock('../config/db', () => jest.fn());
jest.mock('../src/models/Product');
jest.mock('../src/models/User');

const Product = require('../src/models/Product');
const User = require('../src/models/User');

const makeToken = (role = 'admin') =>
  jwt.sign({ id: '648a1f2b3c4d5e6f7a8b9c0d' }, process.env.JWT_SECRET, { expiresIn: '1d' });

const mockUser = (role = 'admin') => ({
  _id: '648a1f2b3c4d5e6f7a8b9c0d',
  name: 'Admin User',
  email: 'admin@xmbakeries.com',
  role,
});

// Auth middleware calls User.findById(...).select('-password')
const setupAuthMock = (role = 'admin') => {
  User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser(role)) });
};

describe('Product Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/products', () => {
    it('should return list of products', async () => {
      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([
          { _id: '1', name: 'White Bread', price: 500, category: 'bread', quantity: 50 },
        ]),
      });
      Product.countDocuments.mockResolvedValue(1);

      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by category', async () => {
      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      Product.countDocuments.mockResolvedValue(0);

      const res = await request(app).get('/api/products?category=cake');
      expect(res.status).toBe(200);
    });

    it('should reject invalid category', async () => {
      const res = await request(app).get('/api/products?category=invalid_cat');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/products', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).post('/api/products').send({
        name: 'Croissant', price: 800, category: 'pastry', quantity: 30,
      });
      expect(res.status).toBe(401);
    });

    it('should return 403 for customer role', async () => {
      setupAuthMock('customer');
      const token = makeToken('customer');
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Croissant', price: 800, category: 'pastry', quantity: 30 });
      expect(res.status).toBe(403);
    });

    it('should create a product as admin', async () => {
      setupAuthMock('admin');
      Product.create.mockResolvedValue({
        _id: 'prod1', name: 'Croissant', price: 800, category: 'pastry', quantity: 30,
      });
      const token = makeToken('admin');
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Croissant', price: 800, category: 'pastry', quantity: 30 });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 if price is missing', async () => {
      setupAuthMock('admin');
      const token = makeToken('admin');
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Croissant', category: 'pastry', quantity: 30 });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should soft-delete product as admin', async () => {
      setupAuthMock('admin');
      Product.findByIdAndUpdate.mockResolvedValue({ _id: 'prod1', isActive: false });
      const token = makeToken('admin');
      const res = await request(app)
        .delete('/api/products/648a1f2b3c4d5e6f7a8b9c0d')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
