#!/bin/bash
# GRC Shield - Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.yml"

echo "=========================================="
echo "GRC Shield Deployment Script"
echo "Environment: $ENVIRONMENT"
echo "=========================================="

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    export $(cat .env.$ENVIRONMENT | xargs)
    echo "Loaded environment variables from .env.$ENVIRONMENT"
fi

# Pull latest images
echo "Pulling latest images..."
docker-compose -f $COMPOSE_FILE pull

# Stop existing containers
echo "Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down --remove-orphans

# Start new containers
echo "Starting new containers..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for health check
echo "Waiting for application to be healthy..."
sleep 30

# Check health
if curl -f http://localhost:5000/health/live > /dev/null 2>&1; then
    echo "Application is healthy!"
else
    echo "ERROR: Application health check failed!"
    docker-compose -f $COMPOSE_FILE logs --tail=100
    exit 1
fi

# Run database migrations
echo "Running database migrations..."
docker-compose -f $COMPOSE_FILE exec -T app npm run db:push || true

# Cleanup old images
echo "Cleaning up old images..."
docker system prune -f

echo "=========================================="
echo "Deployment complete!"
echo "=========================================="
