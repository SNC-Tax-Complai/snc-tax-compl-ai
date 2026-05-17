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

function getAuthToken(user = { id: 'user-1', email: 'test@test.com', role: 'admin', companyId: 'company-1' }) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
}

describe('AI Routes', () => {
  const token = getAuthToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/ai/providers', () => {
    it('should list available AI providers', async () => {
      const res = await request
        .get('/api/ai/providers')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('providers');
      expect(res.body.providers).toBeInstanceOf(Array);
      expect(res.body.providers.length).toBeGreaterThan(0);

      const provider = res.body.providers[0];
      expect(provider).toHaveProperty('id');
      expect(provider).toHaveProperty('name');
      expect(provider).toHaveProperty('status');
    });

    it('should reject unauthenticated request', async () => {
      const res = await request.get('/api/ai/providers');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/ai/classify', () => {
    it('should classify compliance text', async () => {
      mockDb.oneOrNone.mockResolvedValue(null);

      const res = await request
        .post('/api/ai/classify')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Submit monthly EMP201 payroll return to SARS' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('module');
    });

    it('should require text field', async () => {
      const res = await request
        .post('/api/ai/classify')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Text is required');
    });
  });

  describe('POST /api/ai/generate-recommendations', () => {
    it('should generate recommendations for a company', async () => {
      mockDb.oneOrNone.mockResolvedValue({
        id: 'company-1',
        name: 'Test Co',
        company_type: 'pty_ltd',
        industry_sector: 'technology',
        employee_count: 25,
        annual_turnover: 12000000,
      });

      const res = await request
        .post('/api/ai/generate-recommendations')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('recommendations');
      expect(res.body.recommendations).toBeInstanceOf(Array);
    });
  });
});
