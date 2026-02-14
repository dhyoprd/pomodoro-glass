# Signal Compass — SOLID Rules (Non-Negotiable)

## Purpose
These rules prevent architectural drift and keep the codebase maintainable as complexity grows.

## S — Single Responsibility Principle
- Each module has one reason to change.
- UI components render + handle interaction only.
- Scoring logic stays in domain/application services.
- Data-fetch and persistence logic stays in infrastructure adapters.

## O — Open/Closed Principle
- Add new signal types or scoring policies by extension, not by rewriting core services.
- Use strategy/policy interfaces for scoring and alert logic.
- Avoid giant conditional blocks for feature variation.

## L — Liskov Substitution Principle
- Implementations of shared interfaces must preserve expected behavior.
- Any adapter replacement (e.g., feed provider swap) should not break callers.
- Preserve output contracts and error semantics.

## I — Interface Segregation Principle
- Keep interfaces small and role-focused.
- Example: split `SignalFeedPort` from `SnapshotRepositoryPort` and `AlertDispatchPort`.
- Do not force a class to depend on methods it doesn’t use.

## D — Dependency Inversion Principle
- High-level modules depend on abstractions, not concrete providers.
- Inject adapters into use-cases/services via interfaces.
- No direct infra calls from UI layer.

---

## Layer Boundaries

### 1) Presentation (`apps/web`)
Allowed:
- read view-models
- dispatch use-case calls
- local UI state

Forbidden:
- scoring calculations
- direct external API/provider logic
- direct database assumptions

### 2) Application (`internal/app` / use-cases)
Allowed:
- orchestration
- transaction boundaries
- invoking domain policies and ports

Forbidden:
- UI rendering logic
- hard-coded provider details

### 3) Domain (`internal/domain`)
Allowed:
- business invariants
- scoring rules
- alert criteria

Forbidden:
- framework-specific code
- HTTP or persistence implementation details

### 4) Infrastructure (`internal/infra`)
Allowed:
- API clients
- DB repositories
- queue/scheduler adapters

Forbidden:
- owning business rules

---

## PR Review Checklist (SOLID Gate)
- [ ] Does this PR add business logic in UI? If yes, reject.
- [ ] Are new behaviors introduced via interfaces/policies where appropriate?
- [ ] Are abstractions stable and minimal?
- [ ] Are dependencies pointing inward (toward domain) rather than outward?
- [ ] Is test coverage added for changed domain/app logic?

## Naming Conventions
- `*Port` for interfaces crossing boundaries
- `*Service` for domain/application logic
- `*Adapter` for infra implementations
- `*UseCase` for orchestration actions

## Anti-Patterns to Reject
- God-components with rendering + scoring + API calls
- Shared util dumping-ground without domain ownership
- Feature flags with branching spread across layers
- Duplicate scoring formulas in multiple files

## Rule of Thumb
If a change affects “how we decide,” it belongs in domain/application, not UI.
