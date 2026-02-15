# Signal Compass Hour 10 — Micro-Iteration Plan (Execution to Commit)

## Objective
Convert the Hour 9 cutline into one merge-safe coding run with a single push while preserving SOLID boundaries and senior frontend quality bars.

## Working Rules (Non-Negotiable)
1. **One-way dependencies**: presenter -> VM only, container -> read ports only.
2. **No speculative abstractions**: add only interfaces needed for active lanes.
3. **Proof-first commits**: each micro-iteration must include test or smoke evidence.
4. **Small reversible units**: every commit chunk should be independently revert-safe.

## 60-Minute Execution Sequence

### M1 (00-12) — Contract toolchain activation
**Deliverables**
- Wire `contracts:generate` and `contracts:check` into `package.json`.
- Add `scripts/signal-compass-contract-smoke.mjs` fail-fast behavior.
- Add first fixture pair (`valid.current.json`, `invalid.current.missing-meta.json`).

**Acceptance checks**
- `npm run contracts:check` returns non-zero for invalid fixture.
- Smoke output includes stable parse-failure code (for observability).

---

### M2 (12-28) — Regime Hero boundary codification
**Deliverables**
- Create `RegimeHeroVm` contract and DTO->VM mapper.
- Add stale/readiness mapping rules (freshness + confidence gating).
- Define `DataStateBoundary` prop contract (`loading|empty|error|stale|ready`).

**Acceptance checks**
- Mapper unit test matrix covers all 5 states.
- Presenter receives VM shape only (no transport imports).

---

### M3 (28-48) — Scoring determinism harness
**Deliverables**
- Add `ScoringPolicyPort` + `ConfidencePolicyPort` interfaces.
- Add golden fixture schema (`baseline`, `threshold-crossing`, `stale-degraded`).
- Add tie-break rule test plan and expected-result snapshots.

**Acceptance checks**
- Re-run test command produces identical output snapshots.
- Missing/stale feed cases degrade confidence deterministically.

---

### M4 (48-60) — Packaging + push gate
**Deliverables**
- Validate lane artifacts are merge-safe in one branch.
- Update docs index + changelog + execution log with factual progress.
- Commit once with scope: `signal-compass hour10 micro-iteration execution pack`.

**Acceptance checks**
- `npm run check` (or scoped equivalent) is green for touched modules.
- Diff contains no unrelated module churn.

## PR Narrative Template (for this run)
- **Why**: close planning-to-code gap and enforce boundary contracts before broader UI/API implementation.
- **What**: activated contract smoke checks, codified Regime Hero state boundaries, seeded scoring determinism harness.
- **Risk control**: deterministic fixtures + parse error taxonomy + VM-only presenter boundary.

## Definition of Success (Hour 10)
- A reviewer can run one command set and verify:
  - contract drift detection works,
  - state boundary behavior is covered,
  - scoring harness is deterministic,
  - docs align with implemented reality.
