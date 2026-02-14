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
