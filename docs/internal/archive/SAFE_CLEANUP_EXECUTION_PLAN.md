# Safe Cleanup Execution Plan

Status: Planning only. Do not execute without explicit approval.

## Rules
- No deletion before signed approval.
- Take backup snapshot before move or delete.
- Execute in three stages: Archive, Move, Delete.
- Validate application boot and tests after each stage.

## Category: Keep
These stay in current locations.

### Keep at root
- .env.example
- .gitignore
- package.json
- package-lock.json
- tsconfig.json
- next.config.mjs
- next-env.d.ts
- postcss.config.js
- tailwind.config.ts
- eslint.config.mjs
- docker-compose.yml
- Dockerfile
- vercel.json
- README.md
- proxy.ts

### Keep directories
- app/
- components/
- lib/
- prisma/
- scripts/
- tests/
- docs/
- postman/
- styles/
- types/
- hooks/

## Category: Archive
Archive target base: docs/archive/

### Archive root historical reports
- COMPREHENSIVE_CODEBASE_GUIDELINE_REPORT.md -> docs/archive/COMPREHENSIVE_CODEBASE_GUIDELINE_REPORT.md
- MMD-Main-Final-End-to-End-Validation-Report-vFinal.md -> docs/archive/MMD-Main-Final-End-to-End-Validation-Report-vFinal.md
- MMD-Main-Final-End-to-End-Validation-Report-vFinal.pdf -> docs/archive/MMD-Main-Final-End-to-End-Validation-Report-vFinal.pdf
- MMD-Main-PreProd-Detailed-Certification-Report-v2.md -> docs/archive/MMD-Main-PreProd-Detailed-Certification-Report-v2.md
- MMD-Main-PreProd-Detailed-Certification-Report-v2.pdf -> docs/archive/MMD-Main-PreProd-Detailed-Certification-Report-v2.pdf
- MMD-Main-PreProd-Detailed-Certification-Report-v3.md -> docs/archive/MMD-Main-PreProd-Detailed-Certification-Report-v3.md
- MMD-Main-PreProd-Detailed-Certification-Report-v3.pdf -> docs/archive/MMD-Main-PreProd-Detailed-Certification-Report-v3.pdf
- Pre-Production-Certification-Report-MMD-Main-1.2.md -> docs/archive/Pre-Production-Certification-Report-MMD-Main-1.2.md
- Pre-Production-Certification-Report-MMD-Main-1.2.pdf -> docs/archive/Pre-Production-Certification-Report-MMD-Main-1.2.pdf
- production-readiness-report.md -> docs/archive/production-readiness-report.md
- PRODUCTION_READINESS.md -> docs/archive/PRODUCTION_READINESS.md
- CI.md -> docs/archive/CI.md
- PLATFORM_SOP.md -> docs/archive/PLATFORM_SOP.md
- RELEASE.md -> docs/archive/RELEASE.md

### Archive generated analysis and logs
- audit_report.json -> docs/archive/audit_report.json
- audit/contrast/contrast-report.json -> docs/archive/audit/contrast-report.json
- audit/contrast/contrast-report.md -> docs/archive/audit/contrast-report.md
- dashboard-eslint.json -> docs/archive/dashboard-eslint.json
- eslint-report.json -> docs/archive/eslint-report.json
- eslint-report.txt -> docs/archive/eslint-report.txt
- eslint-target.json -> docs/archive/eslint-target.json
- gh_run_26503467820_job_78049661486.log -> docs/archive/gh_run_26503467820_job_78049661486.log
- playwright_errors_excerpt.txt -> docs/archive/playwright_errors_excerpt.txt

## Category: Move
Move target depends on use.

### Move scripts and utility artifacts
- run_tests.bat -> scripts/run_tests.bat
- test-conversion.ts -> scripts/test-conversion.ts

### Move directories for non-runtime assets
- Design Leads Page_new/ -> docs/archive/Design Leads Page_new/
- audit/ -> docs/reports/audit/

### Move likely obsolete infra artifacts pending owner confirmation
- k8s/ -> docs/archive/k8s/
- migrations/ -> docs/archive/migrations/
- migrate-mongo-config.js -> docs/archive/migrate-mongo-config.js

## Category: Delete
Delete only after explicit confirmation and backup.

- query
- tmp-unused.json
- tmp-unused-candidates.json
- users_output.json
- tsconfig.tsbuildinfo
- test-output.css
- leads-fail-nav.png
- new_theme.css (only if no active import)
- .env.local (from repository working tree; keep local untracked copy)

## Duplicate Resolution Plan
- Keep one production readiness document and archive the rest.
- Keep one pre-production certification version and archive older variants.
- Keep one lint report artifact if required for audit history, archive others.

## Safe Execution Checklist
1. Backup workspace to timestamped snapshot.
2. Execute Archive operations.
3. Run npm run typecheck and npm run build.
4. Execute Move operations.
5. Re-run validations.
6. Execute approved Delete operations.
7. Final smoke validation and update README docs index.

## Rollback Plan
- Restore snapshot if any regression appears.
- Revert cleanup commit as a single rollback unit.
- Keep moved files list and deleted files manifest for recovery.
