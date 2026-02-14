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
