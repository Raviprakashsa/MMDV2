# MMD V2 — Deployment Guide

**Date:** 2026-06-07  
**Scope:** Standalone Server / Single-VPS Orchestration  

---

## 1. Prerequisites
- Docker (v20+)
- Docker Compose (v2.0+)
- PostgreSQL & MongoDB network connectivity (contained inside Compose network by default)

---

## 2. Environment Variables Checklist
Configure these variables in a `.env` file at the root of the project:

```bash
# Databases
DATABASE_URL="mongodb://mongo:27017/mmdss"
POSTGRES_DATABASE_URL="postgresql://postgres:postgres@postgres:5432/mmd_v2?schema=public"

# Auth & Security (Generate strong random values)
NEXTAUTH_SECRET="strong-random-key"
AUTH_SECRET="strong-random-key"
CRON_SECRET="bearer-token-for-cron-endpoints"
DOCUMENT_DOWNLOAD_SECRET="document-signing-token"

# Base URLs
NEXTAUTH_URL="http://your-domain.com"
NEXT_PUBLIC_APP_URL="http://your-domain.com"
BASE_URL="http://your-domain.com"

# Sentry Telemetry (Optional)
SENTRY_DSN="https://your-sentry-dsn"
SENTRY_RELEASE="v1.0"

# Distributed Throttling
THROTTLE_BACKEND="redis" # or "memory"
UPSTASH_REDIS_REST_URL="https://your-upstash-redis"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

---

## 3. Deployment Steps

### Step 1: Clone & Configure
```bash
git clone <repository_url> mmd_v2
cd mmd_v2
cp .env.example .env
# Fill out required environment variables
```

### Step 2: Spin up Containers
```bash
docker compose up --build -d
```

### Step 3: Database Initialization & Migrations
```bash
# Apply Prisma Postgres schemas & migrations
docker compose exec app npx prisma migrate deploy

# Run MongoDB migrations
docker compose exec app npm run migrate

# (Optional) Seed the database with default admin accounts
docker compose exec app npm run db:seed
docker compose exec app npm run db:seed:prisma
```

---

## 4. Backup & Recovery Operations

### Automatic Backups
Backups are handled by the `scripts/backup-db.sh` script, which should be scheduled as a daily root cron job:
```bash
# Edit crontab
sudo crontab -e

# Add daily execution at 2 AM
0 2 * * * /path/to/mmd_v2/scripts/backup-db.sh >> /var/log/mmd_backups.log 2>&1
```

### Manual Database Restoration
To restore a backup, use the `scripts/restore-db.sh` script:
```bash
# Restore PostgreSQL database
./scripts/restore-db.sh postgres /var/backups/mmd_v2/postgres/postgres_backup.sql.gz

# Restore MongoDB database
./scripts/restore-db.sh mongo /var/backups/mmd_v2/mongo/mongo_backup.archive.gz
```
