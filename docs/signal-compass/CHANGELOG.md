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

### Changed
- `IMPLEMENTATION-PLAN.md` iteration checklist now references scoring execution spec as completed planning artifact.
- `SIGNAL-COMPASS-MASTER-TODO.md` frontend guardrails now include CI policy checks and quality-plan linkage.
