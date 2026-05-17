/**
 * Test Helper Utilities
 * Provides common test setup, mocks, and assertions
 */

/**
 * Create mock request object with default values
 */
export const createMockRequest = (overrides = {}) => {
  return {
    user: { id: 'user-1', role: 'user', ...overrides.user },
    params: {},
    body: {},
    query: {},
    headers: { authorization: 'Bearer token' },
    ...overrides
  };
};

/**
 * Create mock response object
 */
export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    statusCode: 200,
    locals: {}
  };
  return res;
};

/**
 * Create mock database query result
 */
export const createMockDbResult = (rows = [], rowCount = 0) => {
  return {
    rows,
    rowCount: rowCount || rows.length,
    command: 'SELECT',
    oid: null,
    fields: []
  };
};

/**
 * Mock successful database response for INSERT
 */
export const mockDbInsert = (data) => {
  return createMockDbResult([data], 1);
};

/**
 * Mock successful database response for UPDATE
 */
export const mockDbUpdate = (data) => {
  return createMockDbResult([data], 1);
};

/**
 * Mock successful database response for DELETE
 */
export const mockDbDelete = (rowCount = 1) => {
  return createMockDbResult([], rowCount);
};

/**
 * Mock database error
 */
export const createMockDbError = (message = 'Database error') => {
  const error = new Error(message);
  error.code = 'ECONNREFUSED';
  return error;
};

/**
 * Assert successful JSON response
 */
export const assertSuccessResponse = (res, expectedData = null) => {
  expect(res.status).toHaveBeenCalledWith(200);
  const callArgs = res.json.mock.calls[0][0];
  expect(callArgs.success).toBe(true);
  if (expectedData) {
    expect(callArgs.data).toEqual(expectedData);
  }
};

/**
 * Assert error response
 */
export const assertErrorResponse = (res, statusCode, message = null) => {
  expect(res.status).toHaveBeenCalledWith(statusCode);
  const callArgs = res.json.mock.calls[0][0];
  expect(callArgs.success).toBe(false);
  if (message) {
    expect(callArgs.message).toEqual(message);
  }
};

/**
 * Assert created response (201)
 */
export const assertCreatedResponse = (res, expectedData = null) => {
  expect(res.status).toHaveBeenCalledWith(201);
  const callArgs = res.json.mock.calls[0][0];
  expect(callArgs.success).toBe(true);
  if (expectedData) {
    expect(callArgs.data).toEqual(expectedData);
  }
};

/**
 * Assert pagination response
 */
export const assertPaginationResponse = (res, expectedPage, expectedLimit, expectedTotal) => {
  assertSuccessResponse(res);
  const callArgs = res.json.mock.calls[0][0];
  expect(callArgs.pagination).toBeDefined();
  expect(callArgs.pagination.page).toBe(expectedPage);
  expect(callArgs.pagination.limit).toBe(expectedLimit);
  expect(callArgs.pagination.total).toBe(expectedTotal);
};

/**
 * Generate mock product data
 */
export const generateMockProduct = (overrides = {}) => {
  return {
    id: 'product-1',
    name: 'Test Product',
    description: 'Test product description',
    price: 99.99,
    category: 'electronics',
    stock: 50,
    sku: 'PROD-001',
    merchant_id: 'merchant-1',
    created_at: new Date(),
    ...overrides
  };
};

/**
 * Generate mock order data
 */
export const generateMockOrder = (overrides = {}) => {
  return {
    id: 'order-1',
    user_id: 'user-1',
    merchant_id: 'merchant-1',
    total: 199.98,
    status: 'pending',
    shipping_address: '123 Main St',
    payment_method: 'card',
    created_at: new Date(),
    ...overrides
  };
};

/**
 * Generate mock user data
 */
export const generateMockUser = (overrides = {}) => {
  return {
    id: 'user-1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password_hash: 'hashed_password',
    role: 'user',
    created_at: new Date(),
    ...overrides
  };
};

/**
 * Generate mock course data
 */
export const generateMockCourse = (overrides = {}) => {
  return {
    id: 'course-1',
    title: 'Python 101',
    description: 'Learn Python basics',
    price: 49.99,
    instructor: 'Jane Smith',
    category: 'programming',
    duration: 8,
    created_at: new Date(),
    ...overrides
  };
};

/**
 * Generate mock subscription plan data
 */
export const generateMockSubscriptionPlan = (overrides = {}) => {
  return {
    id: 'plan-1',
    name: 'Basic',
    price: 9.99,
    billing_cycle: 'monthly',
    features: JSON.stringify(['Feature 1', 'Feature 2']),
    created_at: new Date(),
    ...overrides
  };
};

/**
 * Sleep utility for async tests
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Verify database query was called with specific parameters
 */
export const verifyDbQuery = (mockDb, expectedQuery, expectedParams) => {
  const calls = mockDb.query.mock.calls;
  const foundCall = calls.find(call => {
    const [query, params] = call;
    return query.includes(expectedQuery) && JSON.stringify(params) === JSON.stringify(expectedParams);
  });
  expect(foundCall).toBeDefined();
};

/**
 * Setup common test fixtures
 */
export const setupTestFixtures = () => {
  const mockUser = generateMockUser();
  const mockProduct = generateMockProduct();
  const mockOrder = generateMockOrder();
  const mockCourse = generateMockCourse();

  return {
    mockUser,
    mockProduct,
    mockOrder,
    mockCourse
  };
};
