# Use-Case-First Playbook (Loose V1)

Loose should feel outcome-driven before it feels configurable.

## Core principle

People do not open a timer app for a timer. They open it to achieve an outcome:
- pass an exam week
- ship a feature
- rebuild momentum after a low-energy day
- convert commute pockets into meaningful progress

So V1 prioritizes **Outcome → Rhythm → Execution**.

## Current mapping

### Outcome blueprints
1. **Exam Week Coverage** → Student Revision preset (`25/5/15`, long break every 4)
2. **Ship a Feature Fast** → Deep Work Sprint preset (`50/10/20`, long break every 3)
3. **Recover Momentum** → High-Energy Loop preset (`15/3/10`, long break every 4)
4. **Make Commute Time Count** → Commute Micro-Sprints preset (`10/2/8`, long break every 5)

### Product behavior
- New users see quick onboarding with outcome cards first.
- Returning users can still use full preset/settings controls.
- Each blueprint can be applied and started in one tap.
- Session planner now recommends the best-fit preset for the user’s available deep-work window, with one-tap apply/start.
- Weekly momentum forecast translates a single daily plan into 5-day outcomes (focus hours, sessions, XP, level ETA) so users can choose rhythms by expected result.
- Blueprint quick-start links now carry context (`preset`, `minutes`, optional `task`) so users can share a ready-to-run focus setup that opens preconfigured on any device.
- Mobile users have an explicit commute blueprint optimized for short, interruption-prone windows.

## V1 guardrails

- Any new preset must declare:
  - clear user archetype
  - expected outcome
  - timer settings rationale
- Any new onboarding card must map to exactly one preset id.
- Keep copy outcome-focused (benefits) instead of parameter-focused (minutes only).

## Architecture notes

Use-case definitions live in `src/constants/useCases.ts` so UI sections (onboarding, blueprints, presets) share one source of truth.
