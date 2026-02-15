# Signal Compass Contract Changelog

## 2026-02-15
### Added
- Standardized `400` and `500` error responses for all read endpoints.
- Shared query parameters (`range`, `limit`, `cursor`) under `components.parameters`.
- `freshness` metadata in `RegimeSnapshot` to support trust and stale-data UX.
- Alert pagination metadata (`page.nextCursor`, `page.hasMore`).
- `meta.apiVersion` field requirement for response version traceability.

### Changed
- Contract version bumped to `1.1.0-hour1`.

### Notes
- No endpoint removals; all changes are backward-compatible additions.

## 2026-02-15 (Hour 5 planning artifacts)
### Added
- `SCORING-ENGINE-EXECUTION-SPEC.md` with deterministic scoring module boundaries, domain contracts, fixture matrix, and test gates.
- `FRONTEND-QUALITY-ENGINEERING-PLAN.md` with enforceable senior-FE quality gates and CI policy checks.

## 2026-02-15 (Hour 6 planning artifacts)
### Added
- `FRONTEND-SYSTEM-DESIGN-SPEC.md` with implementation-grade frontend architecture boundaries, VM contracts, read-port interfaces, revalidation policy, and parse-error taxonomy.

### Changed
- `README.md` docs index now includes frontend system design spec.
- `IMPLEMENTATION-PLAN.md` iteration checklist now references frontend system design spec as completed planning artifact.
- `SIGNAL-COMPASS-MASTER-TODO.md` frontend guardrails now include parse-error taxonomy and system-design linkage.

## 2026-02-15 (Hour 7 execution planning artifacts)
### Added
- `SPRINT-EXECUTION-BOARD.md` with lane-based micro-iteration sequencing and “done when” acceptance gates:
  - Lane A (contracts + guards),
  - Lane B (Regime Hero vertical slice),
  - Lane C (scoring core setup).

### Changed
- `README.md` docs index now includes sprint execution board.
- `IMPLEMENTATION-PLAN.md` now includes Iteration 5 to formalize sprint-oriented execution sequencing.
- `HOUR0-EXECUTION.md` now includes Hour 7 progress update and next tactical tasks.

## 2026-02-15 (Hour 8 implementation-kickoff packaging)
### Added
- `HOUR8-IMPLEMENTATION-KICKOFF.md` with coding-ready file targets, task bundles, acceptance gates, CI policy worklist, and merge-safe PR sequence.

### Changed
- `README.md` docs index now includes the Hour 8 kickoff artifact.
- `IMPLEMENTATION-PLAN.md` now includes Iteration 6 (coding window kickoff packaging).
- `SPRINT-EXECUTION-BOARD.md` now includes Hour 8 success criteria and progress snapshot.
- `HOUR0-EXECUTION.md` now includes Hour 8 completion log and Hour 8.5 next actions.

## 2026-02-15 (Hour 9 execution cutline planning)
### Added
- `HOUR9-EXECUTION-CUTLINE.md` with strict 60-minute micro-iteration cutline (M1-M4), PR readiness contract, risk burn-down map, and reviewer fast-path checklist.

### Changed
- `README.md` docs index now includes the Hour 9 execution-cutline artifact.
- `IMPLEMENTATION-PLAN.md` now includes Iteration 7 (hourly execution cutline).
- `SPRINT-EXECUTION-BOARD.md` now includes Hour 9 progress snapshot and references.

## 2026-02-15 (Hour 10 commit-grade micro-iteration planning)
### Added
- `HOUR10-MICRO-ITERATION-PLAN.md` with strict timeboxed M1-M4 deliverables, acceptance checks, one-push packaging rules, and reviewer-facing PR narrative template.

### Changed
- `README.md` docs index now includes Hour 10 micro-iteration plan.
- `IMPLEMENTATION-PLAN.md` now includes Iteration 8 (commit-grade execution plan).
- `SPRINT-EXECUTION-BOARD.md` now includes Hour 10 progress snapshot and references.

## 2026-02-15 (Hour 11 delivery sequencing planning)
### Added
- `HOUR11-DELIVERY-SEQUENCING.md` with code-boundary-aligned batch sequencing, acceptance evidence per batch, single-push merge strategy, and senior-frontend review checklist.

### Changed
- `README.md` docs index now includes Hour 11 delivery sequencing artifact.
- `IMPLEMENTATION-PLAN.md` now includes Iteration 9 (delivery sequencing for active code boundaries).
- `SPRINT-EXECUTION-BOARD.md` now includes Hour 11 progress snapshot and references.
