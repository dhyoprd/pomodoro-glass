# Loose — PRD V1

## 1) Product Overview
**Product Name:** Loose  
**Category:** Productivity app (students + workers)  
**Positioning:** A focused productivity system that combines deep work timers, task execution, progress analytics, gamification, and behavior-aware reminders.

## 2) Problem
Students and workers struggle with:
- fragmented tools (timer app, to-do app, notes, reminders all separate)
- weak consistency loops (no compelling motivation to return daily)
- low visibility on focus patterns and actual progress

## 3) Goals (V1)
1. Increase daily active focus behavior.
2. Improve retention with healthy gamification and reminders.
3. Deliver a premium, modern startup-grade experience.
4. Keep performance high while architecture remains SOLID and scalable to native mobile.

## 4) Target Users
### Primary
- University students managing classes, assignments, exam prep.
- Knowledge workers managing deep work, meetings, and execution blocks.

### Secondary
- Freelancers and creators who need structured output sessions.

## 5) Success Metrics
- D1/D7 retention
- Average daily focus sessions per active user
- Weekly streak continuation rate
- Reminder open/return rate
- Task completion rate

## 6) Scope — V1 Features
## 6.1 Core Productivity
- Focus timer with modes: Focus / Short Break / Long Break
- Configurable durations + configurable long-break cadence
- Start/pause/reset + keyboard shortcuts
- Task list (add/toggle/delete)
- Session history and analytics (today stats, 7-day trend, streaks)

## 6.2 Gamification
- XP and level progression
- Daily quests (e.g., complete 4 focus sessions)
- Streak milestones and badges
- Reward loop for consistency (cosmetic unlocks / themes)

## 6.3 Notifications (Hook System)
- Personalized reminder windows (rule-based in V1)
- Streak-at-risk nudges
- Milestone celebration notifications
- Re-engagement reminders after inactivity

## 6.4 Landing Page (Modern Startup)
- Conversion-first narrative
- Social proof/testimonials section
- Feature highlights and use-case sections
- CTA for web app + waitlist/download path for mobile

## 7) Use Cases (docs-first requirement)
Each new feature must include explicit use cases before implementation.

### UC-01: Start Focus Session
- **Actor:** User
- **Goal:** Begin focused work instantly
- **Flow:** Select mode → press Start → timer runs → completion event
- **Edge cases:** tab inactive, page reload, notification permission denied

### UC-02: Configure Long Break Cadence
- **Actor:** User
- **Goal:** Match break rhythm to personal style
- **Flow:** Open settings → set `Long Break Every` → save → cadence applied
- **Validation:** 2–8 sessions

### UC-03: Recover Consistency via Nudges
- **Actor:** Returning inactive user
- **Goal:** Resume productive habit
- **Flow:** Receive reminder → open app → complete 1+ session → streak continues/restarts

### UC-04: Complete Daily Quest
- **Actor:** User
- **Goal:** Earn reward and maintain motivation
- **Flow:** Complete quest criteria → reward granted → progress updated

## 8) Architecture Direction
- **Web:** Next.js (App Router) + TypeScript
- **Backend:** Go
- **Mobile:** Kotlin (Android), Swift (iOS)
- **Design principle:** SOLID with layered modules
  - domain, application, repositories, services, UI

### Cross-platform strategy
- Shared domain contracts + API spec
- Native UI per platform
- Consistent behavior via backend contracts, not duplicated business logic drift

## 9) API/Backend V1 (Go)
- Auth/session endpoints
- Timer/session history sync endpoints
- Task CRUD endpoints
- Gamification endpoints (xp, levels, quests, streak)
- Notification preference + scheduling endpoints

## 10) Non-Goals (V1)
- Full team collaboration workspace
- Marketplace/plugins
- Heavy ML personalization in first release (rule-based first)

## 11) Milestones
1. **M1:** Core + analytics stable on web
2. **M2:** Gamification + hook notifications on web
3. **M3:** Go backend + account sync
4. **M4:** Native mobile clients (Kotlin/Swift) consuming same backend contracts
5. **M5:** Landing page polish + launch prep

## 12) Risks & Mitigations
- **Over-scope risk:** enforce use-case-first and milestone gates
- **Performance regression:** keep checks on bundle/perf budgets
- **Notification fatigue:** frequency caps and user control settings
- **Cross-platform drift:** strict API contracts + shared product acceptance criteria

---
Owner: dhyo + Tobi  
Status: Draft V1 (active, evolving)
