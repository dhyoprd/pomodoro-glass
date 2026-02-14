# Signal Compass Frontend Quality Engineering Plan (Hour 5)

## Goal
Guarantee that each frontend slice ships with predictable UX states, contract safety, and maintainable boundaries.

## Quality Targets
- No unguarded API payload consumption in feature code.
- All feature containers prove loading/empty/error/stale behavior.
- VM mapping logic fully unit-tested with deterministic fixtures.
- Accessibility baseline enforced in CI for route-level smoke.

---

## 1) Quality Architecture

## Layer responsibility matrix
- **API Client (`lib/signal-compass/api`)**
  - owns transport and envelope parsing handoff
  - no UI formatting
- **Guards (`lib/signal-compass/contracts/guards.ts`)**
  - runtime schemas for all endpoint envelopes
  - parse failures mapped to typed contract errors
- **Mappers (`features/*/mappers`)**
  - DTO -> VM conversion only
  - default/fallback text policy centralized
- **Presenters (`features/*/components`)**
  - pure render from VM props
  - never call fetch, never parse DTOs

## Rule of enforcement
Any presenter importing `generated.ts` DTOs is a CI fail.

---

## 2) Required Test Packs per Slice

Each feature slice (`regime`, `drivers`, `alerts`, `playbook`) must ship:

1. **Mapper unit tests**
   - valid payload -> VM snapshot
   - stale payload -> stale badge + messaging
   - missing optional fields -> safe fallback VM

2. **Container integration tests**
   - loading state visible
   - empty state visible
   - error state with retry action visible
   - stale state badge and trust explanation visible

3. **Contract smoke tests**
   - all fixture payloads parse through guards
   - invalid enum fixture fails with explicit parse error code

4. **A11y smoke**
   - heading hierarchy valid
   - keyboard focus reaches actionable controls
   - status messages announced (aria-live where needed)

---

## 3) CI Quality Gates (Frontend)

## Mandatory checks
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test --filter signal-compass`
- `pnpm test:a11y --filter signal-compass`

## Additional policy checks
- DTO import guard script:
  - fail if files under `features/**/components` import from `lib/signal-compass/contracts/generated`
- Story/fixture parity check:
  - each endpoint must have at least one valid fixture and one invalid fixture.

---

## 4) PR Review Checklist (Senior FE Standard)

- [ ] Container/presenter split preserved
- [ ] DTO -> VM mapping isolated and tested
- [ ] Loading/empty/error/stale states demonstrated (screenshots or story links)
- [ ] Parse failures observable with stable error code
- [ ] Accessibility smoke evidence attached
- [ ] No implicit business rules hidden in JSX

---

## 5) Execution Plan (Next Iterations)

### FQ-01
- Scaffold `guards.ts` and contract error taxonomy.
- Add fixture parse smoke test harness.

### FQ-02
- Implement `DataStateBoundary` with enforced state props API.
- Add RTL coverage for all four state modes.

### FQ-03
- Add DTO-import guard lint script.
- Integrate gate into CI workflow.

### FQ-04
- Add per-slice a11y smoke tests (regime first, then drivers/alerts/playbook).

---

## 6) Definition of Done (Frontend Quality)
- Every shipped slice has mapper + container + contract smoke tests.
- CI blocks DTO leakage into presenters.
- Stale state is treated as first-class UX state.
- Accessibility baseline passes consistently in CI.
