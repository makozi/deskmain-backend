# Database Migrations

This directory contains all SQL migration files that define and evolve the DeskMain database schema.

## Overview

The migration system automatically tracks which migrations have been executed in the `migrations` table, ensuring idempotent and safe schema updates.

## Migration Files

### 001_initial_schema.sql
**Purpose**: Initialize core database schema  
**Contains**: 40+ tables covering all major features

**Tables Created**:
- **User Management**: users, user_settings, email_preferences, privacy_settings
- **Product Management**: products, orders, order_items
- **Courses**: courses, course_modules, course_lessons, lesson_progress, course_enrollments
- **Subscriptions**: subscription_plans, user_subscriptions, coupons
- **Notifications & Disputes**: notifications, disputes, dispute_comments
- **Financial**: wallets, wallet_transactions, payouts
- **Affiliate Program**: affiliate_accounts, affiliate_clicks, affiliate_earnings
- **Reviews**: reviews
- **System**: system_settings

**Key Features**:
- UUID primary keys for all tables
- Foreign key relationships with cascading deletes
- 40+ indexes for optimal query performance
- JSONB fields for flexible data storage
- Automatic `updated_at` timestamp management via triggers

### 002_add_auth_tables.sql
**Purpose**: Add authentication and security infrastructure  
**Depends on**: 001_initial_schema.sql

**Tables Created**:
- **oauth_providers**: OAuth provider integrations (Google, GitHub, Facebook, Apple)
- **password_reset_tokens**: Password reset token management
- **email_verification_tokens**: Email verification token tracking
- **two_factor_auth**: Two-factor authentication configuration
- **login_history**: User login audit trail
- **active_sessions**: Active user session management
- **audit_logs**: Comprehensive audit logging for compliance

**Key Features**:
- Token expiration tracking
- Session management with security
- Audit logging for all sensitive actions
- Cleanup functions for expired tokens
- Security indexes for fast lookups

### 003_add_webhooks_and_email.sql
**Purpose**: Add webhook and email management infrastructure  
**Depends on**: 001_initial_schema.sql

**Tables Created**:
- **webhooks**: Webhook endpoint configuration
- **webhook_deliveries**: Webhook delivery tracking and retry logic
- **email_queue**: Outbound email queue
- **email_campaigns**: Email campaign management
- **campaign_recipients**: Campaign recipient tracking
- **email_templates**: Reusable email templates

**Key Features**:
- Retry logic for failed webhook deliveries
- Email queue for asynchronous sending
- Campaign segmentation support
- Template variable management
- Archive/cleanup functions for old records

## Running Migrations

### Automatic Migration
```bash
npm run migrate:run
```

### Check Migration Status
```bash
npm run migrate:status
```

### Manual Migration (using Node directly)
```bash
node src/migrations/migrate.js run
node src/migrations/migrate.js status
```

## How Migrations Work

1. **Detection**: The system scans for SQL files matching pattern `###_*.sql`
2. **Tracking**: Executed migrations are recorded in the `migrations` table
3. **Execution**: Only pending (unexecuted) migrations are run
4. **Safety**: Already-existing objects are skipped (idempotency)
5. **Logging**: All actions are logged for audit trail

## Migration Table Structure

```sql
CREATE TABLE migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Example contents:
```
id | name                               | executed_at
1  | 001_initial_schema.sql             | 2024-05-17 10:00:00
2  | 002_add_auth_tables.sql            | 2024-05-17 10:05:00
3  | 003_add_webhooks_and_email.sql     | 2024-05-17 10:10:00
```

## Creating New Migrations

When adding new features requiring schema changes:

1. **Create File**: `004_feature_name.sql`
   ```sql
   -- DeskMain Database Migration: Feature Description
   -- Version: 004
   -- Description: What this migration does
   
   CREATE TABLE new_table (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     ...
   );
   ```

2. **Run Migration**:
   ```bash
   npm run migrate:run
   ```

3. **Verify**:
   ```bash
   npm run migrate:status
   ```

## Best Practices

### Do's ✅
- Use descriptive migration names
- Test migrations locally first
- Keep migrations focused (one feature per migration)
- Include comments explaining complex changes
- Use transactions where possible
- Create indexes for foreign keys
- Add `created_at` and `updated_at` timestamps
- Use UUID for primary keys
- Document any manual steps required

### Don'ts ❌
- Don't modify existing migration files
- Don't skip migration numbering
- Don't assume table existence (use CREATE TABLE IF NOT EXISTS)
- Don't remove old indexes without replacing them
- Don't make breaking changes without planning
- Don't leave migrations untested
- Don't commit database changes without migration files

## Troubleshooting

### Failed Migration

**Problem**: Migration stops with error

**Solution**:
1. Check the error message
2. Review the SQL syntax in the migration file
3. Test the SQL directly in PostgreSQL
4. Fix the issue and re-run

```bash
npm run migrate:status  # Check what's left to run
```

### Duplicate Migration

**Problem**: Migration table shows duplicate entries

**Solution**:
1. This shouldn't happen with proper migrations
2. If it does, check database integrity
3. Review the migrations table:
   ```sql
   SELECT * FROM migrations;
   ```

### Migration Not Running

**Problem**: Migration file exists but doesn't execute

**Solution**:
1. Check file naming: Must be `###_*.sql`
2. Check migration file list:
   ```bash
   npm run migrate:status
   ```
3. Ensure database connection works
4. Check file permissions

## Schema Diagram

```
Users
├── user_settings
├── email_preferences
└── privacy_settings

Products
├── orders
│   └── order_items
└── reviews

Courses
├── course_modules
│   └── course_lessons
│       └── lesson_progress
└── course_enrollments

Subscriptions
├── subscription_plans
├── user_subscriptions
└── coupons

Financial
├── wallets
│   └── wallet_transactions
├── payouts
└── affiliate_accounts
    ├── affiliate_clicks
    └── affiliate_earnings

Authentication
├── oauth_providers
├── password_reset_tokens
├── email_verification_tokens
├── two_factor_auth
├── login_history
├── active_sessions
└── audit_logs

Webhooks & Email
├── webhooks
│   └── webhook_deliveries
├── email_queue
├── email_campaigns
│   └── campaign_recipients
└── email_templates

Notifications
├── notifications
├── disputes
│   └── dispute_comments
└── system_settings
```

## Additional Resources

- See DEPLOYMENT.md for deployment instructions
- See API_DOCUMENTATION.md for API endpoints
- See src/config/database.js for database connection setup
- See src/migrations/migrate.js for migration runner code

## Questions?

Refer to:
1. DEPLOYMENT.md - Deployment and troubleshooting
2. TASK_9_COMPLETION.md - Task details and overview
3. Database schema files directly
4. Team documentation
