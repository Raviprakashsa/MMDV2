# Root Structure Review

Status: Review only. No file moved.

## Root-Level Files Review

| File | Purpose | Owner | Required? | Recommended Location | Reason |
|---|---|---|---|---|---|
| .env.example | Environment template | Platform Engineering | Yes | Root | Standard onboarding and deployment template |
| .env.local | Local developer override | Developer Local | No (repo) | Remove from repo or keep local only | Machine-specific secret/config file |
| .gitignore | VCS ignore rules | Platform Engineering | Yes | Root | Required by Git workflow |
| audit_report.json | Generated audit output | QA/Security | No | docs/archive/ | Generated artifact |
| backstop.json | Visual regression config | QA | Yes | Root | Tool expects root config |
| CI.md | CI notes | DevOps | Conditional | docs/archive/ | Documentation belongs in docs |
| components.json | UI tooling config | Frontend | Yes | Root | shadcn and tooling convention |
| COMPREHENSIVE_CODEBASE_GUIDELINE_REPORT.md | Analysis report | Architecture | No | docs/archive/ | Historical report |
| dashboard-eslint.json | Generated lint report | QA/Frontend | No | docs/archive/ | Generated artifact |
| docker-compose.yml | Local orchestration | DevOps | Yes | Root | Docker convention |
| Dockerfile | Container build recipe | DevOps | Yes | Root | Docker convention |
| eslint-report.json | Generated lint report | QA/Frontend | No | docs/archive/ | Generated artifact |
| eslint-report.txt | Generated lint report | QA/Frontend | No | docs/archive/ | Generated artifact |
| eslint-target.json | Lint target helper | Frontend | Conditional | scripts/ or docs/archive/ | Keep only if pipeline references it |
| eslint.config.mjs | Lint configuration | Frontend | Yes | Root | Tooling convention |
| gh_run_*.log | CI run export | DevOps | No | docs/archive/ | Historical debug log |
| leads-fail-nav.png | Debug screenshot | QA | No | docs/archive/ | Evidence artifact, not runtime file |
| migrate-mongo-config.js | Legacy migration config | Data Engineering | No (future) | docs/archive/ | Postgres target architecture |
| MMD-Main-Final-End-to-End-Validation-Report-vFinal.md | Historical report | QA | No | docs/archive/ | Historical evidence |
| MMD-Main-Final-End-to-End-Validation-Report-vFinal.pdf | Historical report | QA | No | docs/archive/ | Historical evidence |
| MMD-Main-PreProd-Detailed-Certification-Report-v2.md | Historical report | QA | No | docs/archive/ | Historical evidence |
| MMD-Main-PreProd-Detailed-Certification-Report-v2.pdf | Historical report | QA | No | docs/archive/ | Historical evidence |
| MMD-Main-PreProd-Detailed-Certification-Report-v3.md | Historical report | QA | No | docs/archive/ | Historical evidence |
| MMD-Main-PreProd-Detailed-Certification-Report-v3.pdf | Historical report | QA | No | docs/archive/ | Historical evidence |
| new_theme.css | Experimental style file | Frontend | Conditional | styles/ or docs/archive/ | Root clutter unless active import |
| next-env.d.ts | Next.js TS declaration | Frontend | Yes | Root | Next.js convention |
| next.config.mjs | Next.js config | Frontend/Platform | Yes | Root | Framework convention |
| package-lock.json | Dependency lockfile | Platform Engineering | Yes | Root | Reproducible installs |
| package.json | Project manifest | Platform Engineering | Yes | Root | Required entrypoint |
| PLATFORM_SOP.md | SOP doc | Operations | Conditional | docs/archive/ | Belongs under docs |
| playwright_errors_excerpt.txt | Test debug export | QA | No | docs/archive/ | Generated artifact |
| postcss.config.js | CSS tool config | Frontend | Yes | Root | Tooling convention |
| Pre-Production-Certification-Report-MMD-Main-1.2.md | Historical report | QA | No | docs/archive/ | Historical evidence |
| Pre-Production-Certification-Report-MMD-Main-1.2.pdf | Historical report | QA | No | docs/archive/ | Historical evidence |
| production-readiness-report.md | Readiness report | QA/Architecture | Conditional | docs/archive/ | Overlaps with other readiness docs |
| PRODUCTION_READINESS.md | Readiness report | QA/Architecture | Conditional | docs/archive/ | Overlaps with other readiness docs |
| proxy.ts | Runtime/proxy logic | Platform Engineering | Yes | Root | Next.js proxy convention |
| query | Temporary scratch file | Unknown | No | Delete | Non-descriptive temp artifact |
| README.md | Project overview | Architecture | Yes | Root | Standard project entry doc |
| RELEASE.md | Release notes draft | Product/DevOps | Conditional | docs/archive/ | Better kept under docs |
| run_tests.bat | Windows test helper | QA | Conditional | scripts/ | Script belongs in scripts |
| tailwind.config.ts | Tailwind config | Frontend | Yes | Root | Tooling convention |
| test-conversion.ts | Utility script | Engineering | Conditional | scripts/ or docs/archive/ | One-off utility |
| test-output.css | Generated CSS output | Frontend | No | Delete | Build artifact |
| tmp-unused-candidates.json | Temporary analysis output | Engineering | No | Delete | Temporary artifact |
| tmp-unused.json | Temporary analysis output | Engineering | No | Delete | Temporary artifact |
| tsconfig.json | TS config | Platform Engineering | Yes | Root | Tooling convention |
| tsconfig.tsbuildinfo | TS incremental output | TypeScript | No | Delete | Build artifact |
| users_output.json | Temporary export | Engineering | No | Delete | Temporary artifact |
| vercel.json | Deployment config | DevOps | Yes | Root | Deployment config |

## Root-Level Directories (Context)
Keep in root: app, components, docs, lib, prisma, scripts, tests, styles, types, postman, hooks.

Review candidates for relocation/archive later: audit, Design Leads Page_new, k8s, migrations, node_modules (ignored from VCS).

## Outcome
- Root is currently overloaded with historical reports and generated outputs.
- Root should retain framework configs, manifests, and product entry files only.
