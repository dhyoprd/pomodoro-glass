# Signal Compass Scoring Engine Execution Spec (Hour 5)

## Purpose
Translate architecture + ADR decisions into implementation-ready backend work for deterministic scoring, confidence, and alert emission.

## Scope (V1)
- Pure scoring core (no transport, no storage side effects)
- Confidence policy with stale/missing data degradation
- Delta computation vs previous snapshot
- Alert candidate generation (before channel delivery)

---

## 1) Module Boundaries (SOLID)

### `ScoringPolicyPort`
```ts
export interface ScoringPolicyPort {
  score(input: ScoreInput): ScoreOutput;
}
```
- **SRP:** only computes score + regime classification.
- **DIP:** use-cases depend on this port, not concrete weight strategy.

### `ConfidencePolicyPort`
```ts
export interface ConfidencePolicyPort {
  evaluate(input: ConfidenceInput): ConfidenceResult;
}
```
- Owns confidence level + reasons.
- Must not know HTTP/API shapes.

### `DeltaPolicyPort`
```ts
export interface DeltaPolicyPort {
  compare(current: ScoreOutput, previous: ScoreOutput | null): DeltaResult;
}
```
- Computes movement and changed drivers.

### `AlertPolicyPort`
```ts
export interface AlertPolicyPort {
  evaluate(input: AlertPolicyInput): AlertDecision[];
}
```
- Applies ADR-001 crossing/delta/gating/cooldown logic.

---

## 2) Input/Output Contracts (Domain Level)

## `ScoreInput`
- `asOf: string` (ISO)
- `signals: Record<SignalKey, number | null>`
- `weights: Record<SignalKey, number>`
- `modelVersion: string`

## `ScoreOutput`
- `regime: "RISK_ON" | "NEUTRAL" | "RISK_OFF"`
- `score: number` (0..100)
- `drivers: DriverContribution[]`
- `modelVersion: string`
- `asOf: string`

## `ConfidenceResult`
- `level: "HIGH" | "MEDIUM" | "LOW"`
- `value: number` (0..1)
- `reasons: string[]`
- `freshnessState: "fresh" | "stale" | "degraded"`

## `DeltaResult`
- `scoreDelta: number`
- `regimeChanged: boolean`
- `topChanges: DriverDelta[]`

---

## 3) Deterministic Rules (V1)

1. Missing critical feeds reduce confidence before any regime decision is surfaced as trusted.
2. Outlier clipping occurs before weighted aggregation (winsorization threshold fixed in config).
3. Score rounding strategy is fixed (`round(score, 2)`) to avoid snapshot jitter.
4. Driver ordering is stable (abs contribution DESC, then signal key ASC).
5. Alert suppression order is fixed (crossing > delta) per ADR-001.

---

## 4) Test Strategy (Execution-Ready)

## Unit tests
- `WeightedScoringPolicy.spec.ts`
  - deterministic score for golden fixtures
  - clipping behavior for outliers
  - missing-signal fallback handling
- `ConfidencePolicy.spec.ts`
  - stale-data downgrade
  - low coverage downgrade
  - combined penalty behavior
- `AlertPolicy.spec.ts`
  - threshold crossing emits exactly once in cooldown window
  - delta-only signals suppressed when crossing already triggered
  - stale/low-confidence gating suppression

## Fixture packs
- `fixtures/scoring/base-risk-on.json`
- `fixtures/scoring/base-neutral.json`
- `fixtures/scoring/base-risk-off.json`
- `fixtures/scoring/stale-critical-feed.json`
- `fixtures/scoring/boundary-crossing.json`

## Coverage gates
- Core policy modules: >= 90% line, >= 85% branch.
- Any changed rule requires a fixture addition and changelog note.

---

## 5) Implementation Sequence (Micro-Iterations)

### SE-01 (Now)
- Define domain interfaces + DTO-free input/output contracts.
- Add fixtures for baseline regimes and threshold boundaries.

### SE-02
- Implement weighted scorer + confidence evaluator.
- Add golden fixture tests and rounding determinism checks.

### SE-03
- Implement delta + alert policy adapter from ADR-001.
- Add suppression-order + cooldown tests.

### SE-04
- Wire scoring module into use-case layer and expose API mapping.
- Ensure API envelope includes policy evidence fields.

---

## 6) Done Criteria (Scoring Slice)
- Pure policies have no infra imports.
- Golden fixtures stable across reruns.
- Suppression-order tests pass.
- Contract examples updated for rationale/evidence fields.
- Changelog/ADR references linked in PR description.
