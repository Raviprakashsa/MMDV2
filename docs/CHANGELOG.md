# Changelog

All notable changes to the **MMD Recruit CRM** platform are documented in this file.

---

## [1.10.0] - 2026-06-09
### Added
- Standardized documentation layout files at the project root: `ARCHITECTURE.md`, `DEPLOYMENT.md`, `OPERATIONS.md`, and `CHANGELOG.md`.
- Hardened `.gitignore` rules to exclude Playwright test reports, caches, screenshots, and logs.

### Removed
- Obsolete developer-local styles (`app/globals.css.backup` and `app/globals.css.old`).
- Untracked debug files, debug HTML dumps, and temporary screenshots from the `/scripts` directory.

---

## [1.0.0] - 2026-06-07
### Added
- Production release of CRM monorepository featuring modular monoline design.
- Complete integration test suite (smoke & ats routes).
- Fully containerized staging configuration profiles.
