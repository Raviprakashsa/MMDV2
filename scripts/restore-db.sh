#!/bin/bash
# MMD V2 Database Restore Script
# Created: 2026-06-07
#
# Description: Restores PostgreSQL and MongoDB databases from backup files.
#
# Usage:
#   ./restore-db.sh postgres /path/to/postgres_backup.sql.gz
#   ./restore-db.sh mongo /path/to/mongo_backup.archive.gz

set -euo pipefail

TYPE="${1:-}"
FILE="${2:-}"

if [[ -z "$TYPE" || -z "$FILE" ]]; then
  echo "Usage: $0 [postgres|mongo] [path_to_backup_file]"
  exit 1
fi

if [[ ! -f "$FILE" ]]; then
  echo "Error: Backup file '$FILE' not found."
  exit 1
fi

read -p "WARNING: This will overwrite active database data. Are you sure you want to proceed? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Restore aborted by user."
  exit 0
fi

case "$TYPE" in
  postgres)
    echo "Restoring PostgreSQL database from $FILE..."
    # Drop and recreate schema/db to ensure clean restore (safe check for schema-only or full DB)
    echo "Recreating PostgreSQL 'mmd_v2' database..."
    docker exec -i mmd_v2-postgres-1 psql -U postgres -c "DROP DATABASE IF EXISTS mmd_v2;"
    docker exec -i mmd_v2-postgres-1 psql -U postgres -c "CREATE DATABASE mmd_v2;"
    
    echo "Streaming restore dump..."
    gunzip -c "$FILE" | docker exec -i mmd_v2-postgres-1 psql -U postgres -d mmd_v2
    echo "PostgreSQL database restore completed successfully."
    ;;

  mongo)
    echo "Restoring MongoDB database from $FILE..."
    # Use mongorestore with --drop to overwrite
    if docker exec -i mmd_v2-mongo-1 mongorestore --db mmdss --archive --gzip --drop < "$FILE" 2>/dev/null; then
      echo "MongoDB restore completed via exec."
    else
      NETWORK_NAME="mmd-v2_default"
      echo "mongorestore failed or not available in mongo container. Retrying via temporary utility container..."
      docker run --rm -i --network "$NETWORK_NAME" mongo:6.0 mongorestore --host mongo --db mmdss --archive --gzip --drop < "$FILE"
      echo "MongoDB database restore completed successfully."
    fi
    ;;

  *)
    echo "Invalid restore type: '$TYPE'. Must be 'postgres' or 'mongo'."
    exit 1
    ;;
esac
