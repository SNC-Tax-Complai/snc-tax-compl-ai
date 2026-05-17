/**
 * Jest test setup
 * Sets environment variables for test execution
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-signing';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = '0'; // Random port for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/snc_tax_test';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.LOG_LEVEL = 'silent';
