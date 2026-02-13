# ✨ Loose (Next.js App Router)

Loose is a productivity app for students and workers, built on a **Next.js foundation** using the **App Router** while preserving layered SOLID-style architecture and core feature depth.

## ✅ What’s preserved

- Focus / Short Break / Long Break modes (with configurable long-break interval)
- Start / Pause / Reset timer controls
- Progress bar + dynamic document title timer
- Completed sessions + all-time focus minutes
- Session analytics (today, streak, last 7 day bars)
- Task list (add / done / delete)
- Browser notifications on session completion
- Use-case presets (Student Revision, Deep Work Sprint, High-Energy Loop, Commute Micro-Sprints, Meeting Buffer Flow)
- Preset fit tags + momentum tips to choose rhythms by real-world context
- Installable web-app metadata (manifest + brand icon + mobile theme color)
- Home-screen quick actions (Deep Work, Momentum Rescue, Commute, Planner) via manifest shortcuts + preset deep links
- Keyboard shortcuts:
  - `Space` → Start/Pause
  - `R` → Reset
- Local persistence with `localStorage`

## 🧱 Architecture (SOLID-leaning, layered)

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  application/
    AppController.ts          # orchestration / use-case layer
    SessionPlannerEngine.ts   # planner recommendation/ranking use-cases
  constants/
    index.ts
    useCases.ts              # presets + outcome blueprints source of truth
  domain/
    Timer.ts
  hooks/
    usePomodoroController.ts
  repositories/
    SettingsRepository.ts
    SessionHistoryRepository.ts
    StatsRepository.ts
    TasksRepository.ts
  services/
    AnalyticsService.ts
    NotificationService.ts
    StorageService.ts
  ui/
    PomodoroApp.tsx           # React UI rendering layer
```

## 🚀 Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 📚 Product docs

- [Use-Case-First Playbook](docs/use-case-first.md)

## 🧪 Quality checks

```bash
npm run lint
npm run typecheck
npm run build
npm run check
```

## 📝 Migration notes

- Legacy static files (`index.html`, `styles.css`, `js/`) are retained in repo for reference.
- New implementation is TypeScript-first and client-component driven where browser APIs are required.
- Persistence behavior intentionally keeps previous storage keys to preserve existing user data.
