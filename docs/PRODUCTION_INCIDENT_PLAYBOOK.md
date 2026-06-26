# MMD Recruit CRM — Production Incident Playbook
**Incident Response and Recovery Procedures**

This document details critical recovery, root cause investigation, and rollback procedures for systems administrators during production outages or degradations.

---

## Incident Triage Framework

1. **Detect**: Alert triggered by monitoring checklist or user reports.
2. **Isolate**: Identify the failing component (Azure, PostgreSQL, Cosmos DB, Application code).
3. **Resolve**: Apply the recovery or rollback procedure.
4. **Post-Mortem**: Document root cause, timeline, and actions taken to prevent recurrence.

---

## Incident Playbooks

### 🚨 Scenario 1: Authentication / Login Fails (System-wide Lockout)
* **Symptoms**: Users see blank screen on `/api/auth/signin`, redirect loops, or 500 errors on callback.
* **Root Cause Investigation**:
  1. Check Azure Container App environment variables:
     `az containerapp show -n mmd-recruit-crm -g mmd-recruit-india-rg --query "properties.template.containers[0].env"`
     Verify `NEXTAUTH_SECRET`, `AUTH_SECRET`, and `NEXTAUTH_URL` are set and non-empty.
  2. Check session cookie constraints. If behind an SSL-terminating proxy, verify that cookies are secure (`__Secure-next-auth.session-token`).
* **Recovery Process**:
  1. Restart the Container App to refresh token cache:
     `az containerapp revision restart -n mmd-recruit-crm -g mmd-recruit-india-rg --revision <active-revision>`
  2. Verify credentials by running `npx tsx scripts/check-db.ts` to ensure admin email hashes are intact.

---

### 🚨 Scenario 2: Azure Container App Fails (HTTP 502/503 Bad Gateway)
* **Symptoms**: Platform returns HTTP 502, 503, or connection times out.
* **Root Cause Investigation**:
  1. Check replica status and restart count:
     `az containerapp replica list -n mmd-recruit-crm -g mmd-recruit-india-rg --revision <active-revision>`
  2. Inspect container console logs for memory exceptions or crash loops:
     `az containerapp logs show -n mmd-recruit-crm -g mmd-recruit-india-rg --tail 100`
* **Recovery Process**:
  1. If memory/CPU limits are exceeded, scale resource allocation:
     `az containerapp update -n mmd-recruit-crm -g mmd-recruit-india-rg --cpu 1.0 --memory 2.0Gi`
  2. Restart the container app:
     `az containerapp revision restart -n mmd-recruit-crm -g mmd-recruit-india-rg --revision <active-revision>`

---

### 🚨 Scenario 3: Database Fails (PostgreSQL or Cosmos DB Outage)
* **Symptoms**: Application logs show `PrismaClientInitializationError` or Mongoose connection timeouts.
* **Root Cause Investigation**:
  1. Test PostgreSQL connectivity using network tools:
     `nc -zv mmd-recruit-postgres.postgres.database.azure.com 5432`
  2. Check Cosmos DB firewall settings to ensure the Azure Container App outbound IP addresses are whitelisted.
* **Recovery Process**:
  1. If PostgreSQL is stopped, restart via Azure Portal or CLI:
     `az postgres flexible-server restart --name mmd-recruit-postgres --resource-group mmd-recruit-india-rg`
  2. If connection pool is exhausted, adjust PostgreSQL flexible server max connections and restart.

---

### 🚨 Scenario 4: Deployment Fails (GitHub Action Deploys Corrupt Build)
* **Symptoms**: Deployment step fails in CI or a fresh deploy introduces immediate runtime exceptions.
* **Root Cause Investigation**:
  1. Check the latest workflow execution on GitHub Actions.
  2. Inspect the Container App console logs immediately following deployment.
* **Rollback Process**:
  1. Re-tag the last known good image to `latest` in Azure Container Registry (ACR) and push.
  2. Force-update the Container App to run the last stable image:
     `az containerapp update -n mmd-recruit-crm -g mmd-recruit-india-rg --image mmdrecruitreg17.azurecr.io/mmd-recruit-crm:<stable-sha-or-tag>`
  3. Verify health endpoint returns `{"ok":true}`.

---

### 🚨 Scenario 5: Data Corruption Occurs
* **Symptoms**: Users report missing companies, candidate lists containing corrupted characters, or mismatched IDs.
* **Root Cause Investigation**:
  1. Audit recent database writes using analytical logs in MongoDB:
     `db.auditlogs.find().sort({createdAt: -1})`
  2. Check PostgreSQL transaction logs for uncommitted lock states.
* **Recovery Process**:
  1. Lock down write access immediately by setting the app to maintenance mode (e.g. updating the container image to a static holding page or turning off ingress).
  2. Execute PostgreSQL restore from the automated backup (See `DISASTER_RECOVERY_GUIDE.md`).
  3. Restore MongoDB collections to the previous point-in-time state.
  4. Perform data consistency sync by running: `npm run db:backfill:phase6:apply`.
