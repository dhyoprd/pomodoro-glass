export const DEFAULT_SETTINGS_MINUTES = Object.freeze({
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
});

export const STORAGE_KEYS = Object.freeze({
  completed: 'pomodoro.completed',
  focusMinutes: 'pomodoro.focusMinutes',
  tasks: 'pomodoro.tasks',
  settings: 'pomodoro.settings',
  sessionHistory: 'pomodoro.sessionHistory',
});

export type Mode = 'focus' | 'shortBreak' | 'longBreak';

export type TimerSettings = {
  focus: number;
  shortBreak: number;
  longBreak: number;
};

export type Task = {
  id: string;
  text: string;
  done: boolean;
};

export type SessionHistoryEntry = {
  id: string;
  completedAt: string;
  focusMinutes: number;
};

export type Stats = {
  completed: number;
  focusMinutes: number;
};

