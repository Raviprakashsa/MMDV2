# MMD Recruit CRM — Operations Runsheet

This runsheet documents day-to-day operations and maintenance tasks for **MMD Recruit CRM**.

---

## 1. Automated Backups
Database backups are handled by `scripts/backup-db.sh`. This script dumps relational tables (via `pg_dump`) and document databases (via `mongodump`), compresses them, and sweeps files older than 7 days.

### Schedule Configuration
It is recommended to run this daily at 2:00 AM via cron:
```bash
# Edit crontab
sudo crontab -e

# Run every night at 2:00 AM
0 2 * * * /path/to/mmd_v2/scripts/backup-db.sh >> /var/log/mmd_backups.log 2>&1
```

---

## 2. Manual Recovery
If restoration is required, use the `scripts/restore-db.sh` script to recover data:

```bash
# Restore PostgreSQL database
./scripts/restore-db.sh postgres /path/to/postgres_backup.sql.gz

# Restore MongoDB database
./scripts/restore-db.sh mongo /path/to/mongo_backup.archive.gz
```

---

## 3. Secret Rotation
To cycle cryptographic signing keys:
1. Generate new session keys.
2. Update the `.env` configuration file on the host.
3. Reload or restart the application container.
For automated environments, you may trigger `scripts/rotate-secret.sh` (or `scripts/rotate-secret.ps1` on Windows) to update secrets stored in remote platforms like GitHub Actions.

---

## 4. Operational Health Checks
Inspect server statuses and API logs regularly:
- **Health API**: Probe `/api/health` or `/api/v1/health` (should return HTTP status 200).
- **Service Logs**: Check container run outputs using:
  ```bash
  docker compose logs -f app
  ```
