import { Timer } from './domain/timer.js';

export class AppController {
  constructor({ ui, statsRepo, tasksRepo, settingsRepo, notify }) {
    this.ui = ui;
    this.statsRepo = statsRepo;
    this.tasksRepo = tasksRepo;
    this.settingsRepo = settingsRepo;
    this.notify = notify;

    this.mode = 'focus';
    this.stats = this.statsRepo.load();
    this.tasks = this.tasksRepo.load();
    this.settings = this.settingsRepo.load();

    this.timer = new Timer({
      onTick: () => this.render(),
      onComplete: () => this.handleComplete(),
    });
    this.timer.setDuration(this.getModeDurationSeconds(this.mode));
  }

  initialize() {
    this.render();
    this.ui.renderSettings(this.settings);
  }

  getModeDurationSeconds(mode) {
    return this.settings[mode] * 60;
  }

  setMode(mode) {
    this.mode = mode;
    this.timer.setDuration(this.getModeDurationSeconds(mode));
    this.render();
  }

  updateSettings(nextSettingsMinutes) {
    const validated = this.validateSettings(nextSettingsMinutes);
    if (!validated.ok) return validated;

    this.settings = validated.value;
    this.settingsRepo.save(this.settings);
    this.setMode(this.mode);
    this.ui.renderSettings(this.settings);
    return { ok: true };
  }

  validateSettings(raw) {
    const next = {
      focus: Number(raw.focus),
      shortBreak: Number(raw.shortBreak),
      longBreak: Number(raw.longBreak),
    };

    if (!Number.isFinite(next.focus) || next.focus < 10 || next.focus > 90) {
      return { ok: false, error: 'Focus must be between 10 and 90 minutes.' };
    }

    if (!Number.isFinite(next.shortBreak) || next.shortBreak < 1 || next.shortBreak > 30) {
      return { ok: false, error: 'Short break must be between 1 and 30 minutes.' };
    }

    if (!Number.isFinite(next.longBreak) || next.longBreak < 5 || next.longBreak > 60) {
      return { ok: false, error: 'Long break must be between 5 and 60 minutes.' };
    }

    return { ok: true, value: next };
  }

  toggleTimer() {
    if (this.timer.running) this.timer.pause();
    else this.timer.start();
    this.render();
  }

  resetTimer() {
    this.timer.reset();
    this.render();
  }

  addTask(text) {
    this.tasks.unshift({ id: crypto.randomUUID(), text, done: false });
    this.tasksRepo.save(this.tasks);
    this.render();
  }

  toggleTask(taskId) {
    this.tasks = this.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
    this.tasksRepo.save(this.tasks);
    this.render();
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.tasksRepo.save(this.tasks);
    this.render();
  }

  handleComplete() {
    if (this.mode === 'focus') {
      this.stats.completed += 1;
      this.stats.focusMinutes += this.settings.focus;
      this.statsRepo.save(this.stats);
      this.notify.notify('Focus done. Break time 🌿');
      const nextMode = this.stats.completed % 4 === 0 ? 'longBreak' : 'shortBreak';
      this.setMode(nextMode);
      return;
    }

    this.notify.notify('Break over. Back to focus ⚡');
    this.setMode('focus');
  }

  render() {
    this.ui.renderModes(this.mode);
    this.ui.renderTimer({
      remaining: this.timer.remaining,
      total: this.timer.total,
      running: this.timer.running,
    });
    this.ui.renderStats(this.stats);
    this.ui.renderTasks(this.tasks, {
      onToggle: (id) => this.toggleTask(id),
      onDelete: (id) => this.deleteTask(id),
    });
  }
}
