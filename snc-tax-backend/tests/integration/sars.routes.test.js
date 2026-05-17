import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Mock database and logger
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

function getAuthToken(user = { id: 'user-1', email: 'test@test.com', role: 'admin' }) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
}

describe('SARS Routes', () => {
  const token = getAuthToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/sars/validate/:taxRef', () => {
    it('should validate a tax reference number', async () => {
      const res = await request
        .get('/api/sars/validate/9012345678')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('taxReference', '9012345678');
      expect(res.body).toHaveProperty('valid', true);
      expect(res.body).toHaveProperty('mock', true); // Mock mode in test
    });

    it('should reject invalid short tax reference', async () => {
      const res = await request
        .get('/api/sars/validate/123')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('valid', false);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request.get('/api/sars/validate/9012345678');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/sars/filing-status', () => {
    it('should return filing status for a company', async () => {
      const res = await request
        .get('/api/sars/filing-status')
        .query({ taxRef: '9012345678', filingType: 'EMP201' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('filingType', 'EMP201');
      expect(res.body).toHaveProperty('submissions');
      expect(res.body.submissions).toBeInstanceOf(Array);
    });

    it('should require taxRef query parameter', async () => {
      const res = await request
        .get('/api/sars/filing-status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'taxRef is required');
    });

    it('should default to EMP201 when filingType not specified', async () => {
      const res = await request
        .get('/api/sars/filing-status')
        .query({ taxRef: '9012345678' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('filingType', 'EMP201');
    });
  });

  describe('GET /api/sars/tcs/:taxRef', () => {
    it('should return TCS certificate status', async () => {
      const res = await request
        .get('/api/sars/tcs/9012345678')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'compliant');
      expect(res.body).toHaveProperty('pinNumber');
      expect(res.body).toHaveProperty('valid', true);
    });
  });

  describe('GET /api/sars/outstanding/:taxRef', () => {
    it('should return outstanding returns', async () => {
      const res = await request
        .get('/api/sars/outstanding/9012345678')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('outstanding');
      expect(res.body.outstanding).toBeInstanceOf(Array);
      expect(res.body).toHaveProperty('totalOutstanding');
    });
  });

  describe('GET /api/sars/status', () => {
    it('should return SARS integration status', async () => {
      const res = await request
        .get('/api/sars/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('configured', false); // Not configured in test
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('not configured');
    });
  });
});
