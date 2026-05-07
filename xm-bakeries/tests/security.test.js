require('./setup');
const request = require('supertest');
const app = require('../src/app');

jest.mock('../config/db', () => jest.fn());
jest.mock('../src/models/User');

describe('Security Tests', () => {
  describe('HTTP Security Headers (helmet)', () => {
    it('should set X-Content-Type-Options header', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-Frame-Options header', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-frame-options']).toBeDefined();
    });
  });

  describe('Input Validation & Injection Prevention', () => {
    it('should reject XSS attempts in email field', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: '<script>alert(1)</script>',
        password: 'password',
      });
      expect(res.status).toBe(400);
    });

    it('should reject SQL/NoSQL injection patterns in login', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: '{"$gt": ""}',
        password: '{"$gt": ""}',
      });
      expect(res.status).toBe(400);
    });

    it('should reject oversized request body', async () => {
      const bigPayload = { name: 'A'.repeat(100000), email: 'x@x.com', password: '123456' };
      const res = await request(app).post('/api/auth/register').send(bigPayload);
      // Either 400 (validation) or 413 (payload too large) — both mean attack was blocked
      expect([400, 413]).toContain(res.status);
    });
  });

  describe('Authorization Enforcement', () => {
    it('should return 401 on protected route without token', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });

    it('should return 401 with a malformed token', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', 'Bearer this.is.not.valid');
      expect(res.status).toBe(401);
    });

    it('should return 401 with an expired token', async () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { id: '648a1f2b3c4d5e6f7a8b9c0d' },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(res.status).toBe(401);
    });

    it('should return 404 on unknown route', async () => {
      const res = await request(app).get('/api/nonexistent-route');
      expect(res.status).toBe(404);
    });
  });

  describe('Health Check', () => {
    it('should respond with OK on /health', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
    });
  });
});
