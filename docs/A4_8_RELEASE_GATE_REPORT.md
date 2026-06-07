# A4.8 — Release Gate Report

## Production Release Gate Pipeline

The production release gate enforces strict quality control across the code, schemas, and runtime environments. To approve a production release, the pipeline must successfully complete the following steps in this exact order:

### 1. Typecheck (`npm run typecheck`)
* **Rationale**: Validates TypeScript syntactic correctness, type safety, and imports. This blocks builds containing compile-time errors or broken module imports.

### 2. Lint (`npm run lint`)
* **Rationale**: Enforces project-specific coding standards, code hygiene, styling conventions, and prevents common pitfalls (unused variables, import cycles).

### 3. Prisma Generate (`npx prisma generate`)
* **Rationale**: Generates the Prisma TypeScript Client matching the current schema definition. This step must precede database migrations to ensure the client is compiled correctly.

### 4. Prisma Migration (`npx prisma migrate deploy`)
* **Rationale**: Deploys database migrations to the target environment. Deploying database changes before tests/builds guarantees the database schema is aligned with the code entity models.

### 5. ATS Tests (`npx playwright test tests/integration/ats.spec.ts`)
* **Rationale**: Executes end-to-end integration tests (Job Postings, Candidates, Applications, Interviews, and Tenant Isolation). This validates that the core business logic, permissions, and security constraints are functioning as expected.

### 6. Production Build (`npm run build`)
* **Rationale**: Compiles the Next.js application, performs server component static generation, dynamic route optimization, and minification. Only after code validation, linting, migration, and integration testing should the production code bundle be generated.
