import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { requireAuth, requireRole } from '../../src/middleware/auth.js';
import { AppError } from '../../src/middleware/errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt-signing';

// Helper: create mock Express req/res/next
function createMocks(overrides = {}) {
  const req = {
    headers: {},
    user: null,
    ...overrides,
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('Auth Middleware', () => {
  describe('requireAuth', () => {
    it('should pass with valid JWT token', () => {
      const token = jwt.sign(
        { id: 'user-1', email: 'test@test.com', role: 'admin' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      const { req, res, next } = createMocks({
        headers: { authorization: `Bearer ${token}` },
      });

      requireAuth(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // No error argument
      expect(req.user).toBeDefined();
      expect(req.user.email).toBe('test@test.com');
      expect(req.user.role).toBe('admin');
    });

    it('should reject when no token provided', () => {
      const { req, res, next } = createMocks({
        headers: {},
      });

      requireAuth(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
    });

    it('should reject expired token', () => {
      const token = jwt.sign(
        { id: 'user-1', email: 'test@test.com' },
        JWT_SECRET,
        { expiresIn: '-1h' } // Already expired
      );

      const { req, res, next } = createMocks({
        headers: { authorization: `Bearer ${token}` },
      });

      requireAuth(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
    });

    it('should reject invalid token', () => {
      const { req, res, next } = createMocks({
        headers: { authorization: 'Bearer totally-invalid-token' },
      });

      requireAuth(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
    });

    it('should reject token signed with wrong secret', () => {
      const token = jwt.sign(
        { id: 'user-1', email: 'test@test.com' },
        'wrong-secret-key',
        { expiresIn: '1h' }
      );

      const { req, res, next } = createMocks({
        headers: { authorization: `Bearer ${token}` },
      });

      requireAuth(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('requireRole', () => {
    it('should pass when user has required role', () => {
      const { req, res, next } = createMocks();
      req.user = { id: 'user-1', role: 'admin' };

      const middleware = requireRole(['admin']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('should reject when user lacks required role', () => {
      const { req, res, next } = createMocks();
      req.user = { id: 'user-1', role: 'viewer' };

      const middleware = requireRole(['admin']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(403);
    });

    it('should accept any of multiple allowed roles', () => {
      const { req, res, next } = createMocks();
      req.user = { id: 'user-1', role: 'editor' };

      const middleware = requireRole(['admin', 'editor']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should reject when no user is set', () => {
      const { req, res, next } = createMocks();
      req.user = null;

      const middleware = requireRole(['admin']);
      middleware(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
    });
  });
});
