# 16 — Project Structure

## Executive Summary
Recommended scalable folder structure for frontend and backend separation and mono-repo readiness.

## Frontend Structure
- `apps/frontend/` (Next.js) with `components/`, `styles/`, `hooks/`, `pages/` or `app/`.

## Backend Structure
- `apps/api/` split into services: `auth/`, `reports/`, `users/`, `automation/`.

## Shared Packages
- `packages/common/` for shared types, utilities, and design tokens.
