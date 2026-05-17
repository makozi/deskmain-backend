# DeskMain Backend

Global Commerce Operating System - Backend API

## Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### Database Setup

```bash
# Import the database schema
psql -U postgres -d deskmain -f database.sql

# Or if database doesn't exist:
createdb -U postgres deskmain
psql -U postgres -d deskmain -f database.sql
```

### Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:5000`
API Documentation: `http://localhost:5000/api/docs`

### API Endpoints

All endpoints are prefixed with `/api/v1`

#### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `POST /auth/verify-email` - Verify email
- `POST /auth/refresh-token` - Refresh JWT
- `POST /auth/google` - Google OAuth

#### Merchants
- `POST /merchants` - Create merchant
- `GET /merchants/:id` - Get merchant details
- `PUT /merchants/:id` - Update merchant
- `POST /merchants/:id/kyc` - Submit KYC
- `GET /merchants/:id/dashboard` - Dashboard data

#### Products
- `GET /products` - List products
- `GET /products/:id` - Get product
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

#### Orders
- `GET /orders` - List orders
- `GET /orders/:id` - Get order
- `POST /orders` - Create order
- `POST /orders/:id/refund` - Request refund

#### Payments
- `POST /payments/initialize` - Initialize payment
- `GET /payments/verify/:reference` - Verify payment
- `POST /payments/webhook` - Payment webhook

#### Payouts
- `GET /payouts` - List payouts
- `POST /payouts` - Request payout

#### Cart
- `GET /cart` - Get cart
- `POST /cart/add` - Add item
- `POST /cart/remove` - Remove item

#### Wallet
- `GET /wallet/balance` - Get balance
- `GET /wallet/transactions` - Get transactions

#### Affiliates
- `POST /affiliates/join` - Join program
- `GET /affiliates/dashboard` - Dashboard
- `GET /affiliates/commissions` - Get commissions

#### Reviews
- `POST /reviews` - Create review
- `DELETE /reviews/:id` - Delete review

#### Admin
- `GET /admin/merchants` - List merchants
- `POST /admin/merchants/:id/approve-kyc` - Approve KYC
- `GET /admin/analytics` - Platform analytics

### Database Schema

See `database.sql` for complete schema with:
- Users, Merchants, Products
- Orders, Payments, Payouts
- Wallets, Transactions
- Affiliates, Commissions
- Reviews, KYC Documents
- Audit Logs, API Keys
- Webhooks, Email Campaigns
- And more...

### Security Features

- JWT Authentication
- Rate Limiting
- CORS Protection
- Helmet.js Security Headers
- Input Validation
- Password Hashing (bcrypt)
- Audit Logging

### Payment Providers

Integrated with:
- Flutterwave
- Stripe
- Payoneer
- Wise
- dLocal

Configure API keys in `.env`

### Development

```bash
npm run dev      # Start with nodemon
npm run test     # Run tests
npm run lint     # Lint code
npm run migrate  # Run migrations
npm run seed     # Seed database
```

### Project Structure

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API routes
├── controllers/     # Business logic (to be implemented)
├── models/          # Database models (to be implemented)
├── services/        # Business services (to be implemented)
├── utils/           # Utility functions
└── index.js         # Main application file
```

### Swagger Documentation

- Live docs: `http://localhost:5000/api/docs`
- JSON spec: `http://localhost:5000/api/docs.json`

### Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

### Support

For issues or questions, please contact support@deskmain.com

