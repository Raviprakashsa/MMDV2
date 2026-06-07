#!/bin/bash
# MMD V2 Database Backup Script
# Created: 2026-06-07
#
# Description: Automates daily backups of PostgreSQL and MongoDB databases,
# stores them in a timestamped structure, and enforces a 7-day retention policy.
#
# Prerequisite: Runs on the host VM/VPS hosting the Docker containers.

set -euo pipefail

# Configurations
BACKUP_DIR="/var/backups/mmd_v2"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=7

# Ensure backup directories exist
mkdir -p "${BACKUP_DIR}/postgres"
mkdir -p "${BACKUP_DIR}/mongo"

echo "[$(date)] Starting MMD V2 database backup process..."

# 1. PostgreSQL Backup
POSTGRES_FILE="${BACKUP_DIR}/postgres/postgres_${TIMESTAMP}.sql.gz"
echo "Backing up PostgreSQL..."
if ! docker exec -t mmd_v2-postgres-1 pg_dump -U postgres -d mmd_v2 | gzip > "$POSTGRES_FILE"; then
  # Fallback to general service name if container name differs
  POSTGRES_CONTAINER=$(docker compose ps -q postgres)
  docker exec -t "$POSTGRES_CONTAINER" pg_dump -U postgres -d mmd_v2 | gzip > "$POSTGRES_FILE"
fi
echo "PostgreSQL backup completed: ${POSTGRES_FILE} ($(du -sh "$POSTGRES_FILE" | cut -f1))"

# 2. MongoDB Backup
MONGO_FILE="${BACKUP_DIR}/mongo/mongo_${TIMESTAMP}.archive.gz"
echo "Backing up MongoDB..."
# Note: mongodump database tools are used inside the mongo container.
# If database tools are not in the main image, we dump via a temporary tools container in the same network.
if docker exec -t mmd_v2-mongo-1 mongodump --db mmdss --archive --gzip > "$MONGO_FILE" 2>/dev/null; then
  echo "MongoDB backup completed via exec: ${MONGO_FILE}"
else
  # Fallback: run a temporary mongodb-database-tools container on the compose network
  NETWORK_NAME="mmd-v2_default" # default compose network name
  echo "mongodump not found in container or exec failed. Retrying via temporary utility container..."
  docker run --rm --network "$NETWORK_NAME" mongo:6.0 mongodump --host mongo --db mmdss --archive --gzip > "$MONGO_FILE"
  echo "MongoDB backup completed via runner: ${MONGO_FILE} ($(du -sh "$MONGO_FILE" | cut -f1))"
fi

# 3. Retention Cleanup (Remove files older than 7 days)
echo "Enforcing retention policy (${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}/postgres" -name "postgres_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
find "${BACKUP_DIR}/mongo" -name "mongo_*.archive.gz" -type f -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup process finished successfully."
