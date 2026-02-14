# Signal Compass Implementation Plan (Hour 1 → Week 2)

## Guiding Principles
- Build thin vertical slices from contract to UI.
- Keep domain logic isolated and unit-testable.
- Make every slice demoable with mockable adapters.
- Favor deterministic behavior and explicit observability over cleverness.

## Workstreams

## WS1 — Domain and Contracts
**Objective:** lock vocabulary and API shape before service logic.

### Tasks
1. Freeze entity definitions and invariants.
2. Finalize OpenAPI baseline (`openapi.v1.yaml`) and changelog discipline.
3. Generate typed DTOs for frontend consumption.
4. Add contract lint + diff harness scaffold.

### Deliverables
- Stable `RegimeSnapshot` + `DriverContribution` contract.
- Contract governance checklist and changelog pattern.
- CI stub for schema validation and breaking-change checks.

## WS2 — Scoring Core
**Objective:** deterministic regime scoring and confidence logic.

### Tasks
1. Implement `ScoringPolicyPort` and baseline weighted policy.
2. Implement confidence policy with explicit thresholds.
3. Implement delta computation against previous snapshot.
4. Unit tests for edge cases (missing feeds, outliers, stale data).

### Deliverables
- Scoring module with >90% line coverage.
- Golden test fixtures for deterministic output.

## WS3 — API Service
**Objective:** expose read endpoints with stable envelope and observability.

### Tasks
1. Wire use-cases to HTTP handlers.
2. Implement response envelope + error envelope.
3. Add query validation and pagination.
4. Add request-id and latency logging.

### Deliverables
- `/v1/regime/current`, `/history`, `/drivers`, `/playbook/current`, `/alerts`
- API smoke tests in CI.

## WS4 — Frontend Experience
**Objective:** clear, scan-fast, and explainable dashboard.

### Tasks
1. Create API client + runtime response guards.
2. Implement hero card (regime, confidence, freshness).
3. Implement driver contribution panel (top +/− and rationale).
4. Implement timeline + alert center with loading/empty/error states.

### Deliverables
- Feature-flagged dashboard route in staging.
- Basic accessibility checks (keyboard + semantic landmarks).

## Hour-Scale Micro-Iterations (Execution Ready)

### Iteration 1 — Contract Hardening (Done)
- Added explicit error response envelopes and reusable query params.
- Added freshness and pagination metadata to support trustworthy UX.
- Introduced changelog + governance docs.

### Iteration 2 — Frontend Contract Consumption (In Progress)
- [x] Define senior-FE implementation blueprint (feature modules, container/presenter split, VM mapping contracts).
- [x] Define slice-level frontend delivery plan with acceptance criteria + quality gates.
- [x] Define frontend system design spec (ports, VM boundaries, caching/revalidation, parse-error taxonomy).
- [ ] Generate TS types from OpenAPI.
- [ ] Build API client wrappers and parser guards.
- [ ] Add mock fixture set aligned to `1.1.0-hour1`.

### Iteration 3 — Scoring Slice (In Progress)
- [x] Finalized V1 alert-threshold ADR (`ADR-001-alert-threshold-policy.md`) covering crossing/delta/gating/cooldown rules.
- [x] Authored scoring implementation execution spec (`SCORING-ENGINE-EXECUTION-SPEC.md`) with ports/contracts/fixtures/test gates.
- [ ] Implement pure scoring module with fixture-driven tests.
- [ ] Add stale-data behavior path returning degraded confidence.
- [ ] Encode suppression ordering (crossing > delta) in alert policy tests.

### Iteration 4 — Vertical Slice Demo (Queued)
- Hook mock API responses to dashboard shell.
- Render hero + drivers + alerts with fallback states.

## Definition of Ready (per task)
- Business rule written in one sentence.
- Input/output contract identified.
- Test cases identified before implementation.
- Owner + reviewers assigned.

## Definition of Done (per slice)
- Domain tests pass.
- Contract tests pass.
- Lint/typecheck/build pass.
- Docs updated (contract + rationale).
- Observable in logs with `requestId`.

## Exit Criteria for Week 2
- End-to-end read path demoable in staging with mock or real adapters.
- No unresolved contract diffs between FE and BE.
- Alert and freshness states visible and test-covered.
