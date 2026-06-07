# A4 Step 5D — ATS Interviews Data Strategy Report

**Audit Date**: 2026-06-02  
**Auditor**: Antigravity AI  
**Status**: **APPROVED**

This document details the data strategy for the frontend Interviews UI, analyzing how data is queried and mapped from the REST API endpoints, and detailing the lightweight month-view calendar implementation strategy.

---

## 1. Actual Interview Payload Shape

We audited the database model definition inside `prisma/schema.prisma` and the REST query handlers inside `lib/foundation/repositories/interview.repository.ts`.

### Verification Outcome:
The endpoints:
```text
GET /api/v1/interviews
GET /api/v1/interviews/{id}
```
return raw database models matching the Prisma schema.

### Returned Fields:
* `id`: `String` (cuid)
* `tenantId`: `String`
* `applicationId`: `String`
* `interviewerId`: `String`
* `round`: `Int`
* `feedback`: `String | null`
* `rating`: `Int | null`
* `status`: `InterviewStatus` (`SCHEDULED` | `COMPLETED` | `CANCELLED` | `NO_SHOW`)
* `scheduledAt`: `DateTime` (ISO string in API)
* `createdAt`: `DateTime`
* `updatedAt`: `DateTime`
* `deletedAt`: `DateTime | null`

### Returned Relations:
None. The repository does not specify nested prisma inclusions (`include: { ... }`) during query executions.

### Missing Relations:
* `application`
* `interviewer` (User)

---

## 2. Relationship Resolution Strategy

Since the API returns only `applicationId` and `interviewerId` with no nested objects, we implement a multi-tier **Client-Side Lookup Join Strategy**:

### A. Roster & Calendar Views (Parallel Fetching)
To present friendly identifiers (Candidate Name, Job Title, Interviewer Name) on lists and calendar slots, we query all related data in parallel:
1. **Parallel Fetching**:
   ```typescript
   const [interviews, applications, candidates, users] = await Promise.all([
     getInterviews(),
     getApplications(),
     getCandidates(),
     getUsers()
   ]);
   ```
2. **In-Memory Indexes**: Build fast index maps:
   ```typescript
   const appMap = new Map(applications.map(a => [a.id, a]));
   const candMap = new Map(candidates.map(c => [c.id, c]));
   const userMap = new Map(users.map(u => [u.id, u]));
   ```
3. **Data Mapping Resolution**:
   * Map `applicationId` $\rightarrow$ `Application` record.
   * Map `Application.candidateId` $\rightarrow$ `Candidate` record (resolving Candidate Name and Email).
   * Map `Application.jobPostingId` $\rightarrow$ Open job details (from in-memory mappings or parallel loads).
   * Map `interviewerId` $\rightarrow$ `User` record (resolving Interviewer Name).

### B. Detail Profile Page (Sequential Fetching)
1. Fetch the target interview profile: `getInterview(id)`.
2. Fetch the corresponding interviewer profile (`getUser(interview.interviewerId)`) and application profile (`getApplication(interview.applicationId)`) in parallel.
3. Once the application is loaded, fetch candidate (`getCandidate(app.candidateId)`) and job posting details (`getJobPosting(app.jobPostingId)`) in parallel.

### C. Loading & Error Handling
* **Loading Skeletons**: Integrated into table view rows, details grids, and calendar blocks using skeleton cards to prevent layouts from flickering.
* **Error Toasting**: Fetch failures will be trapped in `try-catch` handlers, updating page error boundaries and generating visual warning alerts via `useToast`.

### D. Performance Considerations
* Mappings run at $O(1)$ lookup complexity.
* Batch fetching via `Promise.all` mitigates network waterfall lag.
* Lookups are memoized inside `useMemo` hooks to prevent recalculations on filter adjustments.

---

## 3. Calendar Month View Strategy

To display schedules clearly without bloat:
* **Lightweight Internal UI**: We build a custom month-view grid using vanilla React state and CSS Grid layouts.
* **Grid Computation**: Standard calendar grid calculating the number of days in the current selected month, finding the starting day of the week, and padding leading/trailing empty slots.
* **No Bloat**: Zero dependency on external suites like `FullCalendar`, `react-big-calendar`, or `Day.js`. We use Javascript native `Date` functions.
* **Responsive Styling**: Days scale fluidly on compact viewports, shifting event markers from text labels to dot-indicators on mobile dimensions.
