# MMD Recruit CRM — Disaster Recovery Guide
**Database Backup and Restore Procedures**

This guide provides the necessary steps to verify, backup, and restore the hybrid database layout (PostgreSQL + MongoDB Cosmos DB) in the event of hardware failures or data corruptions.

---

## 1. Backup Strategy & Verification

### A. PostgreSQL (Azure Database for PostgreSQL Flexible Server)
* **Strategy**: Automated daily snapshots and transaction log backups every 5 minutes (enabling Point-in-Time Restore (PITR) up to 35 days).
* **Verification**:
  1. Go to Azure Portal -> `mmd-recruit-postgres` (Postgres Flexible Server).
  2. Navigate to **Backup and Restore**.
  3. Confirm that the last automated backup status is `Completed` and within the last 24 hours.

### B. MongoDB (Azure Cosmos DB for MongoDB)
* **Strategy**: Continuous backup policy enabled, allowing point-in-time restores down to the second.
* **Verification**:
  1. Go to Azure Portal -> `mmd-recruit-cosmos` (Cosmos DB account).
  2. Under **Features**, verify that "Continuous Backup" is status: `Active`.

---

## 2. PostgreSQL Backup & Restore Procedures

### A. Manual Backup (Ad-hoc Snapshot)
To perform a manual backup before performing migrations or major schema adjustments:
```bash
# Export the database schema and data
pg_dump "$POSTGRES_DATABASE_URL" -F c -b -v -f "./backup/postgres_backup_$(date +%F).dump"
```

### B. Restore Database
In the event of database failure or corrupted records, execute:
```bash
# 1. Terminate active database connections
# (Run this inside psql or admin tool)
SELECT pg_terminate_backend(pg_stat_activity.pid) 
FROM pg_stat_activity 
WHERE pg_stat_activity.datname = 'mmd_v2' AND pid <> pg_backend_pid();

# 2. Re-create the database clean
dropdb -h mmd-recruit-postgres.postgres.database.azure.com -U mmdadmin mmd_v2
createdb -h mmd-recruit-postgres.postgres.database.azure.com -U mmdadmin mmd_v2

# 3. Restore from dump
pg_restore -h mmd-recruit-postgres.postgres.database.azure.com -U mmdadmin -d mmd_v2 -v "./backup/postgres_backup_xxxx.dump"
```

---

## 3. MongoDB (Cosmos DB) Backup & Restore Procedures

### A. Manual Collection Backup
To backup MongoDB collections locally (e.g., candidates, leads):
```bash
# Backup MongoDB collections
mongodump --uri="$DATABASE_URL" --out="./backup/mongo_backup_$(date +%F)"
```

### B. Restore Collections
To restore collections from a backup dump:
```bash
# Restore MongoDB collections (idempotent upsert mode)
mongorestore --uri="$DATABASE_URL" --dir="./backup/mongo_backup_xxxx/mmdss" --drop
```

### C. Point-in-Time Restore (PITR) via Azure CLI
If Cosmos DB data is corrupted, use Azure Portal to restore the database to a new Cosmos DB account at a specific timestamp:
```bash
az cosmosdb restore \
  --target-database-account-name mmd-recruit-cosmos-restored \
  --resource-group mmd-recruit-india-rg \
  --account-name mmd-recruit-cosmos \
  --restore-timestamp "2026-06-08T13:00:00Z"
```

---

## 4. Disaster Recovery Validation Checklist

* Run dry-run restores to a staging database at least once per quarter.
* Verify that the restored PostgreSQL instance has all Prisma migrations successfully reapplied.
* Verify that Mongoose indexes are rebuilt after restoring MongoDB database collections (e.g. run `npx tsx scripts/fix_cosmos_indexes.js`).
