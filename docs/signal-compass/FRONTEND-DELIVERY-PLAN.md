# Signal Compass Frontend Delivery Plan (Hour 3)

## Goal
Translate architecture + contract docs into implementation-ready frontend slices with acceptance criteria, risks, and quality gates.

## Sprint-Style Slice Backlog (Execution Order)

## Slice FE-01 — Contract Tooling Baseline
**Outcome:** frontend can safely consume API contract with generated types + runtime guards.

### Tasks
1. Add scripts:
   - `contracts:generate` (OpenAPI -> `src/lib/signal-compass/contracts/generated.ts`)
   - `contracts:check` (schema validate + no-drift check)
2. Add `guards.ts` for every primary envelope:
   - current regime
   - history
   - drivers
   - alerts
   - playbook
3. Add fixture payload set with `1.1.0-hour1` metadata.

### Acceptance Criteria
- Generated type file produced from `openapi.v1.yaml` without manual edits.
- Guard tests fail on enum drift or missing required fields.
- Fixture smoke test passes for all endpoint payloads.

### Risks / Mitigation
- **Risk:** OpenAPI enum changes break UI unexpectedly.
- **Mitigation:** block merge if guard fixtures fail.

---

## Slice FE-02 — Regime Hero Vertical Slice
**Outcome:** first visible dashboard capability with trust cues.

### Tasks
1. Implement `RegimeHeroContainer` + `RegimeHeroCard` presenter.
2. Implement mapper `mapRegimeSnapshotToHeroVm`.
3. Add stale/loading/empty/error states via `DataStateBoundary`.
4. Add confidence + freshness badge semantics and copy.

### Acceptance Criteria
- Route renders hero card from fixture and from live client.
- Degraded freshness renders stale badge + rationale text.
- Container tests verify VM mapping and fallback states.

### Risks / Mitigation
- **Risk:** stale-state copy inconsistent between cards.
- **Mitigation:** central freshness label helper in shared mapper utils.

---

## Slice FE-03 — Driver Contributions Panel
**Outcome:** explainability panel that shows top positive/negative contributors.

### Tasks
1. Implement container + presenter for top contributors.
2. Add signed contribution rendering (`+`/`-`) with deterministic sorting.
3. Add rationale tooltip/inline text strategy.

### Acceptance Criteria
- Top 3 positive and top 3 negative drivers shown consistently.
- Sorting deterministic for equal scores (secondary sort by driver key).
- Missing rationale handled gracefully with fallback copy.

---

## Slice FE-04 — Alerts + Timeline Basics
**Outcome:** situational awareness with minimal but robust list views.

### Tasks
1. Add alerts list container/presenter with cursor support.
2. Add compact history timeline (range-aware).
3. Normalize empty/error states with reusable boundary component.

### Acceptance Criteria
- Alerts list supports next cursor and hasMore behavior.
- Timeline displays change direction + timestamp formatting.
- Accessibility checks pass for list semantics and keyboard focus.

---

## Shared Quality Gates (All Slices)
- Typecheck + lint + unit tests green.
- No presentational component imports raw DTO types.
- Every mapper has tests covering:
  - nominal path,
  - stale data path,
  - partial/missing optional fields.
- Observability event fired on parse failures (`signal_compass_contract_parse_error`).

## PR Review Checklist
- [ ] Slice objective stated in PR description.
- [ ] Contract version tested against fixtures.
- [ ] VM contract added/updated intentionally.
- [ ] Loading/empty/error/stale states demonstrated (screenshots or tests).
- [ ] No SOLID violations (container/presenter boundary respected).

## Suggested 1-Week Sequence
- **Day 1:** FE-01 complete + merged.
- **Day 2:** FE-02 merged behind feature flag.
- **Day 3:** FE-03 merged.
- **Day 4:** FE-04 merged.
- **Day 5:** hardening (a11y pass, docs cleanup, smoke demo prep).
