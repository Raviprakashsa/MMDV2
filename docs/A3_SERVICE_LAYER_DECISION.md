A3 Service Layer Decision: `updateById` Return Contract

Context

- The newly implemented CRM repositories (`CompanyRepository`, `ContactRepository`, `LeadRepository`) implement `updateById(...)` using `prisma.updateMany(...)` and therefore return Prisma's `BatchPayload` (affected row count), not the updated entity.
- Existing repositories across the codebase are mixed: some `updateById` return the updated record (`prisma.update`) (e.g., `user.repository.ts` uses `update`), others return batch payloads.

Decision Scope

- Evaluate two options for `updateById` in CRM repositories:
  - Option A: Return the updated entity (record-level return).
  - Option B: Return `BatchPayload` (count) as currently implemented.

Option A — Return Updated Entity

Pros
- Clear, conventional semantic: callers receive the updated record directly.
- Simplifies service-layer code (no extra fetch or transaction needed to obtain the updated record).
- Easier to map into API responses and audit logs.

Cons
- Requires using `prisma.update` (single-row) which will not automatically include tenant scoping unless used with a composite where clause — may need a transaction (findFirst -> check tenant -> update) or use `updateMany` + `findFirst` in a transaction to both enforce tenant and return the record.
- Slightly more DB operations (two-step) unless implemented with a transaction.

Service-layer impact

- Services can call `repo.updateById(context, id, updates)` and directly receive the updated object for further business checks and to return in APIs.
- Reduces boilerplate in services (no need to `findById` after `updateById`).

API-layer impact

- API handlers can return updated resources in responses directly with confidence in contents.
- Easier to standardize DTO/response formats.

Audit-layer impact

- Audit logs can capture the updated record without requiring additional reads.

Option B — Keep BatchPayload (count)

Pros
- Single DB statement (`updateMany`) with tenant-scoped where clause enforces tenant and does updates atomically in one SQL call.
- Lower risk of TOCTOU (time-of-check/time-of-use) when used carefully.

Cons
- Services that expect the updated record must perform an extra `findFirst`/`findUnique` call (or run a transaction) to return the updated entity to callers — more code and potential for inconsistency if not done transactionally.
- API responses become less convenient (services must perform extra read to populate response body).

Service-layer impact

- Services must either accept a `BatchPayload` and adapt logic (e.g., return success count) or perform an additional read to fetch the record (ideally in a transaction) to provide the updated entity.

API-layer impact

- APIs that return the updated resource will require an extra repository call or transaction to obtain the data to return.

Audit-layer impact

- Audit logs must be built from a pre-update `find` or a post-update `find` (additional DB call) if record contents are required.

Recommendation

Choose Option A: return the updated entity.

Rationale

- Returning the updated record is the most developer-friendly contract and aligns with common repository patterns and expectations for service and API layers.
- It reduces boilerplate in services and avoids subtle bugs where callers assume a record is returned and instead receive a BatchPayload.
- The tenant-safety requirement can be preserved by implementing the update under a short transaction that first verifies tenant-scoped existence (via `findFirst` with `withTenant`) and then performs `update` with the same where clause or by using `updateMany` and returning the record via a transactional read; implementational details can be codified in a repository helper to make this pattern safe and reusable.

Implementation guidance (non-changing note)

- Implement `updateById(context, id, input)` to return the updated record. Internally:
  - Option 1 (preferred): run a transaction: `const before = await findFirst(where)` (ensure exists and tenant), then `const updated = await prisma.model.update({ where: { id }, data })`, return `updated`.
  - Option 2: run `updateMany` with tenant-scoped where clause, and if `count === 1` then `findFirst` to return the updated record inside the same transaction.
- Add a repository helper for a transactional `updateAndReturn(context, where, data)` to reduce duplication across CRM repos.

Decision status

- Recommendation: Option A (Return updated entity).

Next step

- If approved, I can prepare a small patch that updates CRM `updateById` implementations (and typings) to return the updated record and add a helper transactional pattern used by all three CRM repositories.
