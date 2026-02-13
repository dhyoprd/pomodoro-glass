# ✨ Pomodoro Glass (Next.js App Router)

Pomodoro Glass has been migrated from static modular JavaScript to a **Next.js foundation** using the **App Router** while preserving the original layered architecture and core feature set.

## ✅ What’s preserved

- Focus / Short Break / Long Break modes
- Start / Pause / Reset timer controls
- Progress bar + dynamic document title timer
- Completed sessions + all-time focus minutes
- Session analytics (today, streak, last 7 day bars)
- Task list (add / done / delete)
- Browser notifications on session completion
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
  constants/
    index.ts
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
