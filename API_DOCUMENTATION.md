# DeskMain API Documentation

## Overview

The DeskMain API is a comprehensive RESTful API for a global commerce operating system. It provides endpoints for e-commerce, digital courses, subscription management, and marketplace operations.

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Authentication (`/auth`)

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "user"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "token": "jwt_token"
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "token": "jwt_token"
  }
}
```

### Products (`/products`)

#### Get All Products
```
GET /products?category=electronics&sort=price&page=1&limit=20

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "category": "electronics",
      "stock": 50
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

#### Create Product
```
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "category": "electronics",
  "stock": 50,
  "sku": "PROD-001"
}

Response: 201 Created
```

### Orders (`/orders`)

#### Create Order
```
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "card"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "total": 199.98,
    "status": "pending"
  }
}
```

#### Get Orders
```
GET /orders
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "total": 199.98,
      "status": "completed",
      "createdAt": "2026-05-17T10:00:00Z"
    }
  ]
}
```

### Courses (`/courses`)

#### Get All Courses
```
GET /courses?category=programming&limit=20

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Python 101",
      "description": "Learn Python basics",
      "price": 49.99,
      "instructor": "Jane Smith",
      "category": "programming",
      "duration": 8
    }
  ]
}
```

#### Enroll in Course
```
POST /courses/:courseId/enroll
Authorization: Bearer <token>

Response: 201 Created
{
  "success": true,
  "message": "Enrolled successfully"
}
```

#### Get Enrolled Courses
```
GET /courses/enrolled/my-courses
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Python 101",
      "progress": 50,
      "enrolledAt": "2026-05-17T10:00:00Z"
    }
  ]
}
```

### Subscriptions (`/subscriptions`)

#### Get Subscription Plans
```
GET /subscriptions/plans

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Basic",
      "price": 9.99,
      "billingCycle": "monthly",
      "features": ["Feature 1", "Feature 2"]
    }
  ]
}
```

#### Subscribe to Plan
```
POST /subscriptions/plans/:planId/subscribe
Authorization: Bearer <token>

Response: 201 Created
{
  "success": true,
  "message": "Subscription activated"
}
```

### Search (`/search`)

#### Search
```
GET /search?q=laptop&type=products&limit=20

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Laptop",
      "type": "product",
      "price": 999.99
    }
  ],
  "count": 5
}
```

#### Get Search Suggestions
```
GET /search/suggestions?q=lap

Response: 200 OK
{
  "success": true,
  "data": ["laptop", "lap desk", "laptop stand"]
}
```

### Notifications (`/notifications`)

#### Get Notifications
```
GET /notifications?limit=20
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Order Confirmation",
      "message": "Your order has been confirmed",
      "type": "order",
      "read": false,
      "createdAt": "2026-05-17T10:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

#### Mark as Read
```
PUT /notifications/:notificationId/read
Authorization: Bearer <token>

Response: 200 OK
```

### Analytics (`/analytics`)

#### Get Platform Analytics
```
GET /analytics/platform?days=30
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "totalTransactions": 5000,
    "platformRevenue": 50000.00,
    "conversionRate": "3.2%"
  }
}
```

#### Get Merchant Analytics
```
GET /analytics/merchant?days=30
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "totalRevenue": 5000.00,
    "totalOrders": 100,
    "averageOrderValue": 50.00
  }
}
```

### Disputes (`/disputes`)

#### Create Dispute
```
POST /disputes
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "uuid",
  "reason": "Item not as described",
  "description": "The product quality is poor",
  "evidenceUrls": ["https://example.com/photo1.jpg"]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending"
  }
}
```

### Settings (`/settings`)

#### Get User Settings
```
GET /settings/user-settings
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "theme": "light",
    "notificationsEmail": true,
    "language": "en"
  }
}
```

#### Update User Settings
```
PUT /settings/user-settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "theme": "dark",
  "notificationsEmail": false,
  "language": "es"
}

Response: 200 OK
```

#### Get Email Preferences
```
GET /settings/email-preferences
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "newsletter": true,
    "promotional": false,
    "updates": true,
    "transactional": true
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Status Codes

- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting

The API implements rate limiting:
- Window: 15 minutes
- Max Requests: 100 per window
- Rate limit headers included in responses

## Pagination

List endpoints support pagination:

```
GET /endpoint?page=1&limit=20
```

Response includes:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting:

```
GET /products?category=electronics&sort=price&order=asc
```

## Webhooks

### Webhook Events

- `order.created` - Order created
- `order.updated` - Order status changed
- `payment.completed` - Payment successful
- `user.created` - New user registered
- `course.enrolled` - User enrolled in course

### Webhook Signature Verification

All webhooks include an `X-Webhook-Signature` header with HMAC-SHA256 signature.

## API Documentation

Full interactive API documentation is available at:

```
http://localhost:5000/api/docs
```

Swagger/OpenAPI specification available at:

```
http://localhost:5000/api/docs.json
```

## Versioning

The API uses URL versioning: `/api/v1/...`

Future versions will be available at `/api/v2/...` etc.

## Support

For issues or questions:
- Email: support@deskmain.com
- Documentation: https://docs.deskmain.com
