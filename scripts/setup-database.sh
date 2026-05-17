#!/bin/bash

# DeskMain Database Setup Script
# This script initializes the PostgreSQL database with migrations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== DeskMain Database Setup ===${NC}"

# Check if required environment variables are set
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
  echo -e "${RED}Error: Required environment variables not set${NC}"
  echo "Please ensure DB_HOST, DB_USER, and DB_NAME are set"
  exit 1
fi

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
max_attempts=30
attempt=1

while ! pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" >/dev/null 2>&1; do
  if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}Database failed to start after ${max_attempts} attempts${NC}"
    exit 1
  fi
  echo "Attempt $attempt/$max_attempts: Waiting for database..."
  sleep 2
  attempt=$((attempt + 1))
done

echo -e "${GREEN}✓ Database is ready${NC}"

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
npm run migrate:run

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Database migrations completed successfully${NC}"
else
  echo -e "${RED}✗ Database migrations failed${NC}"
  exit 1
fi

# Show migration status
echo -e "${YELLOW}Migration status:${NC}"
npm run migrate:status

echo -e "${GREEN}=== Database setup completed successfully ===${NC}"
