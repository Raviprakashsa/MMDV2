# V1 — Docker Persistence Report

**Date:** 2026-06-07  
**Blocker:** B-5 (Docker Compose has no volume persistence)  
**Status:** ✅ REMEDIATED  

---

## 1. Problem Statement

`docker-compose.yml` had no `volumes:` configuration for the PostgreSQL or MongoDB services. All database data was ephemeral — any `docker compose down` or container restart would permanently destroy all data.

---

## 2. Changes Made

**File:** `docker-compose.yml`

### Named Volumes Added

```yaml
volumes:
  postgres_data:
    driver: local
  mongo_data:
    driver: local
```

### PostgreSQL Service — Volume Mount Added

```yaml
postgres:
  image: postgres:16
  volumes:
    - postgres_data:/var/lib/postgresql/data  # ← NEW
  restart: unless-stopped                     # ← NEW
```

### MongoDB Service — Volume Mount Added

```yaml
mongo:
  image: mongo:6.0
  volumes:
    - mongo_data:/data/db  # ← NEW
  restart: unless-stopped  # ← NEW
```

### App Service Improvements

```yaml
app:
  environment:
    - SENTRY_DSN=${SENTRY_DSN:-}       # ← NEW
    - SENTRY_RELEASE=${SENTRY_RELEASE:-} # ← NEW
    - AUTH_SECRET=${AUTH_SECRET:-}      # ← NEW
  depends_on:
    postgres:
      condition: service_healthy  # ← IMPROVED (was a list)
    mongo:
      condition: service_healthy  # ← IMPROVED
```

---

## 3. Volume Behaviour

| Behaviour | Before | After |
|---|---|---|
| `docker compose down` | ✅ Data survives | ✅ Data survives |
| `docker compose down -v` | ⚠️ N/A (no volumes) | ⚠️ Data destroyed (intentional: `-v` removes volumes) |
| `docker compose restart` | ✅ Data survives | ✅ Data survives |
| `docker compose rm` | ✅ Data survived (container removed, not volumes) | ✅ Data survives |
| Host machine restart | ❌ Data LOST | ✅ Data persists |

> [!IMPORTANT]
> For production deployments on cloud infrastructure, named volumes should be backed by persistent storage drivers (e.g., AWS EBS, GCP persistent disks) rather than the default `local` driver. The `local` driver persists data on the Docker host disk but does not provide replication or automatic snapshots.

---

## 4. Volume Inspection Commands

```bash
# List Docker volumes
docker volume ls | grep mmd

# Inspect volume location on host
docker volume inspect mmd-v2_postgres_data

# Backup PostgreSQL data
docker exec postgres pg_dump -U postgres mmd_v2 > backup.sql

# Backup MongoDB data
docker exec mongo mongodump --out /tmp/backup
docker cp mongo:/tmp/backup ./mongo-backup
```

---

## 5. Migration Note

If you had an existing `docker compose` deployment **without** volumes:
1. Export data before upgrading: `docker exec postgres pg_dump -U postgres mmd_v2 > backup_before_upgrade.sql`
2. Pull the updated `docker-compose.yml`
3. `docker compose down` (stops containers)
4. `docker compose up -d` (creates named volumes, starts fresh)
5. Restore data: `docker exec -i postgres psql -U postgres mmd_v2 < backup_before_upgrade.sql`

---

*Report generated: 2026-06-07*
