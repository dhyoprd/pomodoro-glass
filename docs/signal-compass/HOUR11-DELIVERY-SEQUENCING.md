# Signal Compass Hour 11 — Delivery Sequencing Plan (Docs → Commit)

## Objective
Shift from generic micro-iterations to implementation-sequenced delivery batches that map directly to current Next.js code boundaries and senior frontend review expectations.

## Scope for This Hour
- Tighten **implementation order** for contract tooling, VM boundaries, and scoring harness.
- Define a **single-branch merge strategy** that avoids architectural backtracking.
- Document **proof artifacts** required per batch to keep reviews factual and fast.

## Architecture Anchors (Must Hold)
1. **Presentation purity:** components in `src/ui/**` consume view models only.
2. **Application orchestration:** `src/application/**` coordinates use-cases and ports; no transport parsing.
3. **Boundary enforcement:** contract parsing and DTO guards stay in dedicated adapter layer (`src/features/signal-compass/infrastructure/contracts/**`).
4. **Determinism first:** scorer behavior must be fixture-driven and snapshot-stable before endpoint wiring.

## Batch Plan (Commit-Grade)

### Batch A — Contract Boundary Foundation (20 min)
**Targets**
- `package.json` scripts (`contracts:generate`, `contracts:check`, `signal-compass:smoke`)
- `scripts/signal-compass-contract-smoke.mjs`
- `src/features/signal-compass/infrastructure/contracts/guards.ts`
- `src/features/signal-compass/infrastructure/contracts/fixtures/*`

**Acceptance evidence**
- Invalid fixture fails with stable parse error code.
- Valid fixture passes in local smoke run.
- No guard logic leaks into presenter files.

---

### Batch B — Regime Hero Vertical Slice (25 min)
**Targets**
- `src/features/signal-compass/application/mappers/mapRegimeSnapshotToVm.ts`
- `src/features/signal-compass/application/view-models/RegimeHeroVm.ts`
- `src/features/signal-compass/ui/containers/RegimeHeroContainer.tsx`
- `src/features/signal-compass/ui/presenters/RegimeHeroCard.tsx`
- `src/features/signal-compass/ui/shared/DataStateBoundary.tsx`

**Acceptance evidence**
- State matrix tests: `loading | empty | error | stale | ready`.
- Presenter imports no DTO or repository modules.
- Freshness + confidence mapping policy explicitly tested.

---

### Batch C — Scoring Determinism Harness (15 min)
**Targets**
- `src/features/signal-compass/domain/ports/ScoringPolicyPort.ts`
- `src/features/signal-compass/domain/ports/ConfidencePolicyPort.ts`
- `src/features/signal-compass/domain/testing/fixtures/*`
- `src/features/signal-compass/domain/testing/scoring.golden.test.ts`

**Acceptance evidence**
- Snapshot outputs deterministic across repeated runs.
- Stale/missing feed scenarios degrade confidence predictably.
- Tie-break policy behavior codified in test names and expected outputs.

## Merge Strategy (Single Push)
1. Execute Batch A → verify scripts/smoke.
2. Execute Batch B → verify state matrix tests.
3. Execute Batch C → verify deterministic snapshots.
4. Update docs/changelog/execution log in same branch.
5. Push once with focused Signal Compass scope.

## Review Checklist (Senior Frontend)
- [ ] SOLID boundaries visible in imports (ports inward, presenters outward).
- [ ] No hidden coupling between contract adapters and presentational UI.
- [ ] State completeness proven with explicit test matrix.
- [ ] Determinism claims backed by fixture/snapshot evidence.
- [ ] Documentation updated to reflect shipped behavior, not intent.

## Definition of Success (Hour 11)
A reviewer can run one command bundle and quickly verify:
- contract drift detection + parse taxonomy,
- Regime Hero boundary/state behavior,
- scoring determinism under stale/missing inputs,
- synchronized docs for implementation traceability.

Suggested command bundle:
- `npm run contracts:check`
- `npm run test -- signal-compass`
- `npm run check`
