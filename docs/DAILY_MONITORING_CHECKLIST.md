# MMD Recruit CRM — Daily Monitoring Checklist
**Pilot User Operations Phase**

This document provides the operational monitoring procedures to ensure platform stability, performant interactions, and early detection of failures during the pilot phase.

---

## 1. Daily Health & Status Checks (9:00 AM IST)

| Check ID | Component | Action / Command | Expected Result | Checked |
|:---|:---|:---|:---|:---:|
| **MON-01** | Container App Health | `az containerapp show -n mmd-recruit-crm -g mmd-recruit-india-rg --query "properties.runningStatus" -o tsv` | `Running` | [ ] |
| **MON-02** | Replica Health | `az containerapp replica list -n mmd-recruit-crm -g mmd-recruit-india-rg --revision <latest-revision>` | `restartCount: 0`, `runningState: Running` | [ ] |
| **MON-03** | Health Check Endpoint | Request: `https://mmd-recruit-crm.blackbay-54673e45.centralindia.azurecontainerapps.io/api/health` | `{"ok":true}` (HTTP 200) | [ ] |
| **MON-04** | PostgreSQL Conn | Check CPU & connection count in Azure Portal -> Postgres Flexible Server | CPU < 70%, Conn < 80% limit | [ ] |
| **MON-05** | Cosmos DB Conn | Check RU/s consumption & throttled requests in Cosmos DB metrics portal | Normalized RU < 80% | [ ] |

---

## 2. Log Auditing & Log Analytics Queries

Use the Azure Portal Log Analytics workspace to run the following KQL (Kusto Query Language) queries daily:

### A. Login Failures (NextAuth / Credential checks)
Identify users experiencing issues logging in or auth exceptions.
```kusto
ContainerAppConsoleLogs_CL
| where Log_s has "auth" or Log_s has "signin" or Log_s has "callback"
| where Log_s has "error" or Log_s has "fail" or Log_s has "401"
| project TimeGenerated, Log_s
| order by TimeGenerated desc
```

### B. API Failures (HTTP 5xx / 4xx)
Find failing endpoints causing client-side regressions.
```kusto
ContainerAppConsoleLogs_CL
| where Log_s has "API" or Log_s has "route"
| where Log_s has "500" or Log_s has "502" or Log_s has "504" or Log_s has "error"
| project TimeGenerated, Log_s
| order by TimeGenerated desc
```

### C. Database Failures (Prisma / Mongoose)
Examine connection timeouts, unique constraints, or indexing issues.
```kusto
ContainerAppConsoleLogs_CL
| where Log_s has "prisma:error" or Log_s has "MongooseError" or Log_s has "BSONError" or Log_s has "CastError"
| project TimeGenerated, Log_s
| order by TimeGenerated desc
```

### D. Slow Requests (Latency > 2.0 Seconds)
Find performance bottlenecks.
```kusto
ContainerAppConsoleLogs_CL
| parse Log_s with * "GET " route " " status " in " duration "ms" *
| where tolong(duration) > 2000
| project TimeGenerated, route, status, duration
| order by duration desc
```

---

## 3. Storage Usage Monitoring

During the pilot, attachments (candidate resumes) are stored using local disk space or local driver structures.
* Run a disk size check via Container App terminal or check Log Analytics:
  ```bash
  # Check local volume usage
  df -h | grep .storage
  ```
* Thresholds:
  * **Warning**: Local storage > 60% of assigned ephemeral space (2GB base).
  * **Critical**: Local storage > 80%. Initiate cleanup script: `npm run db:cleanup:synthetic:apply` or transition to S3/Azure Blob Storage.

---

## 4. Operational Actions Table

If any anomalies are found:
1. **Restart Revision**: `az containerapp revision restart -n mmd-recruit-crm -g mmd-recruit-india-rg --revision <revision-name>`
2. **Collect Streaming Logs**: `az containerapp logs show -n mmd-recruit-crm -g mmd-recruit-india-rg --follow`
3. **Escalate**: Document the timestamp, request route, and exception trace, then file an incident report using the `PRODUCTION_INCIDENT_PLAYBOOK.md`.
