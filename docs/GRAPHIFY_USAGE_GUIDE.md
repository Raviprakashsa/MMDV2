# Graphify Usage Guide — MMD V2

This guide defines how to operate and integrate **Graphify** into the development lifecycle and governance workflows of the **MMD V2** enterprise SaaS project.

---

## 1. How to Regenerate the Graph

To update the architecture graph and reports after any code modifications, run the AST-only local regeneration command from the project root:

```powershell
# Bypasses LLM requirements and uses incremental cached AST parsers
graphify update ./

# Relocate files from default workspace output to the integrated docs directory
Move-Item -Path "graphify-out/*" -Destination "docs/architecture/graphify" -Force
Move-Item -Path "graphify-out/.*" -Destination "docs/architecture/graphify" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "graphify-out" -Recurse -Force -ErrorAction SilentlyContinue
```

> [!TIP]
> If LLM credentials (`GEMINI_API_KEY` or `GOOGLE_API_KEY`) are available in your session, you can run a full semantic extraction using:
> `graphify extract ./ --out docs/architecture/graphify`
> This enables advanced natural language clustering and automatic, context-aware community naming.

---

## 2. When to Regenerate the Graph

Regeneration must be performed at critical milestones to prevent documentation drift:

1. **Before Creating Any Implementation Plan**: Build the graph to map outbound dependencies and identify potential side effects of proposed architectural changes.
2. **During Feature Branch Commits**: Ensure developers update the graph on feature branches before opening a Pull Request.
3. **During Phase Completion Audits**: Generate a final graph baseline at the end of each major implementation milestone (e.g. A3 Step 4, A3 Step 5).
4. **Before Deployment/Release gates**: Verify zero layer boundary violations.

---

## 3. How to Use the Generated Artifacts

### A. programmatically querying `graph.json`
`graph.json` contains a raw, serialized representation of the codebase hierarchy (nodes represent files, imports, functions, schemas, or docs; edges represent relationships).

* **Enforcing Layer Rules**: Write script assertions that parse `graph.json` and throw errors if an edge traverses forbidden paths.
  * *Constraint Example*: No edge of type `calls` or `imports` should originate from `app/(dashboard)/*` or `components/*` and target `lib/foundation/repositories/*` or `prisma/client`.
* **Shortest Dependency Paths**: Use the Graphify CLI to trace how two symbols are connected:
  ```powershell
  graphify path "LeadForm" "connectDB" --graph docs/architecture/graphify/graph.json
  ```

### B. Analyzing Structure via `GRAPH_REPORT.md`
`GRAPH_REPORT.md` acts as a static ledger of architectural health.
* **Identify God Nodes**: Review the "God Nodes" section to monitor core coupling. If a utility function or helper accumulates excessive edges (e.g. `connectDB` or `cn`), verify that it is properly isolated and optimized.
* **Analyze Surprising Connections**: Check the "Surprising Connections" section to catch unintended side effects (e.g., UI elements triggering backend handlers or bypassing route helpers).
* **Detect Import Cycles**: Verify that "Import Cycles" remains `None detected` to ensure clean compile-time scopes and prevent circular dependency leaks.

---

## 4. Phase Governance & Review Integration

Graphify artifacts are mandatory inputs for the project's governance documentation.

### A. Integrating into `PHASE_COMPLETION_REPORT.md`
When compiling a Phase Completion Report (e.g. `docs/A3_STEP_4_REPORT.md`), you must append a **Graphify Metrics Section** capturing:
1. **Graph Delta**: Record the change in node/edge counts compared to the previous phase baseline.
2. **Layer Isolation Verdict**: Confirm that the new components adhere to the `Route -> Service -> Repository -> Prisma` boundary. Cite programmatic queries on `graph.json` as proof of compliance.
3. **Changelog Entry**: Document the baseline generation in `docs/architecture/graphify/GRAPH_CHANGELOG.md`.

### B. Integrating into `PHASE_READINESS_REPORT.md`
Before advancing to a new phase (e.g. A3 Step 5 to A4 ATS), the Readiness Report must reference Graphify's health checks:
1. **Visual Walkthrough**: Embed an interactive view of `graph.html` to help team leads trace system flows and plan integration scopes.
2. **Dependency Risk Assessment**: Analyze structural communities associated with the target feature. For example, before modifying Company endpoints, inspect `Community 5` and `Community 47` to catalog all impacted pages and models.
3. **Cycle Cleanliness**: Confirm the absence of circular imports to ensure safe package isolation before introducing new modules.
