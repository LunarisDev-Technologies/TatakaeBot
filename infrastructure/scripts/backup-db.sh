#!/bin/bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/nexus_postgres_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "📦 Creating Tatakae Nexus database backup: $FILENAME"
docker exec -t nexus_postgres pg_dump -U nexus tatakae_nexus | gzip > "$FILENAME"

echo "✅ Backup successfully created at $FILENAME"

# Retention policy: remove backups older than 14 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -exec rm {} \;
echo "🧹 Cleaned up backups older than 14 days."

