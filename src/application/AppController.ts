import {
  DEFAULT_SETTINGS_MINUTES,
  type Mode,
  type SessionHistoryEntry,
  type Stats,
  type Task,
  type TimerSettings,
} from '@/constants';
import { Timer } from '@/domain/Timer';
import { SessionHistoryRepository } from '@/repositories/SessionHistoryRepository';
import { SettingsRepository } from '@/repositories/SettingsRepository';
import { StatsRepository } from '@/repositories/StatsRepository';
import { TasksRepository } from '@/repositories/TasksRepository';
import { AnalyticsService, type Analytics } from '@/services/AnalyticsService';
import { NotificationService } from '@/services/NotificationService';

export type ValidationResult =
  | { ok: true; message?: string }
  | { ok: false; field: keyof TimerSettings; error: string };

export type AppState = {
  mode: Mode;
  settings: TimerSettings;
  stats: Stats;
  tasks: Task[];
  timer: { remaining: number; total: number; running: boolean };
  analytics: Analytics;
  settingsStatus?: { kind: 'success' | 'error'; message: string };
};

export class AppController {
  private mode: Mode = 'focus';
  private stats: Stats;
  private tasks: Task[];
  private settings: TimerSettings;
  private sessionHistory: SessionHistoryEntry[];
  private timer: Timer;

  constructor(
    private deps: {
      statsRepo: StatsRepository;
      tasksRepo: TasksRepository;
      settingsRepo: SettingsRepository;
      sessionHistoryRepo: SessionHistoryRepository;
      analyticsService: AnalyticsService;
      notify: NotificationService;
      onState: (state: AppState) => void;
    },
  ) {
    this.stats = deps.statsRepo.load();
    this.tasks = deps.tasksRepo.load();
    this.settings = deps.settingsRepo.load();
    this.sessionHistory = deps.sessionHistoryRepo.load();

    this.timer = new Timer({
      onTick: () => this.emit(),
      onComplete: () => this.handleComplete(),
    });
    this.timer.setDuration(this.getModeDurationSeconds(this.mode));
  }

  async initialize() {
    await this.deps.notify.init();
    this.emit();
  }

  dispose() {
    this.timer.dispose();
  }

  setMode(mode: Mode) {
    this.mode = mode;
    this.timer.setDuration(this.getModeDurationSeconds(mode));
    this.emit();
  }

  toggleTimer() {
    if (this.timer.running) this.timer.pause();
    else this.timer.start();
    this.emit();
  }

  resetTimer() {
    this.timer.reset();
    this.emit();
  }

  addTask(text: string) {
    this.tasks.unshift({ id: crypto.randomUUID(), text, done: false });
    this.deps.tasksRepo.save(this.tasks);
    this.emit();
  }

  toggleTask(taskId: string) {
    this.tasks = this.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
    this.deps.tasksRepo.save(this.tasks);
    this.emit();
  }

  deleteTask(taskId: string) {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.deps.tasksRepo.save(this.tasks);
    this.emit();
  }

  updateSettings(nextSettingsMinutes: Partial<Record<keyof TimerSettings, string | number>>) {
    const validated = this.validateSettings(nextSettingsMinutes);
    if (!validated.ok) {
      this.emit({ kind: 'error', message: validated.error });
      return validated;
    }

    this.settings = validated.value;
    this.deps.settingsRepo.save(this.settings);
    this.setMode(this.mode);
    this.emit({ kind: 'success', message: 'Settings saved.' });
    return { ok: true, message: 'Settings saved.' } as const;
  }

  resetSettingsToDefaults() {
    this.settings = { ...DEFAULT_SETTINGS_MINUTES };
    this.deps.settingsRepo.save(this.settings);
    this.setMode(this.mode);
    this.emit({ kind: 'success', message: 'Default settings restored.' });
    return { ok: true, message: 'Default settings restored.' } as const;
  }

  private handleComplete() {
    if (this.mode === 'focus') {
      this.stats.completed += 1;
      this.stats.focusMinutes += this.settings.focus;
      this.deps.statsRepo.save(this.stats);

      this.sessionHistory.unshift({
        id: crypto.randomUUID(),
        completedAt: new Date().toISOString(),
        focusMinutes: this.settings.focus,
      });
      this.sessionHistory = this.sessionHistory.slice(0, 365);
      this.deps.sessionHistoryRepo.save(this.sessionHistory);

      this.deps.notify.notify('Focus done. Break time 🧘');
      const nextMode: Mode = this.stats.completed % this.settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      this.setMode(nextMode);
      return;
    }

    this.deps.notify.notify('Break over. Back to focus 💪');
    this.setMode('focus');
  }

  private emit(settingsStatus?: AppState['settingsStatus']) {
    this.deps.onState({
      mode: this.mode,
      settings: this.settings,
      stats: this.stats,
      tasks: this.tasks,
      timer: {
        remaining: this.timer.remaining,
        total: this.timer.total,
        running: this.timer.running,
      },
      analytics: this.deps.analyticsService.build(this.sessionHistory),
      settingsStatus,
    });
  }

  private getModeDurationSeconds(mode: Mode) {
    return this.settings[mode] * 60;
  }

  private validateSettings(raw: Partial<Record<keyof TimerSettings, string | number>>) {
    const next: TimerSettings = {
      focus: Number(raw.focus),
      shortBreak: Number(raw.shortBreak),
      longBreak: Number(raw.longBreak),
      longBreakInterval: Number(raw.longBreakInterval),
    };

    if (!Number.isFinite(next.focus) || next.focus < 10 || next.focus > 90) {
      return { ok: false as const, field: 'focus' as const, error: 'Focus must be between 10 and 90 minutes.' };
    }

    if (!Number.isFinite(next.shortBreak) || next.shortBreak < 1 || next.shortBreak > 30) {
      return {
        ok: false as const,
        field: 'shortBreak' as const,
        error: 'Short break must be between 1 and 30 minutes.',
      };
    }

    if (!Number.isFinite(next.longBreak) || next.longBreak < 5 || next.longBreak > 60) {
      return { ok: false as const, field: 'longBreak' as const, error: 'Long break must be between 5 and 60 minutes.' };
    }

    if (!Number.isFinite(next.longBreakInterval) || next.longBreakInterval < 2 || next.longBreakInterval > 8) {
      return {
        ok: false as const,
        field: 'longBreakInterval' as const,
        error: 'Long break interval must be between 2 and 8 focus sessions.',
      };
    }

    return { ok: true as const, value: next };
  }
}

