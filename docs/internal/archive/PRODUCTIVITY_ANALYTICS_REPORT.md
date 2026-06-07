# Work Intelligence Platform — Productivity Analytics Report

This document outlines the **Productivity Analytics Dashboard** designed for administrators and managers in V1.8.

---

## 1. Overview

The Admin Productivity Dashboard at [page.tsx](file:///c:/Ravi/MY%20WORKS/MMD%20V2/app/%28dashboard%29/dashboard/productivity/page.tsx) provides a centralized panel to audit employee engagement, track core KPIs, and review individual work timelines.

---

## 2. Dashboard Components

### 📈 Running Team KPIs
A row of real-time aggregates for the selected day:
* **Active Employees**: Count of staff members who have accumulated active seconds today.
* **Team Active Time**: Total active hours logged across the tenant.
* **Team Idle Time**: Total idle time detected.
* **Avg Productivity**: Average productivity ratio across the team.
* **Total Actions**: Total running counter of mutations and views.

### 👥 Daily Employee Summary Grid
A search-filtered grid of all active users in the tenant:
* Lists names, emails, active/idle time, productivity score, and total action counts.
* Features a color-coded active-vs-idle ratio bar (Indigo for active, Amber for idle).
* Includes a "Timeline" button to open the audit trail.

### 🏆 Team Leaderboard Standings
A ranked leaderboard showcasing the top performers:
* **Toggle Options**: Switch range calculation between the last 7 days and last 30 days.
* Displays the employee rank, total active hours, captured action count, and average productivity percentage.

### 📂 Chronological User Timeline Drawer
A slide-out drawer that loads a detailed audit trail for a selected employee:
* Queries log data securely using PostgreSQL.
* Displays timestamps, module tags, action badges, and structured metadata.
* Helps managers audit operations (e.g., verifying leads, applications processed, requirements modified).
