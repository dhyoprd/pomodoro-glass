import { clamp, formatTime } from '../utils.js';

export class UIRenderer {
  constructor(refs) {
    this.refs = refs;
  }

  renderTimer({ remaining, total, running }) {
    this.refs.timeDisplay.textContent = formatTime(remaining);
    const progress = ((total - remaining) / total) * 100;
    this.refs.progressBar.style.width = `${clamp(progress, 0, 100)}%`;
    this.refs.startPauseBtn.textContent = running ? 'Pause' : 'Start';
    document.title = `${formatTime(remaining)} • Pomodoro Glass`;
  }

  renderStats({ completed, focusMinutes }) {
    this.refs.completedCount.textContent = completed;
    this.refs.focusMinutes.textContent = focusMinutes;
  }

  renderAnalytics({ today, streak, week }) {
    this.refs.todaySessions.textContent = today.sessions;
    this.refs.todayMinutes.textContent = today.focusMinutes;
    this.refs.streakCurrent.textContent = `${streak.current}d`;
    this.refs.streakBest.textContent = `${streak.best}d`;

    this.refs.weekBars.innerHTML = '';
    const maxSessions = Math.max(...week.map((day) => day.sessions), 1);

    week.forEach((day) => {
      const item = document.createElement('div');
      item.className = 'week-bar-item';

      const bar = document.createElement('div');
      bar.className = 'week-bar-fill';
      bar.style.height = `${Math.max((day.sessions / maxSessions) * 100, day.sessions ? 12 : 4)}%`;
      bar.title = `${day.day}: ${day.sessions} sessions (${day.focusMinutes}m)`;

      const label = document.createElement('span');
      label.className = 'week-bar-label';
      label.textContent = day.day;

      item.append(bar, label);
      this.refs.weekBars.appendChild(item);
    });
  }

  renderModes(activeMode) {
    this.refs.modeButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mode === activeMode);
    });
  }

  renderSettings(settings) {
    this.refs.focusMinutesInput.value = settings.focus;
    this.refs.shortBreakMinutesInput.value = settings.shortBreak;
    this.refs.longBreakMinutesInput.value = settings.longBreak;
  }

  clearSettingsValidation() {
    [
      this.refs.focusMinutesInput,
      this.refs.shortBreakMinutesInput,
      this.refs.longBreakMinutesInput,
    ].forEach((input) => input.classList.remove('invalid'));
  }

  renderSettingsValidation(result) {
    this.clearSettingsValidation();

    if (result.ok) {
      this.refs.settingsStatus.textContent = result.message || 'Settings saved.';
      this.refs.settingsStatus.classList.remove('error');
      this.refs.settingsStatus.classList.add('success');
      return;
    }

    this.refs.settingsStatus.textContent = result.error;
    this.refs.settingsStatus.classList.remove('success');
    this.refs.settingsStatus.classList.add('error');

    if (result.field === 'focus') this.refs.focusMinutesInput.classList.add('invalid');
    if (result.field === 'shortBreak') this.refs.shortBreakMinutesInput.classList.add('invalid');
    if (result.field === 'longBreak') this.refs.longBreakMinutesInput.classList.add('invalid');
  }

  renderTasks(tasks, { onToggle, onDelete }) {
    this.refs.taskList.innerHTML = '';

    if (!tasks.length) {
      const li = document.createElement('li');
      li.innerHTML = '<span>No tasks yet. Add one above ✨</span>';
      this.refs.taskList.appendChild(li);
      return;
    }

    tasks.forEach((task) => {
      const li = document.createElement('li');
      if (task.done) li.classList.add('done');

      const text = document.createElement('span');
      text.textContent = task.text;

      const actions = document.createElement('div');
      actions.className = 'task-actions';

      const doneBtn = document.createElement('button');
      doneBtn.textContent = task.done ? 'Undo' : 'Done';
      doneBtn.onclick = () => onToggle(task.id);

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.onclick = () => onDelete(task.id);

      actions.append(doneBtn, delBtn);
      li.append(text, actions);
      this.refs.taskList.appendChild(li);
    });
  }
}
