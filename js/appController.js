import { MODES } from './constants.js';
import { Timer } from './domain/timer.js';

export class AppController {
  constructor({ ui, statsRepo, tasksRepo, notify }) {
    this.ui = ui;
    this.statsRepo = statsRepo;
    this.tasksRepo = tasksRepo;
    this.notify = notify;

    this.mode = 'focus';
    this.stats = this.statsRepo.load();
    this.tasks = this.tasksRepo.load();

    this.timer = new Timer({
      onTick: () => this.render(),
      onComplete: () => this.handleComplete(),
    });
    this.timer.setDuration(MODES[this.mode]);
  }

  initialize() {
    this.render();
  }

  setMode(mode) {
    this.mode = mode;
    this.timer.setDuration(MODES[mode]);
    this.render();
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
      this.stats.focusMinutes += Math.round(MODES.focus / 60);
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
