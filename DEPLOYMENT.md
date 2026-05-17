# DeskMain Backend - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the DeskMain backend application in different environments: development, staging, and production.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Database Setup](#database-setup)
5. [Deployment Environments](#deployment-environments)
6. [Production Deployment](#production-deployment)
7. [Health Checks & Monitoring](#health-checks--monitoring)
8. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- Node.js 18+ or Docker/Docker Compose
- PostgreSQL 13+ (or Docker)
- Redis (or Docker)
- Environment-specific configuration file

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment file
cp config/development.env.example .env.development
nano .env.development  # Edit with your local values

# 3. Start Docker services (PostgreSQL, Redis)
docker-compose up -d

# 4. Run database migrations
npm run migrate:run

# 5. Start the development server
npm run dev
```

Access the API at `http://localhost:5000`

## Environment Setup

### Configuration Files

Environment-specific example files are located in the `config/` directory:

- `config/development.env.example` - Development environment template
- `config/staging.env.example` - Staging environment template
- `config/production.env.example` - Production environment template

### Setting Up an Environment

1. Copy the appropriate template:

```bash
# For development
cp config/development.env.example .env.development

# For staging
cp config/staging.env.example .env.staging

# For production
cp config/production.env.example .env.production
```

2. Edit the file and fill in all required values:

```bash
nano .env.development
```

3. Set the environment variable:

```bash
export NODE_ENV=development
```

### Critical Configuration Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development`, `staging`, `production` |
| `DB_HOST` | Database host address | `localhost` |
| `DB_NAME` | Database name | `deskmain_dev` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `secure-password` |
| `JWT_SECRET` | JWT signing secret | `your-secure-random-string` |
| `REDIS_HOST` | Redis host | `localhost` |
| `AWS_S3_BUCKET` | S3 bucket name | `deskmain-bucket` |

## Docker Deployment

### Development with Docker Compose

```bash
# Start all services (PostgreSQL, Redis, API)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Building Custom Docker Image

```bash
# Build the image
docker build -t deskmain-api:latest .

# Run the container
docker run -d \
  --name deskmain-api \
  -p 5000:5000 \
  --env-file .env.production \
  deskmain-api:latest

# Check health
docker ps
docker logs deskmain-api
```

### Production Docker Compose

```bash
# Start production services
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d

# View logs
docker-compose logs -f api

# Scale API service
docker-compose up -d --scale api=3

# Stop services
docker-compose down
```

## Database Setup

### Running Migrations

The migration system tracks executed migrations in the database to ensure idempotency.

```bash
# Run pending migrations
npm run migrate:run

# Check migration status
npm run migrate:status

# Using Node directly
node src/migrations/migrate.js run
node src/migrations/migrate.js status
```

### Migration Files

Migrations are stored in `src/migrations/` and execute in numeric order:

1. **001_initial_schema.sql** - Core tables (users, products, orders, courses, etc.)
2. **002_add_auth_tables.sql** - Authentication infrastructure
3. **003_add_webhooks_and_email.sql** - Webhooks and email management

### Manual Database Setup

If you need to set up the database manually:

```bash
# 1. Create database
createdb -U postgres deskmain_dev

# 2. Connect to database
psql -U postgres -d deskmain_dev

# 3. Run migrations
\i src/migrations/001_initial_schema.sql
\i src/migrations/002_add_auth_tables.sql
\i src/migrations/003_add_webhooks_and_email.sql
```

## Deployment Environments

### Development

**Purpose**: Local development with hot reload and debugging

```bash
# Setup
npm install
cp config/development.env.example .env.development
docker-compose up -d

# Run
npm run dev

# Features:
# - Hot reload on code changes
# - Verbose logging
# - Mock services
# - Live database
```

### Staging

**Purpose**: Production-like environment for testing before release

```bash
# Setup
NODE_ENV=staging bash scripts/init-deployment.sh staging
docker-compose up -d

# Run
npm run start

# Features:
# - Real cloud services (AWS, Stripe test keys)
# - Performance similar to production
# - Full logging and monitoring
# - Pre-release testing environment
```

### Production

**Purpose**: Live environment for real users

```bash
# Setup
NODE_ENV=production bash scripts/init-deployment.sh production
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d

# Run (automatic via Docker)

# Features:
# - Real payment processors (Stripe live keys)
# - High availability setup
# - Comprehensive monitoring
# - Security hardening
# - Automated backups
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database backups enabled
- [ ] SSL/TLS certificates installed
- [ ] Redis cluster configured
- [ ] Monitoring and alerting set up
- [ ] Logging infrastructure in place
- [ ] CDN configured (CloudFlare)
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Secrets stored securely (vault)

### Deployment Steps

1. **Prepare Infrastructure**

```bash
# Ensure database is ready
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT version();"

# Test Redis connection
redis-cli -h $REDIS_HOST ping
```

2. **Deploy Application**

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm ci --omit=dev

# Run migrations
npm run migrate:run

# Start application
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

3. **Verify Deployment**

```bash
# Check application health
curl https://api.deskmain.com/health

# Check database connections
npm run test:db

# Check Redis connection
npm run test:redis
```

4. **Monitor Deployment**

```bash
# Watch logs
docker-compose logs -f api

# Check metrics
# Visit New Relic/DataDog dashboards
# Monitor error rates in Sentry
```

### Rollback Procedure

If deployment fails:

```bash
# Stop current deployment
docker-compose down

# Revert to previous version
git revert HEAD
npm ci --omit=dev

# Redeploy
docker-compose up -d
npm run migrate:run
```

## Health Checks & Monitoring

### Health Check Endpoint

The API provides a health check endpoint:

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-05-17T10:30:00Z",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected",
  "version": "1.0.0"
}
```

### Monitoring Services

#### New Relic (APM)

Set environment variables:
```bash
NEW_RELIC_LICENSE_KEY=your-key
NEW_RELIC_APP_NAME=DeskMain-API
```

View at: https://one.newrelic.com

#### Sentry (Error Tracking)

Set environment variables:
```bash
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production
```

#### DataDog (Optional)

Set environment variables:
```bash
DATADOG_API_KEY=your-key
DATADOG_APP_KEY=your-key
```

### Metrics to Monitor

- **Response Time**: Target < 200ms
- **Error Rate**: Target < 0.1%
- **CPU Usage**: Target < 70%
- **Memory Usage**: Target < 80%
- **Database Connections**: Monitor pool usage
- **Redis Hit Rate**: Target > 80%

## Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check database is running
pg_isready -h $DB_HOST -p $DB_PORT

# Test connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1"

# Check environment variables
echo $DB_HOST $DB_USER $DB_NAME
```

#### Migrations Failed

```bash
# Check migration status
npm run migrate:status

# View migration table
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT * FROM migrations;"

# Manually fix issues if needed
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

#### Redis Connection Failed

```bash
# Check Redis is running
redis-cli -h $REDIS_HOST ping

# Verify credentials
redis-cli -h $REDIS_HOST -a $REDIS_PASSWORD ping
```

#### Out of Memory

```bash
# Check container memory
docker stats deskmain-api

# Increase Docker memory limit in docker-compose.yml
# Add: mem_limit: 2g

# Check Node process memory
npm run check:memory
```

### Debugging

Enable debug logging:

```bash
# Set environment variable
export DEBUG=deskmain:*

# Or in .env file
DEBUG=deskmain:*

# Run application
npm run dev
```

View detailed logs:

```bash
# Docker logs
docker-compose logs -f api

# Application logs
tail -f logs/error.log
tail -f logs/combined.log
```

## Backup & Recovery

### Database Backups

Backups are configured to run automatically. Manual backup:

```bash
# Create backup
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > backup-$(date +%Y%m%d).sql

# Restore from backup
psql -h $DB_HOST -U $DB_USER $DB_NAME < backup-20240517.sql
```

### Upload Backups to S3

```bash
# In production .env
DB_BACKUP_ENABLED=true
DB_BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM

# Check backup
aws s3 ls s3://deskmain-prod-backups/
```

## Next Steps

After deployment:

1. Verify all services are running
2. Test API endpoints
3. Monitor logs and metrics
4. Set up automated backups
5. Configure monitoring alerts
6. Document deployment procedures
7. Train team on deployment process

For more information:
- See README.md for project overview
- See API_DOCUMENTATION.md for API endpoints
- See src/tests/README.md for testing procedures
