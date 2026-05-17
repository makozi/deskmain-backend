# DeskMain Backend Testing Guide

This directory contains comprehensive test suites for the DeskMain backend application, including unit tests, integration tests, and test utilities.

## Test Structure

```
tests/
├── controllers/          # Unit tests for business logic
├── routes/              # Integration tests for API endpoints
├── middleware/          # Tests for authentication and error handling
├── utils/              # Shared test utilities and helpers
└── README.md           # This file
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests for specific file
```bash
npm test course.controller.test.js
```

### Run tests with coverage report
```bash
npm test -- --coverage
```

### Run specific test suite
```bash
npm test -- --testPathPattern=controllers
```

## Test Coverage Goals

Target coverage metrics:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

Current coverage is tracked in `./coverage/` directory after running tests with `--coverage` flag.

## Test Types

### Unit Tests (Controllers)

Located in `controllers/` directory. Tests individual controller functions in isolation using mocked database calls.

**Example: course.controller.test.js**
- Tests create, read, update, delete operations
- Mocks database responses
- Verifies error handling
- Validates response formats

**Controllers Tested:**
- `course.controller.test.js` - Course CRUD and enrollment
- `subscription.controller.test.js` - Subscription management
- `notification.controller.test.js` - Notification operations
- `analytics.controller.test.js` - Analytics calculations
- `dispute.controller.test.js` - Dispute management
- `setting.controller.test.js` - User settings and preferences

### Integration Tests (Routes)

Located in `routes/` directory. Tests API endpoints using supertest, verifying:
- Route parameters and query strings
- Request/response formats
- Authentication requirements
- HTTP status codes
- Error responses

**Example: course.routes.test.js**
- Tests GET, POST, PUT, DELETE endpoints
- Verifies authentication middleware
- Validates response data structure

**Routes Tested:**
- `course.routes.test.js` - Course endpoints
- `subscription.routes.test.js` - Subscription endpoints
- `notification.routes.test.js` - Notification endpoints
- `analytics.routes.test.js` - Analytics endpoints

## Test Utilities

Located in `utils/test-helpers.js`, provides:

### Mock Creators
- `createMockRequest()` - Create request object with defaults
- `createMockResponse()` - Create response object with mocked methods
- `createMockDbResult()` - Create database query result
- `createMockDbError()` - Create database error

### Data Generators
- `generateMockProduct()` - Generate product test data
- `generateMockOrder()` - Generate order test data
- `generateMockUser()` - Generate user test data
- `generateMockCourse()` - Generate course test data
- `generateMockSubscriptionPlan()` - Generate subscription plan data

### Assertion Helpers
- `assertSuccessResponse()` - Verify successful response
- `assertErrorResponse()` - Verify error response
- `assertCreatedResponse()` - Verify 201 created response
- `assertPaginationResponse()` - Verify pagination data

### Utilities
- `sleep()` - Delay for async tests
- `verifyDbQuery()` - Verify database was queried correctly
- `setupTestFixtures()` - Setup common test data

## Common Testing Patterns

### Testing Controller Functions

```javascript
import * as controller from '../../controllers/course.controller.js';
import db from '../../config/database.js';
import { createMockRequest, createMockResponse, assertSuccessResponse } from '../utils/test-helpers.js';

jest.mock('../../config/database.js');

describe('Course Controller', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    jest.clearAllMocks();
  });

  it('should get course by id', async () => {
    req.params = { courseId: 'course-1' };
    const mockCourse = { id: 'course-1', title: 'Python 101' };

    db.query.mockResolvedValueOnce({ rows: [mockCourse] });

    await controller.getCourse(req, res);

    assertSuccessResponse(res, mockCourse);
  });
});
```

### Testing Routes with Supertest

```javascript
import request from 'supertest';
import express from 'express';
import courseRoutes from '../../routes/course.routes.js';

describe('Course Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/courses', courseRoutes);
  });

  it('should get all courses', async () => {
    const response = await request(app)
      .get('/api/v1/courses')
      .query({ page: 1, limit: 20 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Database Mocking

All tests mock the database module to avoid real database operations:

```javascript
jest.mock('../../config/database.js');

// In test:
db.query.mockResolvedValueOnce({ rows: [mockData] });
```

## Authentication Testing

Routes with authentication requirements verify the `authenticate` middleware is called:

```javascript
it('should require authentication', async () => {
  authenticate.mockImplementation((req, res, next) => {
    res.status(401).json({ success: false });
  });

  const response = await request(app)
    .post('/api/v1/courses');

  expect(response.status).toBe(401);
});
```

## Error Handling Tests

Each controller test includes error scenario testing:

```javascript
it('should handle database errors', async () => {
  db.query.mockRejectedValueOnce(new Error('Database error'));

  await controller.getCourse(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: expect.any(String)
  });
});
```

## Continuous Integration

Tests can be integrated into CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Run tests
  run: npm test -- --coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

## Best Practices

1. **Clear test descriptions** - Use descriptive `describe()` and `it()` blocks
2. **Setup and teardown** - Use `beforeEach()` and `afterEach()` appropriately
3. **Mock external dependencies** - Always mock database, logger, and external services
4. **Test edge cases** - Include tests for errors, invalid input, authorization failures
5. **DRY test code** - Use helper functions and fixtures to reduce duplication
6. **One assertion concept** - Each test should verify one specific behavior
7. **Meaningful assertions** - Use specific assertions that clearly indicate what was tested
8. **Keep tests fast** - Avoid real I/O operations; use mocks

## Debugging Tests

### Run single test file
```bash
npm test -- course.controller.test.js
```

### Run test with additional debug info
```bash
DEBUG=* npm test
```

### Watch specific test pattern
```bash
npm test -- --testNamePattern="course" --watch
```

## Future Enhancements

- [ ] Add E2E tests with test database
- [ ] Add performance benchmarking tests
- [ ] Add security testing (SQL injection, XSS, CSRF)
- [ ] Add data validation tests for all endpoints
- [ ] Generate API test report for documentation
- [ ] Add test coverage CI checks with thresholds

## Troubleshooting

### Tests not found
Ensure test files follow pattern: `**/*.test.js` and are in the `tests/` directory.

### Mock not working
Ensure mock path matches import path exactly. Use `jest.mock()` before imports.

### Async test timeout
Increase Jest timeout:
```javascript
jest.setTimeout(10000); // 10 seconds
```

### Test state leaking
Always clear mocks in `beforeEach()`:
```javascript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## Contributing Tests

When adding new features:
1. Create test file in appropriate directory
2. Write tests for happy path and error cases
3. Ensure all new code is tested (aim for 80%+ coverage)
4. Update this README if adding new test utilities
5. Run full test suite before committing

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Library](https://testing-library.com/)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
