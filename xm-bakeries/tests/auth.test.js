require('./setup');
const request = require('supertest');
const app = require('../src/app');

// Mock mongoose to avoid real DB connection in unit tests
jest.mock('../config/db', () => jest.fn());
jest.mock('../src/models/User', () => {
  const mockUser = {
    _id: '648a1f2b3c4d5e6f7a8b9c0d',
    name: 'Test User',
    email: 'test@example.com',
    role: 'customer',
    comparePassword: jest.fn(),
  };
  return {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };
});

const User = require('../src/models/User');

describe('Auth Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Registration ───────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('should return 400 when name is missing', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when email is invalid', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'not-an-email',
        password: 'password123',
      });
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 when password is too short', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
      });
      expect(res.status).toBe(400);
    });

    it('should return 201 on successful registration', async () => {
      const jwt = require('jsonwebtoken');
      User.create.mockResolvedValue({
        _id: '648a1f2b3c4d5e6f7a8b9c0d',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });
  });

  // ─── Login ──────────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('should return 400 when email is missing', async () => {
      const res = await request(app).post('/api/auth/login').send({ password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('should return 401 when credentials are invalid', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrongpass' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 200 and token on valid login', async () => {
      const mockUser = {
        _id: '648a1f2b3c4d5e6f7a8b9c0d',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.success).toBe(true);
    });
  });

  // ─── Protected route ────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('should return 401 without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return 401 with an invalid token', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalidtoken');
      expect(res.status).toBe(401);
    });
  });
});
