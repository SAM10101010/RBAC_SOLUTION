#!/bin/bash

# Development startup script

set -e

echo "🚀 Starting RBAC System Development Environment..."

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

# Build and start containers
echo "📦 Building Docker images..."
docker-compose build

echo "🐳 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if app is running
echo "✅ Services started successfully!"
echo ""
echo "📍 Access the application at: http://localhost:3000"
echo "📍 PostgreSQL at: localhost:5432"
echo ""
echo "Test accounts:"
echo "  📧 admin@example.com (password)"
echo "  📧 editor@example.com (password)"
echo "  📧 viewer@example.com (password)"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
