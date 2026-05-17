#!/bin/bash

# DeskMain Deployment Initialization Script
# This script prepares the application for deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
DEPLOYMENT_DIR=$(pwd)

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DeskMain Backend Deployment Init     ║${NC}"
echo -e "${BLUE}║   Environment: ${ENVIRONMENT}              ${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Validate environment
echo -e "${YELLOW}Step 1: Validating environment...${NC}"

if [ ! -f "package.json" ]; then
  echo -e "${RED}✗ package.json not found${NC}"
  exit 1
fi

if [ ! -f ".env.${ENVIRONMENT}" ] && [ ! -f ".env" ]; then
  echo -e "${RED}✗ Environment file not found (.env.${ENVIRONMENT} or .env)${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Environment validation passed${NC}"
echo ""

# Step 2: Create necessary directories
echo -e "${YELLOW}Step 2: Creating necessary directories...${NC}"

mkdir -p logs
mkdir -p uploads
mkdir -p backups
mkdir -p temp
mkdir -p data

chmod 755 logs uploads backups temp data

echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"

if command -v npm &> /dev/null; then
  npm ci --omit=dev
  echo -e "${GREEN}✓ Dependencies installed${NC}"
else
  echo -e "${RED}✗ npm not found${NC}"
  exit 1
fi
echo ""

# Step 4: Validate environment variables
echo -e "${YELLOW}Step 4: Validating environment variables...${NC}"

# Load environment file
if [ -f ".env.${ENVIRONMENT}" ]; then
  source ".env.${ENVIRONMENT}"
elif [ -f ".env" ]; then
  source ".env"
fi

# Check critical variables
REQUIRED_VARS=(
  "NODE_ENV"
  "PORT"
  "DB_HOST"
  "DB_USER"
  "DB_NAME"
  "JWT_SECRET"
)

missing_vars=0
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "${RED}✗ Missing required environment variable: $var${NC}"
    missing_vars=$((missing_vars + 1))
  fi
done

if [ $missing_vars -gt 0 ]; then
  echo -e "${RED}✗ Missing ${missing_vars} required environment variable(s)${NC}"
  exit 1
fi

echo -e "${GREEN}✓ All critical environment variables are set${NC}"
echo ""

# Step 5: Build application
echo -e "${YELLOW}Step 5: Building application...${NC}"

if [ "$ENVIRONMENT" = "production" ]; then
  npm run build
else
  echo -e "${GREEN}✓ Skipping build for non-production environment${NC}"
fi
echo ""

# Step 6: Run database migrations
if [ -f "scripts/setup-database.sh" ]; then
  echo -e "${YELLOW}Step 6: Setting up database...${NC}"
  bash scripts/setup-database.sh
  echo ""
else
  echo -e "${YELLOW}Step 6: Database setup script not found, skipping...${NC}"
  echo ""
fi

# Step 7: Verify application
echo -e "${YELLOW}Step 7: Verifying application...${NC}"

# Check if server starts successfully (with timeout)
if timeout 10 npm run start > /dev/null 2>&1 &
then
  sleep 2
  pkill -f "npm run start" || true
  echo -e "${GREEN}✓ Application starts successfully${NC}"
else
  echo -e "${RED}✗ Application failed to start${NC}"
  exit 1
fi
echo ""

# Step 8: Print deployment information
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Deployment initialization completed!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Deployment Information:${NC}"
echo "  Environment: $ENVIRONMENT"
echo "  Port: ${PORT:-5000}"
echo "  Database: $DB_NAME"
echo "  Host: $DB_HOST"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review the environment variables in .env.${ENVIRONMENT}"
echo "  2. Start the application: npm run start"
echo "  3. Monitor logs in the logs/ directory"
echo ""
