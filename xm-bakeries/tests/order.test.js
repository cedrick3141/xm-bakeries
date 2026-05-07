require('./setup');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

jest.mock('../config/db', () => jest.fn());
jest.mock('../src/models/User');
jest.mock('../src/models/Order');
jest.mock('../src/models/Product');
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    startSession: jest.fn().mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    }),
  };
});

const User = require('../src/models/User');
const Order = require('../src/models/Order');
const Product = require('../src/models/Product');

const makeToken = () =>
  jwt.sign({ id: '648a1f2b3c4d5e6f7a8b9c0d' }, process.env.JWT_SECRET, { expiresIn: '1d' });

const setupAuthMock = (role = 'customer') => {
  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue({
      _id: '648a1f2b3c4d5e6f7a8b9c0d',
      name: 'Customer',
      email: 'c@test.com',
      role,
    }),
  });
};

describe('Order Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/orders', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });

    it('should return orders for authenticated user', async () => {
      setupAuthMock('customer');
      Order.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });
      Order.countDocuments.mockResolvedValue(0);

      const res = await request(app).get('/api/orders').set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/orders', () => {
    it('should return 400 with empty items array', async () => {
      setupAuthMock('customer');
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ items: [] });
      expect(res.status).toBe(400);
    });

    it('should return 400 with invalid product ID', async () => {
      setupAuthMock('customer');
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ items: [{ product: 'invalid-id', quantity: 2 }] });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should return 403 for customer role', async () => {
      setupAuthMock('customer');
      const res = await request(app)
        .patch('/api/orders/648a1f2b3c4d5e6f7a8b9c0d/status')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ status: 'confirmed' });
      expect(res.status).toBe(403);
    });
  });
});
