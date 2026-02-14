# Signal Compass Contract Governance

## Purpose
Keep API/frontend evolution safe under rapid iteration by enforcing explicit compatibility rules.

## Source of Truth
- OpenAPI file: `docs/signal-compass/openapi.v1.yaml`
- Contract owner: Signal Compass backend lead
- Consumer owner: Signal Compass frontend lead

## Versioning Rules
1. `info.version` follows `MAJOR.MINOR.PATCH-hourX` during pre-release.
2. **PATCH**: non-breaking docs/examples/default updates.
3. **MINOR**: additive fields/endpoints/enums with backwards compatibility.
4. **MAJOR**: removals, required field additions, semantic rewrites.
5. `meta.apiVersion` in runtime responses must match deployed contract stream.

## Breaking Change Policy
A change is breaking if it:
- removes/renames fields,
- makes optional fields required,
- narrows enum values,
- changes data type/format incompatibly,
- changes endpoint semantics without new version path.

Breaking changes require:
- ADR entry,
- migration notes for frontend,
- synchronized deployment plan,
- explicit approval from FE + BE owners.

## Pull Request Checklist (Contract Touching)
- [ ] OpenAPI validates locally.
- [ ] New/changed schemas include examples.
- [ ] Error cases documented (`400`, `500`, domain-specific when needed).
- [ ] DTO generation for frontend completed.
- [ ] Consumer impact note added to PR description.
- [ ] Changelog entry added in `docs/signal-compass/CHANGELOG.md` (create if missing).

## CI Gate (Planned)
1. Lint/validate OpenAPI schema.
2. Diff against `main` contract to detect breaking changes.
3. Fail build on unapproved breaking diffs.
4. Generate typed clients and fail on generation errors.

## Collaboration Cadence
- Contract review sync: 2x/week until beta.
- Hotfix changes: async review allowed, but ADR + changelog still mandatory.
- Any unresolved FE/BE contract mismatch blocks feature merge.
