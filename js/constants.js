export const MODES = Object.freeze({
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
});

export const STORAGE_KEYS = Object.freeze({
  completed: 'pomodoro.completed',
  focusMinutes: 'pomodoro.focusMinutes',
  tasks: 'pomodoro.tasks',
});
