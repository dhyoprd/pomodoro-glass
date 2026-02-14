# Signal Compass — Master Todo (V1)

## A) Engineering Standards (Must Pass Before Merge)
- [ ] Use-case doc exists before coding.
- [ ] SOLID boundary check:
  - [ ] no domain logic in UI handlers
  - [ ] no infra calls directly from presentation layer
  - [ ] interfaces for replaceable adapters
- [ ] API schema updated (OpenAPI).
- [ ] Tests added: unit + integration + contract.
- [ ] Lint/typecheck/build all green.
- [ ] Changelog + migration notes included.

## B) Monorepo / Project Structure
- [ ] `/apps/web` (Next.js app router)
- [ ] `/apps/api` (Go service)
- [ ] `/packages/contracts` (OpenAPI/types/shared DTOs)
- [ ] `/packages/domain-spec` (regime definitions, enums, docs)
- [ ] `/docs` (PRD, ADR, runbooks, methodology)

## C) Domain Modeling (SOLID Core)
- [ ] Define entities: `RegimeState`, `SignalSnapshot`, `DriverContribution`, `AlertEvent`, `PlaybookState`
- [ ] Define ports/interfaces: `SignalFeedPort`, `ScoringPolicyPort`, `AlertDispatchPort`, `SnapshotRepositoryPort`
- [ ] Add scoring model versioning + explainability contract.
- [ ] Add confidence scoring contract + rationale fields.

## D) Backend API (Go) — V1
- [ ] Scaffold Go clean architecture (`cmd`, `internal/domain`, `internal/app`, `internal/infra`, `internal/http`).
- [ ] Implement endpoints:
  - [ ] `GET /v1/regime/current`
  - [ ] `GET /v1/regime/history`
  - [ ] `GET /v1/regime/drivers`
  - [ ] `GET /v1/playbook/current`
  - [ ] `GET /v1/alerts`
- [ ] Add strict request validation + consistent error envelope.
- [ ] Add idempotency strategy where needed (alerts/events).

## E) Data Pipeline & Reliability
- [ ] Build ingestion adapters (macro/rates/credit/fx/news).
- [ ] Normalize into canonical signal schema.
- [ ] Add freshness checks + stale flags.
- [ ] Add outlier and missing-data handling policy.
- [ ] Add fallback regime behavior when critical feeds unavailable.
- [ ] Add recompute scheduler + retry policy.

## F) Scoring & Explainability Engine
- [ ] Implement deterministic weighted scorer.
- [ ] Add per-driver contribution breakdown.
- [ ] Add “what changed since last snapshot” delta logic.
- [ ] Add confidence tiering (High/Medium/Low).
- [ ] Add explainability text generator from structured drivers.

## G) Alerts Engine
- [ ] Trigger on regime crossing thresholds.
- [ ] Trigger on significant delta move.
- [ ] Add cooldown/debounce to prevent spam.
- [ ] Add severity levels + routing rules.
- [ ] Add user preferences: channels, quiet hours, alert classes.

## H) Web App (Next.js) — Product Surfaces
- [ ] Home dashboard: regime hero + confidence badge + trend indicator.
- [ ] Drivers panel: top positive/negative contributors + “why” narrative.
- [ ] Timeline: 7d/30d regime track.
- [ ] Playbook panel: regime-aligned actions + anti-overreaction guidance.
- [ ] Alerts center with clear cause context.

## I) UX Rules (Aligned with current design direction)
- [ ] Max 1 primary CTA above fold.
- [ ] Max 5 visible core sections on home.
- [ ] No emoji in core product UI copy.
- [ ] Use icon system consistently.
- [ ] Keep advanced blocks collapsed by default.
- [ ] Mobile-first readability in <20s scan.

## J) Security / Compliance / Trust
- [ ] Add legal disclaimer in relevant surfaces.
- [ ] Add methodology page (transparent scoring).
- [ ] Add data-source disclosure + freshness indicators.
- [ ] Add audit log for scoring updates.
- [ ] Add privacy + retention policy docs.

## K) Testing Strategy
- [ ] Unit tests: scorer, confidence, alert thresholds.
- [ ] Integration tests: feed adapter → normalized schema, API invariants.
- [ ] Contract tests: OpenAPI conformance.
- [ ] E2E tests: dashboard load, regime-change visibility, alert visibility.

## L) Observability & Ops
- [ ] Structured logs with correlation IDs.
- [ ] Metrics: score compute latency, feed freshness, alert trigger frequency.
- [ ] Health checks: `/healthz`, `/readyz`.
- [ ] Incident runbook for feed outages.

## M) Milestones
### M1 — Core Engine
- [ ] scoring + current regime endpoint + basic web view

### M2 — Explainability
- [ ] driver breakdown + deltas + confidence

### M3 — Alerts + Playbooks
- [ ] actionable regime alerts + playbook UI

### M4 — Trust & Launch Readiness
- [ ] methodology, compliance pages, observability, polish

## N) Definition of Done (Feature-Level)
- [ ] Use case exists.
- [ ] SOLID boundary check passed.
- [ ] Tests + lint + typecheck + build pass.
- [ ] API docs/contracts updated.
- [ ] UX/accessibility reviewed.
- [ ] Changelog entry added.
