# Signal Compass Implementation Plan (Hour 0 → Week 2)

## Guiding Principles
- Build thin vertical slices from contract to UI.
- Keep domain logic isolated and unit-testable.
- Make every slice demoable with mockable adapters.

## Workstreams

## WS1 — Domain and Contracts
**Objective:** lock vocabulary and API shape before service logic.

### Tasks
1. Freeze entity definitions and invariants.
2. Finalize OpenAPI baseline (`openapi.v1.yaml`).
3. Generate typed DTOs for frontend consumption.
4. Add contract test harness scaffold.

### Deliverables
- Stable `RegimeSnapshot` + `DriverContribution` contract.
- Contract governance checklist and changelog pattern.

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
4. Implement timeline and alert center placeholders with loading/empty/error states.

### Deliverables
- Feature-flagged dashboard route in staging.
- Basic accessibility checks (keyboard + semantic landmarks).

## Sequencing (Micro-Iterations)
- Iteration A (Day 1): contract freeze + mock responses.
- Iteration B (Day 1-2): scoring core + tests.
- Iteration C (Day 2-3): API read endpoints.
- Iteration D (Day 3-4): frontend integration + telemetry hooks.

## Definition of Ready (per task)
- Business rule written in one sentence.
- Input/output contract identified.
- Test cases identified before implementation.

## Definition of Done (per slice)
- Domain tests pass.
- Contract tests pass.
- Lint/typecheck/build pass.
- Docs updated (contract + rationale).
- Observable in logs with requestId.
