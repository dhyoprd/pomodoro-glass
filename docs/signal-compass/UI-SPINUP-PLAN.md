# Signal Compass UI Spin-Up Plan

## Goal
Launch a dedicated Signal Compass frontend surface with a modern startup style while preserving SOLID boundaries and implementation velocity.

## Phase 1 — Foundation
- Create `/signal-compass` route with independent UI shell.
- Establish visual language (dark premium tokens, clear hierarchy).
- Keep one primary CTA above the fold.

## Phase 2 — Core Dashboard Surface
- Hero: current regime, confidence, freshness.
- Explainability block: top drivers and rationale.
- Playbook block: what to do next.
- Sub-scores strip: inflation/policy/liquidity/growth/volatility.

## Phase 3 — Data & Boundaries
- Use DTO → ViewModel mapping at boundary.
- Keep domain/scoring logic out of presentational components.
- Plug in mocked contract responses first, then real API.

## Phase 4 — Quality Gates
- Accessibility: semantic structure, keyboard flow, visible focus.
- Performance: avoid heavy dependencies; keep client logic minimal.
- Testing: component interaction and state rendering coverage.

## Initial Deliverable (Sprint A)
- Route live on `/signal-compass`.
- Modern startup hero + dashboard skeleton.
- Mock-driven visible metrics and guidance cards.
- Ready for iterative integration with backend contracts.
