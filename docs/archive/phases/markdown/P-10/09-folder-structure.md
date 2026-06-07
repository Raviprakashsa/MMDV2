# 09-folder-structure

Source PDF: P-10/09-folder-structure.pdf

## Page 1

MMD V2 - Project Folder Structure
1. Folder Structure Philosophy
Goals:
Feature Driven
Scalable
Easy Navigation
Low Complexity
Solo Developer Friendly
Enterprise Ready
Rules:
Features own their logic.
Business logic never goes in routes.
Database logic never goes in UI.
Shared utilities stay centralized.
Avoid deep nesting.
2. Root Structure
src/ app/ components/ features/ lib/ types/ hooks/ emails/ docs/ tests/
prisma/
public/
scripts/
docker/
.github/
3. App Router Structure
src/app/
(auth)/ (dashboard)/
• 
• 
• 
• 
• 
• 
1. 
2. 
3. 
4. 
5. 
1

## Page 2

api/
layout.tsx
page.tsx
loading.tsx
error .tsx
not-found.tsx
4. Auth Routes
(auth)/
login/ forgot-password/ reset-password/
5. Dashboard Routes
(dashboard)/
dashboard/
companies/ contacts/ leads/
requirements/ candidates/ applications/ interviews/
placements/ timesheets/ invoices/
templates/ workflows/ notifications/
reports/
users/ roles/
settings/
2

## Page 3

6. API Structure
app/api/v1/
auth/
users/ roles/
companies/ contacts/ leads/
requirements/ candidates/ applications/ interviews/
placements/ timesheets/ invoices/
templates/ workflows/ notifications/
reports/
audit-logs/ api-keys/ webhooks/
tenant/
search/
7. Feature Structure
features/
auth/ users/ roles/
companies/ contacts/ leads/
requirements/ candidates/ applications/ interviews/
placements/ timesheets/ invoices/
templates/ workflows/ notifications/
reports/
tenant/
3

## Page 4

Each feature owns:
controller service repository validator types
8. Example Feature Structure
features/companies/
components/
company-form.tsx company-table.tsx company-details.tsx
services/
company.service.ts
repositories/
company.repository.ts
validators/
company.schema.ts
types/
company.types.ts
constants/
company.constants.ts
9. Shared Components
components/
ui/
table/ form/ modal/ drawer/ card/ tabs/
layout/
4

## Page 5

sidebar/ header/ footer/
charts/
10. Shared Libraries
lib/
auth/ prisma/ rbac/ storage/ logger/ notifications/ search/ utils/
11. Prisma Structure
prisma/
schema.prisma
seed.ts
migrations/
12. Types Structure
types/
api.types.ts
auth.types.ts
common.types.ts
tenant.types.ts
13. Hooks Structure
hooks/
use-auth.ts
5

## Page 6

use-permissions.ts
use-pagination.ts
use-search.ts
use-notifications.ts
14. Email Templates
emails/
welcome/
password-reset/
interview-schedule/
placement-success/
invoice/
15. Documentation Structure
docs/
prd/
architecture/
database/
api/
deployment/
security/
roadmap/
6

## Page 7

16. Testing Structure
tests/
unit/
integration/
e2e/
playwright/
fixtures/
17. Scripts Structure
scripts/
seed/
migration/
maintenance/
cleanup/
18. Docker Structure
docker/
Dockerfile
docker-compose.yml
nginx.conf
19. CI/CD Structure
.github/
7

## Page 8

workflows/
ci.yml
build.yml
deploy-staging.yml
deploy-production.yml
20. Storage Structure
uploads/
resumes/
documents/
invoices/
logos/
Only for development.
Production uses:
Cloudflare R2
or
AWS S3
21. Service Layer Rules
Allowed:
Route ↓ Service ↓ Repository ↓ Prisma
Not Allowed:
Route ↓ Prisma
8

## Page 9

22. Repository Layer Rules
Repository Responsibilities:
Database Queries
Transactions
Pagination
Filtering
No business logic.
23. Service Layer Rules
Service Responsibilities:
Business Logic
Validation
Workflows
Notifications
Audit Logging
No direct Prisma access.
24. Validation Rules
Every request validated with:
Zod
Structure:
validators/
entity.schema.ts
25. File Naming Convention
Components:
• 
• 
• 
• 
• 
• 
• 
• 
• 
9

## Page 10

company-form.tsx
Services:
company.service.ts
Repositories:
company.repository.ts
Validators:
company.schema.ts
Types:
company.types.ts
26. Scalability Strategy
Phase 1
Single Application
↓
Phase 2
Dedicated Worker Service
↓
Phase 3
Separate Analytics Service
↓
Phase 4
Microservices (Only If Needed)
10

## Page 11

27. Final Structure Benefits
Easy Maintenance
Fast Development
Simple Navigation
Clear Responsibilities
Lower Technical Debt
Multi-Tenant Ready
White Label Ready
Prisma Ready
API Ready
Enterprise Ready
11
