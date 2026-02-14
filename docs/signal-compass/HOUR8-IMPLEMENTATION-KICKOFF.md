# Signal Compass Hour 8 — Implementation Kickoff Pack

## Objective
Convert lane-level planning into execution-ready micro-iterations that can be started immediately without architecture reinterpretation.

## Scope
- Docs/spec/planning only (no production code changes in this pass).
- SOLID + senior frontend standards baked into each task.
- Focus on first coding hour for Lane A/B/C.

## 1) Next-Commit Task Bundle (Implementation-Ready)

### Bundle A — Contract Boundary Scaffold (Lane A)
**Target paths**
- `src/lib/signal-compass/contracts/generated.ts`
- `src/lib/signal-compass/contracts/guards.ts`
- `src/lib/signal-compass/contracts/parseError.ts`
- `src/lib/signal-compass/contracts/__fixtures__/*.json`
- `scripts/signal-compass-contract-smoke.mjs`

**Tasks**
1. Add generated DTO placeholder file with explicit header (`AUTO-GENERATED; DO NOT EDIT`).
2. Add guard entry points per endpoint envelope.
3. Encode parse-error taxonomy constants and event payload shape.
4. Add valid/invalid fixture pair for each endpoint envelope.
5. Add smoke script to assert expected pass/fail outcomes.

**Acceptance gate**
- `npm run contracts:check` fails on fixture/schema mismatch.
- Invalid fixture failures map to deterministic taxonomy code.

---

### Bundle B — Regime Hero Vertical Slice Foundation (Lane B)
**Target paths**
- `src/features/signal-compass/regime/types.ts`
- `src/features/signal-compass/regime/mappers/toRegimeHeroVm.ts`
- `src/features/signal-compass/regime/containers/RegimeHeroContainer.tsx`
- `src/features/signal-compass/regime/components/RegimeHeroCard.tsx`
- `src/features/signal-compass/shared/components/DataStateBoundary.tsx`

**Tasks**
1. Declare `RegimeHeroVm` and immutable state union contract.
2. Implement pure mapper with stale/freshness handling and deterministic labels.
3. Container depends only on `RegimeReadPort` and mapper.
4. Presenter renders from VM only (no DTO imports, no decision logic in JSX).
5. Shared `DataStateBoundary` supports loading/empty/error/stale/ready.

**Acceptance gate**
- State matrix test coverage exists for all five data states.
- Presenter layer has no transport/domain imports.

---

### Bundle C — Scoring Core Code-First Scaffolding (Lane C)
**Target paths**
- `src/domain/signal-compass/scoring/policies.ts`
- `src/domain/signal-compass/scoring/weightedPolicy.ts`
- `src/domain/signal-compass/scoring/confidencePolicy.ts`
- `src/domain/signal-compass/scoring/__fixtures__/*.json`
- `src/domain/signal-compass/scoring/__tests__/*.test.ts`

**Tasks**
1. Define policy ports from execution spec.
2. Add baseline deterministic weighted scoring implementation stub.
3. Add confidence degradation path for stale/missing feed conditions.
4. Add fixture-driven tests for tie-break and stale behavior.

**Acceptance gate**
- Golden fixtures produce stable outputs across repeated runs.
- Stale/missing data path is explicit and test-verified.

---

## 2) CI/Policy Worklist (Same Sprint)
1. Add `contracts:generate`, `contracts:check`, `signal:quality:check` scripts to `package.json`.
2. Add policy script to block DTO imports in presenter directories.
3. Add check script to verify each slice has mapper tests + state-matrix tests.
4. Wire all checks into one CI gate (`npm run check`).

## 3) PR Sequence (Fast, Low-Risk)
1. **PR-1:** Contract scaffold + fixtures + smoke checks.
2. **PR-2:** Regime Hero VM/mapper/container/presenter + DataStateBoundary.
3. **PR-3:** Scoring policy scaffolding + golden fixtures/tests.

Rule: keep each PR mergeable independently with passing quality gates.

## 4) Review Checklist (Senior FE + SOLID)
- [ ] Dependency inversion demonstrated via read-port usage.
- [ ] Presenter is VM-only and stateless.
- [ ] Mapper is pure and directly unit-tested.
- [ ] Data-state behavior complete and screenshot-evidenced.
- [ ] Contract parse failures observable with deterministic code taxonomy.

## 5) Exit Criteria for Next Coding Window
- Lane A scaffolding merged.
- Lane B hero slice foundation merged behind feature flag.
- Lane C scoring port/tests scaffold merged.
- `npm run check` enforces new policy gates.

This pack is intentionally implementation-facing so the next hour can start coding immediately.