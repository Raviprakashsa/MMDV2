# Cleanup Analysis

Status: Review only. No files deleted.

## Scope
Repository-wide cleanup candidate analysis with implementation freeze active.

## 1) Must Keep
- Runtime and build essentials:
  - package.json
  - package-lock.json
  - next.config.mjs
  - tsconfig.json
  - postcss.config.js
  - tailwind.config.ts
  - eslint.config.mjs
  - Dockerfile
  - docker-compose.yml
  - vercel.json
  - .gitignore
- Product code directories:
  - app/
  - components/
  - lib/
  - prisma/
  - scripts/
  - tests/
  - types/
  - styles/
  - hooks/
  - postman/
- Active architecture and source-of-truth docs:
  - docs/phases/pdf/
  - docs/phases/markdown/
  - docs/V2_REBUILD_ANALYSIS_AND_PLAN.md
  - docs/A0-A5_EXECUTION_BLUEPRINT.md

## 2) Move To Archive
Recommended location after approval: docs/archive/
- Root reports and certification artifacts:
  - COMPREHENSIVE_CODEBASE_GUIDELINE_REPORT.md
  - MMD-Main-Final-End-to-End-Validation-Report-vFinal.md
  - MMD-Main-Final-End-to-End-Validation-Report-vFinal.pdf
  - MMD-Main-PreProd-Detailed-Certification-Report-v2.md
  - MMD-Main-PreProd-Detailed-Certification-Report-v2.pdf
  - MMD-Main-PreProd-Detailed-Certification-Report-v3.md
  - MMD-Main-PreProd-Detailed-Certification-Report-v3.pdf
  - Pre-Production-Certification-Report-MMD-Main-1.2.md
  - Pre-Production-Certification-Report-MMD-Main-1.2.pdf
  - production-readiness-report.md
  - PRODUCTION_READINESS.md
  - CI.md
  - PLATFORM_SOP.md
  - RELEASE.md
- Generated analysis exports:
  - audit_report.json
  - audit/contrast/contrast-report.json
  - audit/contrast/contrast-report.md
  - dashboard-eslint.json
  - eslint-report.json
  - eslint-report.txt
  - eslint-target.json
  - gh_run_26503467820_job_78049661486.log
  - playwright_errors_excerpt.txt

## 3) Safe To Delete
Delete only after explicit approval.
- query
- tmp-unused.json
- tmp-unused-candidates.json
- users_output.json
- tsconfig.tsbuildinfo
- test-output.css
- leads-fail-nav.png (if not used in docs/tests)

## 4) Duplicate Files
Likely duplicates or overlapping artifacts:
- PRODUCTION_READINESS.md and production-readiness-report.md
- Multiple pre-production reports for same product state:
  - Pre-Production-Certification-Report-MMD-Main-1.2.*
  - MMD-Main-PreProd-Detailed-Certification-Report-v2.*
  - MMD-Main-PreProd-Detailed-Certification-Report-v3.*
- Multiple end-to-end readiness reports with overlapping content and period.

## 5) Generated Files
- package-lock.json (must keep)
- tsconfig.tsbuildinfo
- eslint-report.json
- eslint-report.txt
- dashboard-eslint.json
- audit_report.json
- audit/contrast/contrast-report.json
- playwright_errors_excerpt.txt
- gh_run_*.log

## 6) Obsolete Files
Potentially obsolete pending architecture approval:
- migrate-mongo-config.js (legacy Mongo migration path)
- migrations/ (legacy mongo migration folder, verify ownership)
- Design Leads Page_new/ (candidate design sandbox)
- new_theme.css (if not imported)
- run_tests.bat (if CI and npm scripts already cover test orchestration)
- test-conversion.ts (one-off utility; verify active use)

## Decision Notes
- No deletion executed.
- No move executed.
- Cleanup should be executed as a separate approved operation with rollback list.
