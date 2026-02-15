# Signal Compass Sprint Execution Board (Hour 7)

## Objective (Current Sprint Window)
Move from planning-heavy artifacts to implementation-ready coding backlog with strict SOLID + senior frontend quality gates.

## Sprint Lanes

### Lane A — Contracts & Client Boundary
**Goal:** eliminate FE/BE contract ambiguity before UI wiring.

1. Add `contracts:generate` script and generated output target.
2. Add `contracts:check` script for drift detection in CI.
3. Scaffold `generated.ts` + `guards.ts` + parse-error event contract.
4. Add fixture packs for `current/history/drivers/alerts/playbook` envelopes.

**Done when:**
- DTO generation runs in CI and local.
- Guard smoke tests pass against valid and invalid fixtures.
- Parse failures emit deterministic code taxonomy.

---

### Lane B — Vertical Slice: Regime Hero
**Goal:** ship first trustworthy UI slice behind feature flag.

1. Define `RegimeHeroVm` and mapper tests.
2. Implement `RegimeContainer` using `RegimeReadPort`.
3. Render `RegimeHeroCard` presenter with loading/empty/error/stale/ready states via `DataStateBoundary`.
4. Add integration tests for retry + stale-state rendering.

**Done when:**
- No DTO import in presenter layer.
- State matrix fully covered.
- Accessibility smoke checks pass.

---

### Lane C — Scoring Core Setup
**Goal:** lock deterministic scoring implementation path.

1. Scaffold policy interfaces (`ScoringPolicyPort`, `ConfidencePolicyPort`).
2. Add golden fixtures for baseline regimes + edge cases.
3. Implement deterministic weighted scoring with explicit tie-breaks.
4. Add tests for stale/missing feeds -> degraded confidence behavior.

**Done when:**
- Pure scoring module reaches target coverage.
- Fixture results deterministic across runs.
- Rules match `SCORING-ENGINE-EXECUTION-SPEC.md`.

---

## Cross-Cutting Quality Gates
- `npm run check` green.
- Contract changelog updated for every schema-impacting change.
- PR checklist includes SOLID boundary evidence and state-completeness screenshots.
- No merge if presenter depends on transport/domain modules.

## Risks & Countermeasures
1. **Risk:** Doc drift from execution reality.
   - **Countermeasure:** every completed lane task updates both changelog + execution log.
2. **Risk:** Fast feature work bypasses boundary rules.
   - **Countermeasure:** CI policy checks for DTO leakage + missing mapper tests.
3. **Risk:** Stale-data UX inconsistency.
   - **Countermeasure:** shared `DataStateBoundary` and stale metadata mapping tests.

## This Hour’s Success Criteria
- Convert lane goals into file-targeted implementation bundles with merge-safe PR sequence.
- Lock CI/policy checklist needed to enforce SOLID boundaries during coding.
- Keep planning artifacts synchronized (index, plan, changelog, execution log).

## Hour 8 Progress
- Added implementation-kickoff pack with concrete file targets and acceptance gates for Lane A/B/C.
- Defined CI policy worklist (`contracts:check`, DTO leakage policy, state-matrix guard checks).
- Defined low-risk PR order to accelerate coding while preserving reviewability.

Reference: `HOUR8-IMPLEMENTATION-KICKOFF.md`

## Hour 9 Progress
- Added strict execution cutline (`HOUR9-EXECUTION-CUTLINE.md`) to constrain the next coding hour into M1-M4 micro-iterations with explicit in/out-of-scope boundaries.
- Added PR readiness contract to enforce proof requirements for SOLID boundaries, state completeness, contract drift detection, determinism, and observability.
- Added reviewer fast-path checklist to reduce review latency while keeping merge safety high.

Reference: `HOUR9-EXECUTION-CUTLINE.md`

## Hour 10 Progress
- Added commit-grade micro-iteration execution plan (`HOUR10-MICRO-ITERATION-PLAN.md`) that translates cutline intent into timeboxed deliverables and command-verifiable acceptance checks.
- Added one-push packaging gate to force clean diffs and keep this run merge-safe under rapid iteration.
- Added deterministic verification success criteria so reviewers can validate contract checks, state boundaries, and scoring harness stability without ambiguity.

Reference: `HOUR10-MICRO-ITERATION-PLAN.md`
