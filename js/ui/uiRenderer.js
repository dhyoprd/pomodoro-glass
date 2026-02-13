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
