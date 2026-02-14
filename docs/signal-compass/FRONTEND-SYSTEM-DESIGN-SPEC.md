# Signal Compass Frontend System Design Spec (Hour 6)

## Purpose
Define an implementation-grade frontend architecture that stays SOLID under rapid delivery pressure.

## 1) Architecture Decisions (Frontend)

### A. Feature-first vertical slices
- Keep each domain capability (`regime`, `drivers`, `alerts`, `playbook`) isolated.
- Every slice owns:
  - VM contracts
  - DTO->VM mappers
  - container orchestration
  - presentational components
  - tests

### B. Explicit boundary layers
1. **Transport layer** (`lib/signal-compass/api`)
   - handles HTTP call details, request params, and envelope decoding entry points
   - never formats UI copy
2. **Contract layer** (`lib/signal-compass/contracts`)
   - generated DTO types + runtime guards + parse error taxonomy
3. **Transformation layer** (`features/*/mappers`)
   - pure DTO->VM mapping
4. **Presentation layer** (`features/*/components`)
   - render-only, no API or DTO knowledge
5. **Composition layer** (`app/signal-compass/page.tsx`)
   - wires feature containers into route layout

### C. Data-state standardization
All slices must implement the same user-state matrix:
- `loading`
- `empty`
- `error` (retry affordance)
- `stale` (trust cue with reason)
- `ready`

Use a shared `DataStateBoundary` to eliminate inconsistent state handling.

---

## 2) Typed Contract + Guard Pipeline

## Source of truth
- OpenAPI file: `docs/signal-compass/openapi.v1.yaml`
- Changelog discipline: `docs/signal-compass/CHANGELOG.md`

## Pipeline
1. Run `contracts:generate` -> create DTO typings (`generated.ts`).
2. Maintain hand-authored runtime validators (`guards.ts`) for endpoint envelopes.
3. Parse payloads at client boundary.
4. Emit typed parse error metadata when guard fails.

## Parse error taxonomy (for observability)
- `SC_PARSE_SCHEMA_MISMATCH`
- `SC_PARSE_ENUM_DRIFT`
- `SC_PARSE_REQUIRED_FIELD_MISSING`
- `SC_PARSE_INVALID_TIMESTAMP`

All parse failures publish event `signal_compass_contract_parse_error` with:
- `endpoint`
- `apiVersion`
- `errorCode`
- `requestId`

---

## 3) VM Contracts (UI-Stable)

Define stable VM contracts that do not leak transport concerns.

### `RegimeHeroVm`
- `regimeLabel`
- `score`
- `confidenceLabel`
- `freshnessLabel`
- `isStale`
- `staleReason`
- `asOfLabel`

### `DriverContributionVm`
- `driverKey`
- `displayName`
- `signedContribution`
- `direction` (`positive` | `negative`)
- `rationale`

### `AlertListItemVm`
- `id`
- `severity`
- `title`
- `message`
- `triggeredAtLabel`
- `regimeContext`

### `PlaybookVm`
- `regime`
- `primaryAction`
- `riskGuardrails[]`
- `notes[]`

Rule: VM changes are intentional API-to-UI contract events and must be reviewed explicitly in PR.

---

## 4) Container Contracts (Dependency Inversion)

Containers depend on narrow read ports, not concrete client implementations.

Example contracts:
- `RegimeReadPort.getCurrent(params): Promise<CurrentRegimeEnvelope>`
- `DriverReadPort.getDrivers(params): Promise<DriverEnvelope>`
- `AlertReadPort.getAlerts(params): Promise<AlertEnvelope>`
- `PlaybookReadPort.getCurrent(params): Promise<PlaybookEnvelope>`

Injection strategy:
- default app wiring provides HTTP adapters
- tests provide fixture-backed fake adapters

Benefits:
- deterministic tests
- no fetch mocking leakage into presentation tests
- extension-ready for SSR/cache evolution

---

## 5) Caching and Revalidation Policy

## Baseline policy
- Route-level dynamic data with short revalidate window
- Slice-level stale threshold from backend freshness metadata

## Recommended starting points
- `regime/current`: poll or revalidate every 60s
- `drivers`: every 120s
- `alerts`: every 60s with cursor pagination on demand
- `playbook/current`: every 300s

If backend freshness exceeds threshold:
- retain last good VM
- show stale state cue
- do not silently hide degradation

---

## 6) Accessibility and Interaction Standards

- Landmark structure: `main` + section headings in strict hierarchy
- Regime changes announced via polite live region
- Retry and pagination controls keyboard reachable
- Color is never sole signal for confidence/severity
- Minimum tap target and focus-visible ring for interactive controls

A11y acceptance must be evidenced per slice in CI.

---

## 7) Testing Strategy (Implementation-Oriented)

## A. Mapper unit tests (mandatory)
- nominal mapping
- missing optional fields
- stale metadata mapping
- deterministic sort for ties

## B. Container integration tests
- loading/empty/error/stale/ready state transitions
- retry callback behavior
- pagination intent emission for alerts

## C. Contract smoke tests
- valid fixtures pass all guards
- invalid fixtures fail with expected parse error code

## D. Presenter tests
- semantic rendering and copy from VM only
- no DTO imports allowed

---

## 8) Delivery Workpackets (Next 2 Days)

### WP-FE-06 (Half day)
- scaffold VM contracts for all slices
- scaffold read ports + adapter interfaces
- add DTO-import policy check script

### WP-FE-07 (Half day)
- implement `DataStateBoundary` API and story examples
- wire regime container to read port + mapper + boundary

### WP-FE-08 (Half day)
- implement drivers container/presenter with deterministic ordering
- add integration tests for tie-break sorting and stale state

### WP-FE-09 (Half day)
- implement alerts list with cursor handling and empty/error states
- add accessibility smoke for list semantics + keyboard flow

---

## 9) Non-Negotiable Senior FE Rules

1. No raw DTO types inside presenters.
2. No business decision logic in JSX.
3. Every async slice must surface stale state explicitly.
4. Every mapper change requires tests.
5. Every contract drift must update changelog and fixtures.

This spec is intentionally strict so speed does not erode maintainability.