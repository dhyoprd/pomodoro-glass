# Signal Compass — Milestones (Execution Plan)

## Milestone 1 — Core Regime Engine (Weeks 1–2)
**Goal:** Deliver reliable current regime score with basic web visibility.

### Scope
- Define core entities and scoring policy interfaces.
- Implement deterministic weighted scorer.
- Implement `GET /v1/regime/current`.
- Build initial dashboard hero (regime + confidence + timestamp).

### Exit Criteria
- Regime score updates with stable schema.
- Core endpoint documented in OpenAPI.
- Unit tests for scoring baseline passing.
- Basic web dashboard deployed in staging.

---

## Milestone 2 — Explainability Layer (Weeks 3–4)
**Goal:** Explain why the score moved.

### Scope
- Driver contribution model.
- Delta engine: “what changed since last update.”
- UI breakdown cards + short rationale text.
- `GET /v1/regime/drivers`, `GET /v1/regime/history`.

### Exit Criteria
- Top-3 drivers shown with direction and weight.
- Daily delta explanation visible in UI.
- Integration tests for data→score→explanation flow pass.

---

## Milestone 3 — Alerts & Playbooks (Weeks 5–6)
**Goal:** Turn analysis into action.

### Scope
- Regime shift + significant delta alert rules.
- Alert cooldown/debounce.
- User preferences (severity, quiet hours, channels).
- Regime-specific playbook cards.

### Exit Criteria
- Alerts trigger only on meaningful state changes.
- Playbook visible and tied to current regime.
- False-positive alert rate within acceptable threshold.

---

## Milestone 4 — Trust & Launch Readiness (Weeks 7–8)
**Goal:** Harden for real users and public usage.

### Scope
- Methodology page + disclaimer coverage.
- SEO + metadata + discoverability setup.
- Observability: logs, metrics, health checks.
- Reliability hardening for stale/missing data.

### Exit Criteria
- Compliance/trust pages complete.
- Monitoring dashboards active.
- Staging soak test passes.
- Launch checklist signed off.

---

## Parallel Track — Mobile Readiness (Cross-milestone)
- Keep API contracts platform-neutral.
- Minimize web-only coupling in domain logic.
- Produce contract bundle for Kotlin/Swift clients.
- Validate payload compactness for mobile data use.

---

## Definition of Done (All Milestones)
- [ ] Use-case spec completed before coding.
- [ ] SOLID boundary checks passed.
- [ ] Tests + lint + typecheck + build passing.
- [ ] API/docs updated.
- [ ] UX/accessibility review completed.
- [ ] Changelog + release notes added.
