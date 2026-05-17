import { jest } from '@jest/globals';
import { errorHandler, AppError } from '../../src/middleware/errorHandler.js';

function createMocks() {
  const req = {};
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('Error Handler', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('errorHandler middleware', () => {
    it('should format AppError with correct status', () => {
      const { req, res, next } = createMocks();
      const error = new AppError('Not found', 404);

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            status: 404,
            message: 'Not found',
          }),
        })
      );
    });

    it('should default to 500 for generic errors', () => {
      const { req, res, next } = createMocks();
      const error = new Error('Something broke');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            status: 500,
            message: 'Something broke',
          }),
        })
      );
    });

    it('should include stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';
      const { req, res, next } = createMocks();
      const error = new AppError('Debug error', 400);

      errorHandler(error, req, res, next);

      const responseBody = res.json.mock.calls[0][0];
      expect(responseBody.error).toHaveProperty('stack');
    });

    it('should exclude stack trace in production mode', () => {
      process.env.NODE_ENV = 'production';
      const { req, res, next } = createMocks();
      const error = new AppError('Prod error', 400);

      errorHandler(error, req, res, next);

      const responseBody = res.json.mock.calls[0][0];
      expect(responseBody.error).not.toHaveProperty('stack');
    });

    it('should handle errors with statusCode property', () => {
      const { req, res, next } = createMocks();
      const error = new Error('Forbidden');
      error.statusCode = 403;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('AppError class', () => {
    it('should create error with message and status code', () => {
      const error = new AppError('Test error', 422);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(422);
      expect(error).toBeInstanceOf(Error);
    });

    it('should default status code to 500', () => {
      const error = new AppError('Server error');
      expect(error.statusCode).toBe(500);
    });

    it('should have proper stack trace', () => {
      const error = new AppError('Traceable', 400);
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Traceable');
    });
  });
});
