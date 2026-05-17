#!/bin/bash
# SNC-TAX Database Backup Script
# Run daily via cron: 0 1 * * * /path/to/backup-db.sh

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_NAME="${DATABASE_NAME:-snc_tax_db}"
DB_USER="${DATABASE_USER:-postgres}"
DB_HOST="${DATABASE_HOST:-localhost}"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "Starting backup: $DB_NAME → $BACKUP_FILE"

# Run pg_dump and compress
if docker compose ps | grep -q "snc-tax-db"; then
  # If running in Docker
  docker compose exec -T database pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"
else
  # Local PostgreSQL
  pg_dump -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"
fi

# Check if backup was successful
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✓ Backup complete: $BACKUP_FILE ($SIZE)"
else
  echo "✗ Backup FAILED"
  exit 1
fi

# Remove backups older than retention period
echo "Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
REMAINING=$(find "$BACKUP_DIR" -name "*.sql.gz" | wc -l)
echo "✓ $REMAINING backup files retained"
