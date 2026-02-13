'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppController, type AppState } from '@/application/AppController';
import { DEFAULT_SETTINGS_MINUTES, STORAGE_KEYS } from '@/constants';
import { SessionHistoryRepository } from '@/repositories/SessionHistoryRepository';
import { SettingsRepository } from '@/repositories/SettingsRepository';
import { StatsRepository } from '@/repositories/StatsRepository';
import { TasksRepository } from '@/repositories/TasksRepository';
import { AnalyticsService } from '@/services/AnalyticsService';
import { NotificationService } from '@/services/NotificationService';
import { StorageService } from '@/services/StorageService';

const initialState: AppState = {
  mode: 'focus',
  settings: DEFAULT_SETTINGS_MINUTES,
  stats: { completed: 0, focusMinutes: 0 },
  tasks: [],
  timer: { remaining: DEFAULT_SETTINGS_MINUTES.focus * 60, total: DEFAULT_SETTINGS_MINUTES.focus * 60, running: false },
  analytics: {
    today: { sessions: 0, focusMinutes: 0 },
    last7: { sessions: 0, focusMinutes: 0 },
    streak: { current: 0, best: 0 },
    week: Array.from({ length: 7 }, (_, i) => ({ day: `D${i + 1}`, sessions: 0, focusMinutes: 0 })),
  },
};

export function usePomodoroController() {
  const [state, setState] = useState<AppState>(initialState);

  const controller = useMemo(() => {
    const storage = new StorageService();
    const app = new AppController({
      statsRepo: new StatsRepository(storage, STORAGE_KEYS),
      tasksRepo: new TasksRepository(storage, STORAGE_KEYS.tasks),
      settingsRepo: new SettingsRepository(storage, STORAGE_KEYS.settings),
      sessionHistoryRepo: new SessionHistoryRepository(storage, STORAGE_KEYS.sessionHistory),
      analyticsService: new AnalyticsService(),
      notify: new NotificationService(),
      onState: setState,
    });

    return app;
  }, []);

  useEffect(() => {
    void controller.initialize();
    return () => controller.dispose();
  }, [controller]);

  return { state, controller };
}

