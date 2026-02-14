# Signal Compass Frontend Implementation Blueprint (Hour 2)

## Objective
Ship a production-grade dashboard shell quickly without violating SOLID boundaries.

## Scope
- Contract-first DTO consumption from `openapi.v1.yaml`
- Typed API client + runtime guards
- Feature-sliced dashboard modules (`regime`, `drivers`, `alerts`, `playbook`)
- Deterministic UI states (loading, empty, error, stale)

## Proposed Frontend Structure (Next.js App Router)

```text
src/
  app/
    signal-compass/
      page.tsx                      # composition root (container orchestration)
  features/signal-compass/
    regime/
      components/
        RegimeHeroCard.tsx          # presentational
        RegimeHeroCard.skeleton.tsx
      containers/
        RegimeHeroContainer.tsx     # binds query + mapper -> presenter props
      mappers/
        mapRegimeSnapshotToHeroVm.ts
      contracts/
        regimeHeroVm.ts
    drivers/
    alerts/
    playbook/
    shared/
      components/
        DataStateBoundary.tsx       # standard loading/empty/error wrapper
      hooks/
        useSignalCompassQuery.ts
      mappers/
        freshnessLabel.ts
  lib/signal-compass/
    api/
      signalCompassClient.ts        # thin HTTP wrapper (no UI logic)
      endpoints.ts
    contracts/
      generated.ts                  # OpenAPI-generated types
      guards.ts                     # zod runtime schemas
    fixtures/
      current.fixture.json
      history.fixture.json
      drivers.fixture.json
      alerts.fixture.json
      playbook.fixture.json
```

## SOLID Enforcement Map
- **SRP:** Presenters only render. Containers only orchestrate data and mapping.
- **OCP:** Add new cards by adding feature module + mapper, not editing shared core.
- **LSP:** Any data source (mock/live) must satisfy guard-validated DTO contracts.
- **ISP:** Keep ports narrow:
  - `RegimeReadClient` for regime endpoints only
  - `AlertsReadClient` for alerts only
- **DIP:** Containers depend on client interfaces and mappers, not fetch implementation details.

## Data Flow Contract (UI)
1. Container calls client endpoint.
2. Raw payload validated by `guards.ts`.
3. DTO transformed by feature mapper into `*Vm` shape.
4. Presenter renders VM only.
5. `DataStateBoundary` normalizes loading/error/empty/stale rendering.

## Runtime Guard Strategy
- Validate every network boundary with strict schemas.
- Reject unknown enum values with explicit fallback to `UNKNOWN` display state.
- Parse/validate `asOf` + freshness windows; emit `staleReason` for UI badges.
- Surface parse failures to observability (`signal_compass_contract_parse_error`).

## Testing Plan (Frontend)

### Unit
- Mappers: DTO -> VM conversions, including stale/missing fields.
- Freshness labels and confidence badge helpers.
- Guard parsing behavior for valid/invalid payloads.

### Integration (React Testing Library)
- Container + presenter handshake for each primary card.
- Error and empty states for each endpoint.
- Stale-data fallback rendering on degraded freshness.

### Contract Smoke
- Fixture validation test that all fixtures pass runtime guards.
- Snapshot tests for key VM outputs for deterministic rendering.

## Micro-Iteration Plan (Next 3 Cycles)

### Cycle A (Now)
- Add generated type pipeline + guard scaffold.
- Commit baseline fixtures matching contract `1.1.0-hour1`.

### Cycle B
- Implement `RegimeHeroContainer` + `RegimeHeroCard` with DataStateBoundary.
- Render confidence + freshness trust cues.

### Cycle C
- Add drivers + alerts slices with shared boundary patterns.
- Connect mock/live switch via environment flag.

## PR Gate Additions
- Every new feature module must include:
  - `contracts/*Vm.ts`
  - `mappers/*`
  - unit tests for mapping + stale state
- No component may import raw OpenAPI DTOs directly (must use VM contract).
- No `fetch` calls inside presentational components.

## Definition of Done (Frontend Slice)
- Feature route renders with loading/error/empty/stale support.
- Mapper + guard tests pass.
- A11y basics pass (landmarks, heading order, keyboard reachability).
- Contract and changelog docs updated if schema changes were needed.
