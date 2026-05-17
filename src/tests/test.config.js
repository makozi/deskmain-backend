/**
 * Test Configuration and Setup
 * Provides environment setup, test fixtures, and global test utilities
 */

/**
 * Setup global test environment
 */
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/deskmain_test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_EXPIRY = '7d';
  process.env.API_URL = 'http://localhost:5000';
  process.env.CORS_ORIGIN = 'http://localhost:3000';
  process.env.RATE_LIMIT_WINDOW = '15';
  process.env.RATE_LIMIT_MAX_REQUESTS = '100';
});

/**
 * Cleanup after all tests
 */
afterAll(() => {
  // Cleanup test environment
  delete process.env.DATABASE_URL;
  delete process.env.JWT_SECRET;
});

/**
 * Global test timeout
 */
jest.setTimeout(10000);

/**
 * Mock logger to prevent test output pollution
 */
jest.mock('../config/logger.js', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

/**
 * Global error handler for unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

/**
 * Suppress console output during tests
 */
const originalError = console.error;
const originalLog = console.log;

beforeEach(() => {
  console.error = jest.fn(originalError);
  console.log = jest.fn(originalLog);
});

afterEach(() => {
  console.error = originalError;
  console.log = originalLog;
});
