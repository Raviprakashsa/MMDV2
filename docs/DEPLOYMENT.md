# MMD Recruit CRM — Deployment Guide

This document describes how to deploy the **MMD Recruit CRM** platform in a Dockerized environment.

---

## 1. Prerequisites
- Docker v20+
- Docker Compose v2.0+
- Connection strings for target PostgreSQL and MongoDB databases

---

## 2. Environment Variables Checklist
Configure these variables in a `.env` file at the root of the project:

```bash
# PostgreSQL connection string
POSTGRES_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mmd_v2?schema=public"

# MongoDB connection string
DATABASE_URL="mongodb://localhost:27017/mmdss"

# NextAuth session encryption key (Generate a 32-character random string)
NEXTAUTH_SECRET="your-session-secret"
AUTH_SECRET="your-session-secret"

# App root base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BASE_URL="http://localhost:3000"

# Distributed Throttling (memory or redis)
THROTTLE_BACKEND="memory"

# Sentry DSN (Optional)
SENTRY_DSN="https://your-sentry-dsn"
```

---

## 3. Container Orchestration
The app is packaged as a multi-stage Docker image and orchestrated via `docker-compose.yml`:
- **postgres**: Local PostgreSQL database service.
- **mongo**: Local MongoDB database service.
- **app**: Next.js Node.js server container.

### Step 1: Start Services
Build the application image and start the container network in the background:
```bash
docker compose up --build -d
```

### Step 2: Run Database Migrations
Deploy the PostgreSQL schema changes via Prisma and Mongo updates:
```bash
# Deploy PostgreSQL migrations
docker compose exec app npx prisma migrate deploy

# Deploy MongoDB migrations
docker compose exec app npm run migrate
```

### Step 3: Run Database Seeds
To populate default lookup plans, features, and setup super-admin profiles:
```bash
# Seed PostgreSQL users
docker compose exec app npm run db:seed:prisma

# Seed MongoDB collections
docker compose exec app npm run db:seed
```
The application will be accessible at `http://localhost:3000`.
