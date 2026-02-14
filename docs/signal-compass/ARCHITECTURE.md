# Signal Compass Architecture (Hour 0 Baseline)

## 1) System Goals
- Deliver an explainable market regime signal with strong trust cues.
- Keep core decision logic framework-agnostic and testable.
- Enable independent evolution of UI, scoring logic, and data adapters.

## 2) High-Level Architecture

```text
[External Feeds]
 macro | rates | credit | fx | news
        |
        v
[Ingestion Adapters] -----> [Normalization Layer] -----> [Signal Snapshot Store]
                                                     |
                                                     v
                                           [Scoring Policy Engine]
                                                     |
                           +-------------------------+-------------------------+
                           v                                                   v
                    [Regime API Service]                              [Alert Evaluator]
                           |                                                   |
                           v                                                   v
                    [Next.js Web App]                                   [Alert Channels]
```

## 3) Clean Architecture Boundaries

### Domain (pure business logic)
- Entities: `RegimeState`, `SignalSnapshot`, `DriverContribution`, `AlertEvent`, `PlaybookState`
- Value objects: `Confidence`, `RegimeScore`, `SignalFreshness`
- Policies: scoring, confidence, regime transitions

### Application (use-cases/orchestration)
- `ComputeCurrentRegimeUseCase`
- `GetRegimeHistoryUseCase`
- `GetDriverBreakdownUseCase`
- `EvaluateAlertsUseCase`
- `GetCurrentPlaybookUseCase`

### Infrastructure (adapters)
- Feed adapters (`MacroFeedAdapter`, `RatesFeedAdapter`, etc.)
- Repositories (`SnapshotRepositoryAdapter`, `AlertRepositoryAdapter`)
- Dispatchers (`EmailAlertAdapter`, `PushAlertAdapter`, `WebhookAlertAdapter`)

### Presentation
- Web route handlers / API clients
- UI composition and view models only

## 4) SOLID Enforcement Notes
- **SRP:** UI components never compute regime score.
- **OCP:** new scoring strategy extends `ScoringPolicyPort`.
- **LSP:** any feed adapter must return canonical snapshot shape + freshness metadata.
- **ISP:** split read-only and write-only repository ports.
- **DIP:** use-cases consume interfaces; adapters are wired at composition root.

## 5) Canonical Data Flow
1. Ingestion adapters fetch raw data with source timestamp.
2. Normalizer maps to canonical snapshot schema.
3. Snapshot stored with `modelVersion` + `asOf`.
4. Scoring engine computes:
   - regime score
   - confidence tier
   - top drivers
   - change delta vs previous snapshot
5. Alert evaluator checks transition rules and debounce windows.
6. API exposes read models to web/mobile clients.

## 6) Reliability Guardrails
- Freshness thresholds per feed category.
- Hard stale fallback mode: degrade confidence and annotate rationale.
- Deterministic scoring (same input => same output).
- Immutable snapshots for auditability.

## 7) Frontend Architecture (Senior FE Practices)
- View-model mappers between API DTO and UI components.
- Container/presenter split for heavy screens.
- Feature folders (`regime`, `drivers`, `alerts`, `playbooks`).
- Strong runtime validation at network boundaries.
- Error/empty/loading states standardized.

## 8) Initial Non-Functional Targets
- P95 `GET /v1/regime/current` < 300ms from API cache.
- Snapshot recompute interval: every 15m (configurable).
- Alert evaluation lag < 60s after snapshot ingestion.
- 99.5% read API availability target (post-beta).
