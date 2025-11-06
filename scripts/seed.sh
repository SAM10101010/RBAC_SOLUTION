#!/bin/bash

# RBAC System Seed Script
# This script seeds the database with demo data for testing

set -e

echo "🌱 Starting RBAC system seed..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Creating demo users...${NC}"
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-token" \
  -d '{
    "email": "alice@company.com",
    "name": "Alice Chen",
    "password": "SecurePass123!",
    "role": "editor"
  }' 2>/dev/null

echo -e "${BLUE}Creating demo posts...${NC}"
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer editor-token" \
  -d '{
    "title": "Best Practices for RBAC Implementation",
    "content": "Role-Based Access Control is a fundamental security pattern...",
    "status": "published"
  }' 2>/dev/null

echo -e "${GREEN}✓ Seed complete!${NC}"
echo -e "${GREEN}Available test accounts:${NC}"
echo "  Admin: admin@example.com / password"
echo "  Editor: editor@example.com / password"
echo "  Viewer: viewer@example.com / password"
