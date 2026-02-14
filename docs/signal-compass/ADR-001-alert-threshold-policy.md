# ADR-001 — Alert Threshold Policy (V1)

- **Date:** 2026-02-15
- **Status:** Accepted (V1 baseline)
- **Owners:** Signal Compass team

## Context
Signal Compass needs alerting that is meaningful but non-spammy. We need deterministic rules that can be implemented before ML personalization and survive across web/mobile clients.

Current constraints:
- Contract-first API is in place (`openapi.v1.yaml`), but alert domain thresholds were still undecided.
- We need clear behavior for regime shift alerts, significant delta alerts, and stale-data suppression.
- V1 must favor user trust and explainability over sensitivity.

## Decision
Adopt a **3-layer threshold model** for V1 alerts:

1. **Regime Crossing Thresholds**
   - Trigger when `regime.score` crosses one of these boundaries:
     - `-0.60`, `-0.20`, `0.20`, `0.60`
   - Trigger direction must be explicit (`upward-cross`, `downward-cross`).

2. **Delta Magnitude Thresholds**
   - Trigger when absolute score delta from previous snapshot is:
     - `>= 0.25` for `severity=medium`
     - `>= 0.40` for `severity=high`
   - Delta alert is suppressed if a regime-crossing alert is already emitted in same compute cycle.

3. **Trust Gating Thresholds (Freshness/Confidence)**
   - Suppress all alerts when `freshness.state = stale`.
   - Downgrade high -> medium when `confidence.tier = medium`.
   - Suppress medium alerts when `confidence.tier = low`.

## Cooldown + Debounce Policy
- Global minimum interval between emitted alerts: **45 minutes**.
- Same alert fingerprint (same type + regime bucket + direction) cooldown: **6 hours**.
- Debounce window for noisy updates: **10 minutes** rolling; keep strongest candidate.

## Rationale
- Crossing boundaries is easy for users to understand and aligns to playbook states.
- Delta thresholds provide earlier signal without overreacting.
- Freshness/confidence gating protects trust and prevents false urgency.
- Fingerprint cooldown avoids repeated notifications for the same market move.

## Consequences
### Positive
- Deterministic and testable in unit/integration tests.
- Easy to explain in methodology and UI copy.
- Cross-platform consistent behavior from shared contract.

### Trade-offs
- Static thresholds may underfit some market regimes.
- Potentially slower alerting in fast but low-confidence transitions.

## Follow-up Tasks
1. Add `AlertPolicyConfig` section to domain spec and API metadata.
2. Add fixture cases for each threshold boundary and suppression path.
3. Add metrics:
   - `alerts_emitted_total{type,severity}`
   - `alerts_suppressed_total{reason}`
   - `alerts_deduped_total`
4. Revisit threshold values after 30 days of production telemetry.

## Validation Plan
- Unit tests for crossing/delta/gating rules and cooldown behavior.
- Integration tests for compute-cycle suppression ordering.
- Contract tests to ensure alert reason payload includes threshold evidence.
