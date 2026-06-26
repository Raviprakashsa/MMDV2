# MMD Recruit CRM — Scaling Roadmap
**Infrastructure, Database, and Cost Projections**

This document plans the scaling milestones to transition MMD Recruit CRM from a pilot project (under 50 users) to a production-grade enterprise platform (up to 500 users).

---

## Scaling Milestones Table

| Cohort Size | CPU / Memory (App) | Database Tier (PG / Mongo) | Monitoring Upgrade | Monthly Cost Est. | Key Scaling Action |
|:---|:---|:---|:---|:---|:---|
| **50 Users** | 0.5 CPU / 1.0Gi RAM | - PG: `Standard_B1ms`<br>- Cosmos: Auto-scale (400-1000 RU/s) | Azure Log Analytics alerts for 5xx errors | ~$80 / month | - Implement Redis caching for user sessions. |
| **100 Users** | 1.0 CPU / 2.0Gi RAM | - PG: `Standard_B2s` (2 vCPUs)<br>- Cosmos: Auto-scale (400-2000 RU/s) | Enable Azure Application Insights APM | ~$160 / month | - Configure Next.js multi-instance replica scaling (min: 2, max: 5). |
| **250 Users** | 2.0 CPU / 4.0Gi RAM | - PG: `Standard_B2ms` (4 vCPUs)<br>- Cosmos: Auto-scale (1000-4000 RU/s) | Custom Prometheus & Grafana dashboard metrics | ~$350 / month | - Migrate local document storage to Azure Blob Storage / S3.<br>- Add read replicas for PostgreSQL. |
| **500 Users** | Auto-scaled replicas | - PG: General Purpose Tier<br>- Cosmos: Auto-scale (2000-10000 RU/s) | Datadog/NewRelic full-stack tracking + PagerDuty | ~$700 / month | - Transition from Cosmos DB shared database model to dedicated physical partitioning. |

---

## 1. Infrastructure Scaling (Azure Container Apps)

* **Current Config**: 0.5 CPU, 1.0Gi Memory, Scale range `0-3` replicas.
* **50-100 Users**: Increase min replicas to `1` (avoid cold starts) and max replicas to `5`.
* **100-250 Users**: Configure scale triggers based on HTTP request concurrency (scale out when requests > 100 per container instance).
* **250+ Users**: Migrate storage provider from `local` disk driver to standard Azure Blob Storage to prevent disk space saturation on multiple running replica nodes.

---

## 2. Database Scaling

### A. PostgreSQL Flexible Server
* **Current Config**: `Standard_B1ms` (Burstable, 1 vCPU, 2GB RAM).
* **Upgrade Triggers**: Disk write IOPS > 80% limit or CPU usage sustained > 70% during peak hours.
* **Scaling Strategy**:
  1. Upgrade compute SKU to General Purpose `Standard_D2ds_v5` to enable dedicated IOPS and fast storage read/writes.
  2. Implement connection pooling via Prisma Accelerator or PgBouncer to manage high PostgreSQL client connections.

### B. Cosmos DB (MongoDB API)
* **Current Config**: Shared throughput database (manual 400 RU/s limit).
* **Upgrade Triggers**: Request Rate Limiting (HTTP 429 - Cosmos DB throttling errors).
* **Scaling Strategy**:
  1. Shift from manual throughput to Autoscale throughput (`maxRU=4000`), allowing Azure to automatically scale down to 400 RU/s when idle.
  2. Implement compound indexing for Mongoose collections (specifically on `candidateactivities` and `auditlogs`).

---

## 3. Monitoring Upgrades

* **Phase 1 (50 Users)**: Configure simple email/Slack webhooks on Azure Container App container crash loops or HTTP 500 error spikes.
* **Phase 2 (100-250 Users)**: Integrate Azure Monitor Application Insights. Enable real-time transaction tracing and telemetry to profile slow candidate database queries.
* **Phase 3 (250+ Users)**: Set up centralized monitoring dashboards showing system health, active database connection counts, API latency percentiles, and memory saturation metrics.
