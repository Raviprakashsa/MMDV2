# 12-devops-deployment-architecture

Source PDF: P-13/12-devops-deployment-architecture.pdf

## Page 1

MMD V2 - DevOps & Deployment Architecture
Deployment Philosophy
Start Simple.
Scale Later .
Avoid Kubernetes initially.
Environment Strategy
Development
↓
Staging
↓
Production
Development
Local Machine
Docker Compose
PostgreSQL
Prisma
Mailpit
Staging
VPS
1

## Page 2

Docker
PostgreSQL
Cloudflare
Production
VPS (Initial)
Later:
AWS
GCP
Azure
Docker Services
app
postgres
worker
mailpit
CI/CD Pipeline
Git Push
↓
GitHub Actions
↓
Lint
2

## Page 3

↓
Typecheck
↓
Tests
↓
Build
↓
Deploy
Branch Strategy
main
develop
feature/*
hotfix/*
release/*
Deployment Flow
Feature Branch
↓
Pull Request
↓
Review
↓
3

## Page 4

Merge Develop
↓
Staging
↓
Merge Main
↓
Production
Backup Strategy
Daily Database Backup
7 Day Retention
30 Day Monthly Backup
Monitoring
Pino
BetterStack
Health Checks
Future Scaling
Separate Worker
Read Replicas
CDN
Object Storage
4

## Page 5

Caching Layer
5
