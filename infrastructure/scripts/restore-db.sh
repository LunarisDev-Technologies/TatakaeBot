#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: ./restore-db.sh <path-to-backup.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: Backup file '$BACKUP_FILE' does not exist."
  exit 1
fi

echo "⚠️ Restoring Tatakae Nexus database from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | docker exec -i nexus_postgres psql -U nexus -d tatakae_nexus

echo "✅ Restoration completed successfully!"

