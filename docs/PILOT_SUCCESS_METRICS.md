# MMD Recruit CRM — Pilot Success Metrics
**Business Validation and KPI Framework**

To validate that MMD Recruit CRM is delivering value, enhancing recruiter productivity, and operating stably under production load, we will track the following key performance indicators (KPIs).

---

## 1. Core KPIs and Success Targets

| KPI ID | metric Name | Description | Data Source | Pilot Success Target |
|:---|:---|:---|:---|:---|
| **KPI-01** | **Daily Active Users (DAU)** | Number of unique pilot users accessing the system daily | MongoDB `users` login audit log | > 70% of onboarded pilot cohort |
| **KPI-02** | **Companies Created** | Count of new business accounts added | PostgreSQL `Company` table | > 5 per week |
| **KPI-03** | **Candidates Added** | Count of new candidates uploaded or scraped | MongoDB `candidates` collection | > 100 per week |
| **KPI-04** | **Users Added** | Count of recruiting team profiles registered | PostgreSQL `User` table | Steady increase across cohorts |
| **KPI-05** | **Login Success Rate** | Percentage of login attempts that succeed without errors | NextAuth callbacks in console logs | > 99.5% |
| **KPI-06** | **CRUD Success Rate** | Percentage of CRUD actions (create/update/delete) that complete with HTTP 200/201 | Webserver access logs / endpoints | > 99.9% |
| **KPI-07** | **Time Spent Per User** | Average duration of user sessions | Analytics tracking in client | 15 - 45 mins per day |
| **KPI-08** | **Recruiter Productivity** | Average time to shortlist candidates for a Requirement | Database delta (Requirement to Candidate association) | Reductions in hiring cycle duration |

---

## 2. Telemetry Queries to Extract KPI Metrics

Use these database queries to compile weekly success reports:

### A. Active Users (PostgreSQL User count)
```sql
SELECT tenant_id, COUNT(*) as active_users 
FROM "User" 
WHERE status = 'ACTIVE' AND "deletedAt" IS NULL 
GROUP BY tenant_id;
```

### B. Company Creation Volume (PostgreSQL)
```sql
SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*) as count 
FROM "Company" 
WHERE "createdAt" >= NOW() - INTERVAL '7 days' 
GROUP BY day 
ORDER BY day DESC;
```

### C. Candidate Additions (MongoDB Mongoose Query)
Execute in Node.js shell or MongoDB compass:
```javascript
db.candidates.aggregate([
  { $match: { createdAt: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) } } },
  { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
  { $sort: { _id: -1 } }
]);
```

### D. System Login / Auth Errors (Log Analytics KQL)
```kusto
ContainerAppConsoleLogs_CL
| where Log_s has "auth"
| summarize TotalAttempts = count(), 
            Failures = countif(Log_s has "error" or Log_s has "401") 
            by bin(TimeGenerated, 1d)
| extend SuccessRate = (TotalAttempts - Failures) * 100.0 / TotalAttempts
```

---

## 3. Reporting Schedule

During the pilot, success metrics will be consolidated and reported according to the following cadence:
1. **Weekly Ops Dashboard**: Operations Lead compiles KPIs every Friday evening.
2. **Bi-Weekly Business Review**: Leadership reviews metrics against targets to approve next cohort expansions.
3. **End-of-Pilot Report**: Analysis of recruiter productivity increases to certify go-live readiness.
