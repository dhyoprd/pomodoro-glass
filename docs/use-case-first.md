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
5. **Ship Between Meetings** → Meeting Buffer Flow preset (`20/5/12`, long break every 3)

### Product behavior
- New users see quick onboarding with outcome cards first.
- Returning users can still use full preset/settings controls.
- Each blueprint can be applied and started in one tap.
- Session planner now recommends the best-fit preset for the user’s available deep-work window, with one-tap apply/start.
- Matchmaker now includes one-tap persona cards (Deep Desk Shipper, Steady Consistency Builder, Commute Rescue Runner) so mobile and desk users can declare intent before tweaking raw fields.
- Startup-proof metrics strip communicates activation speed, weekly focus return, gamification loop, and mobile rescue readiness in one glance.
- Launch-path and planner recommendation cards now expose each preset’s "ideal for" chips so users pick by scenario (exam prep, writing drafts, transit, etc.) instead of only timer numbers.
- Launch-path cards now show XP/hour and focus-density deltas against the user’s current rhythm so switching presets is a measurable decision, not guesswork.
- Launch-path filters and cards now surface audience icon chips (desk, mobile/commute, momentum reset) to make the right path obvious on small screens before users inspect timer numbers.
- Every preset now declares a best-fit time budget window (for example `30-75 min commute pockets`), and that budget is surfaced in hero briefings, launch cards, and outcome blueprint cards so users choose by available time before touching timer settings.
- Weekly momentum forecast translates a single daily plan into 5-day outcomes (focus hours, sessions, XP, level ETA) so users can choose rhythms by expected result.
- Blueprint quick-start links now carry context (`preset`, `minutes`, optional `task`) so users can share a ready-to-run focus setup that opens preconfigured on any device.
- Mobile users have an explicit commute blueprint optimized for short, interruption-prone windows.
- Planner and share links now support 30–360 minute budgets (15-minute steps), so commute users can model realistic 30/45-minute focus windows instead of being forced into 60+ minute plans.
- Mobile quick bar includes a one-tap **Rescue** action that auto-runs the best momentum-recovery preset when the user needs to restart fast.
- Mobile install CTA now gracefully handles iOS Safari (`Add to Home`) instead of disabling install in browsers without `beforeinstallprompt`.
- PWA shortcuts now include a dedicated **Momentum Rescue** entry (high-energy autostart) plus source-tagged deep-work/commute/planner launches for cleaner attribution and faster one-tap re-entry.
- Hero proof KPIs now include a **Today plan progress** tile (`% complete` or `minutes remaining`) tied to planner-estimated focus minutes, so users see if they are on track before starting the next block.

## Decision matrix (V1)

| Situation | Best launch path | Why it wins | Mobile fit |
| --- | --- | --- | --- |
| 2-4h desk window, high clarity | Deep Work Sprint | Maximizes uninterrupted maker output per session | Medium |
| Exam prep / lecture backlog | Student Revision | Predictable recall loop without burnout | Medium |
| Low-energy / restart day | High-Energy Loop | Fast visible wins rebuild confidence quickly | High |
| Transit / waiting pockets | Commute Micro-Sprints | Designed for interruptions + short windows | Very high |
| Meeting-heavy calendar | Meeting Buffer Flow | Protects deliverables between calls | High |

## V1 acceptance checklist

A V1-ready use-case-first experience should satisfy all of the following:
- User can pick an outcome and start a fitting rhythm in **≤2 taps**.
- Every launch path card explains **who it is for**, not only timer numbers.
- Planner can model realistic windows from **30 to 360 minutes**.
- Mobile users can recover momentum from the command bar in one tap.
- Shared links preserve enough context (`preset`, `minutes`, optional `task`) to resume intent on another device.
- PWA install path includes practical affordances for both Android (`Install`) and iOS (`Add to Home Screen`).

## V1 guardrails

- Any new preset must declare:
  - clear user archetype
  - expected outcome
  - timer settings rationale
- Any new onboarding card must map to exactly one preset id.
- Keep copy outcome-focused (benefits) instead of parameter-focused (minutes only).

## Architecture notes

Use-case definitions live in `src/constants/useCases.ts` so UI sections (onboarding, blueprints, presets) share one source of truth.
