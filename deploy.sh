#!/bin/bash

# Milkman API Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting Milkman API Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please create .env file from env.example"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Warning: Node.js version should be 18 or higher${NC}"
fi

echo -e "${GREEN}✓ Node.js version: $(node --version)${NC}"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --production

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Create uploads directory
echo ""
echo "📁 Creating uploads directory..."
mkdir -p uploads
chmod 755 uploads
echo -e "${GREEN}✓ Uploads directory ready${NC}"

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
npm run migrate

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Migration failed. Please check your database configuration.${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ Migrations completed${NC}"
fi

# Check if PM2 is installed
if command -v pm2 &> /dev/null; then
    echo ""
    echo "🔄 Restarting application with PM2..."
    
    # Stop existing process if running
    pm2 stop milkman-api 2>/dev/null || true
    pm2 delete milkman-api 2>/dev/null || true
    
    # Start application
    pm2 start src/server.ts --name milkman-api --interpreter ts-node
    pm2 save
    
    echo -e "${GREEN}✓ Application started with PM2${NC}"
    echo ""
    echo "Useful commands:"
    echo "  pm2 logs milkman-api    # View logs"
    echo "  pm2 status              # Check status"
    echo "  pm2 restart milkman-api # Restart"
else
    echo ""
    echo -e "${YELLOW}⚠️  PM2 not found. Install it with: npm install -g pm2${NC}"
    echo "Or start manually with: npm start"
fi

echo ""
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo "Test your API:"
echo "  curl http://localhost:4000/api/health"
