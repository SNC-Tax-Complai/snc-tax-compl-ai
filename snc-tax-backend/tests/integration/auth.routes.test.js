import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Mock database before importing app
const mockDb = {
  oneOrNone: jest.fn(),
  one: jest.fn(),
  none: jest.fn(),
  any: jest.fn(),
  query: jest.fn(),
};
jest.unstable_mockModule('../../src/config/database.js', () => ({
  default: mockDb,
  healthCheck: jest.fn().mockResolvedValue(true),
}));
jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

const { default: supertest } = await import('supertest');
const { default: app } = await import('../../src/app.js');

const request = supertest(app);
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt-signing';

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should reject login with missing credentials', async () => {
      const res = await request.post('/api/auth/login').send({});

      expect(res.status).toBe(400);
    });

    it('should reject login with invalid email format', async () => {
      const res = await request.post('/api/auth/login').send({
        email: 'not-an-email',
        password: 'password123',
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject login when user not found', async () => {
      mockDb.oneOrNone.mockResolvedValue(null);

      const res = await request.post('/api/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should reject registration with missing fields', async () => {
      const res = await request.post('/api/auth/register').send({
        email: 'new@test.com',
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject registration with weak password', async () => {
      const res = await request.post('/api/auth/register').send({
        email: 'new@test.com',
        password: '123', // Too short
        name: 'Test User',
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid token', async () => {
      const userData = {
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test User',
        role: 'admin',
        company_id: 'company-1',
      };

      mockDb.oneOrNone.mockResolvedValue(userData);

      const token = jwt.sign(
        { id: userData.id, email: userData.email, role: userData.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', userData.email);
    });

    it('should reject request without token', async () => {
      const res = await request.get('/api/auth/me');

      expect(res.status).toBe(401);
    });
  });
});

describe('Health Check', () => {
  it('should return health status', async () => {
    const res = await request.get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('version', '2.0.0');
  });
});
