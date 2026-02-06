#!/bin/bash
# GRC Shield - Database Backup Script
# Usage: ./scripts/backup-db.sh

set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/grcshield_$TIMESTAMP.sql"

echo "=========================================="
echo "GRC Shield Database Backup"
echo "Timestamp: $TIMESTAMP"
echo "=========================================="

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating backup..."
docker-compose exec -T db pg_dump -U grcuser grcshield > $BACKUP_FILE

# Compress backup
echo "Compressing backup..."
gzip $BACKUP_FILE

# Keep only last 30 backups
echo "Cleaning old backups..."
ls -t $BACKUP_DIR/*.sql.gz | tail -n +31 | xargs -r rm

echo "Backup complete: ${BACKUP_FILE}.gz"
echo "=========================================="
