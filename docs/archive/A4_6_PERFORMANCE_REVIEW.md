# A4.6 — ATS Performance Review Report

**Audit Date**: 2026-06-02  
**Auditor**: Antigravity AI  
**Status**: **PASSED**

This document details the performance audit for the ATS module views (directory lists, Kanban board, and schedules calendar).

---

## 1. N+1 Database Query Analysis

A common performance bottleneck in recruitment boards is the **N+1 query problem** (e.g. fetching N application rows, then firing N individual database lookups to fetch candidate names).

### MMD V2 Solution:
Because we enforce decoupled REST endpoints and implement **Client-Side Joins**, N+1 query patterns are completely avoided:
1. **Parallel Batch Requests**: The UI fetches all active applications, candidates, and job postings in parallel using `Promise.all`. This translates to exactly **three** database query calls on the backend.
2. **In-Memory Maps**: The frontend constructs JavaScript `Map` structures during rendering:
   ```typescript
   const candidateMap = new Map(candidates.map((c) => [c.id, c]))
   ```
   Matching application records to candidate demographics runs in $O(1)$ operations in memory, avoiding redundant database trips.

---

## 2. Rendering Performance & Payload Sizes

* **Lightweight Payloads**: The flat JSON response shapes for applications and interviews (omitting deep nested tables) minimize total bytes transferred across the network.
* **Filter Memoization**: Roster filter functions are cached in `useMemo` blocks, avoiding recalculations during typing unless candidates or postings change.
* **Layout Skeletons**: Pre-built tables and card skeleton components prevent Cumulative Layout Shift (CLS), ensuring smooth visual feedback during network fetches.

---

## 3. Immediate Performance Tuning Applied

* **Index Mapping**: Map-based lookups replace slow array iterations ($O(N)$ scanning is replaced with $O(1)$ key indexing).
* **Parallel Fetching**: Fetching candidates, postings, and applications concurrently reduces total network round-trip time (RTT) to the speed of the single slowest API request.

---

## 4. Future Performance Recommendations

As the client database expands (e.g., handling hundreds of thousands of candidate profiles), we recommend implementing the following scaling optimizations:
1. **Server-Side Joins via Expansion**: Support `GET /api/v1/applications?expand=candidate` to delegate relational joins to the PostgreSQL database level when required.
2. **Infinite Scroll Pagination**: Implement cursor-based pagination (`take: 50`, `skip: 0`) in candidate/job listings APIs rather than loading the complete dataset.
3. **Search-Ahead Dropdowns**: Replace the select menus in `ApplicationForm` and `InterviewForm` with debounce autocomplete inputs that query candidates matching query text, avoiding loading the entire registry at once.

---

## 5. Verdict

```text
Performance Review: PASS
```
The implementation avoids N+1 queries using parallel batch requests, matches datasets in O(1) in-memory lookups, and utilizes skeletons for layout stability.
