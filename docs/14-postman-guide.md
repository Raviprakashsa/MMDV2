# 14 — Postman Guide

## Executive Summary
Guide to build a Postman collection and environment for local/dev testing.

## Folder Structure
- Folder: `MMD Main` → `Auth`, `Dashboard`, `Admin`, `Automation`

## Environment Variables
- `base_url`, `auth_token`, `refresh_token`, `env`

## Authentication Setup
- Use `POST /api/auth/login` to populate `auth_token` in environment via test scripts.

## Next Steps
- Create `/postman` export and include an environment JSON. Placeholder folder added in repository.
