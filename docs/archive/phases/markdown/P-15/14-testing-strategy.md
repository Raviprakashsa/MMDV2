# 14-testing-strategy

Source PDF: P-15/14-testing-strategy.pdf

## Page 1

MMD V2 - Testing Strategy
Testing Pyramid
Unit Tests
↓
Integration Tests
↓
End-to-End Tests
Unit Testing
Services
Validators
Utilities
Repositories
Integration Testing
API Routes
Database Operations
Authentication
Permissions
E2E Testing
Playwright
1

## Page 2

Critical Flows:
Login
Lead Creation
Candidate Flow
Interview Flow
Placement Flow
Invoice Flow
Regression Suite
Every Release
Run:
Typecheck
Lint
Unit Tests
Integration Tests
E2E Tests
Test Data
Seed Database
Demo Tenant
Demo Users
2

## Page 3

Coverage Goals
Services
90%
Validators
95%
Critical APIs
90%
Release Gate
No Production Deploy If:
Tests Fail
Lint Fails
Build Fails
Migration Fails
3
