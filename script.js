const MODES = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const state = {
  mode: 'focus',
  remaining: MODES.focus,
  total: MODES.focus,
  running: false,
  completed: Number(localStorage.getItem('pomodoro.completed') || 0),
  focusMinutes: Number(localStorage.getItem('pomodoro.focusMinutes') || 0),
  tasks: JSON.parse(localStorage.getItem('pomodoro.tasks') || '[]'),
};

const timeDisplay = document.getElementById('timeDisplay');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');
const progressBar = document.getElementById('progressBar');
const completedCount = document.getElementById('completedCount');
const focusMinutes = document.getElementById('focusMinutes');
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');

let timer = null;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function saveStats() {
  localStorage.setItem('pomodoro.completed', String(state.completed));
  localStorage.setItem('pomodoro.focusMinutes', String(state.focusMinutes));
}

function saveTasks() {
  localStorage.setItem('pomodoro.tasks', JSON.stringify(state.tasks));
}

function setMode(mode) {
  state.mode = mode;
  state.total = MODES[mode];
  state.remaining = MODES[mode];
  state.running = false;
  clearInterval(timer);
  timer = null;
  document.querySelectorAll('.mode').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  startPauseBtn.textContent = 'Start';
  render();
}

function onComplete() {
  if (state.mode === 'focus') {
    state.completed += 1;
    state.focusMinutes += Math.round(MODES.focus / 60);
    saveStats();
  }

  if (Notification.permission === 'granted') {
    new Notification(state.mode === 'focus' ? 'Focus done. Break time 🌿' : 'Break over. Back to focus ⚡');
  }

  const nextMode = state.mode === 'focus' ? (state.completed % 4 === 0 ? 'longBreak' : 'shortBreak') : 'focus';
  setMode(nextMode);
}

function tick() {
  state.remaining -= 1;
  if (state.remaining <= 0) {
    onComplete();
  }
  render();
}

function toggleTimer() {
  if (state.running) {
    state.running = false;
    clearInterval(timer);
    timer = null;
    startPauseBtn.textContent = 'Start';
  } else {
    state.running = true;
    timer = setInterval(tick, 1000);
    startPauseBtn.textContent = 'Pause';
  }
}

function resetTimer() {
  state.remaining = state.total;
  state.running = false;
  clearInterval(timer);
  timer = null;
  startPauseBtn.textContent = 'Start';
  render();
}

function renderTasks() {
  taskList.innerHTML = '';

  if (!state.tasks.length) {
    const li = document.createElement('li');
    li.innerHTML = '<span>No tasks yet. Add one above ✨</span>';
    taskList.appendChild(li);
    return;
  }

  state.tasks.forEach((task) => {
    const li = document.createElement('li');
    if (task.done) li.classList.add('done');

    const text = document.createElement('span');
    text.textContent = task.text;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const doneBtn = document.createElement('button');
    doneBtn.textContent = task.done ? 'Undo' : 'Done';
    doneBtn.onclick = () => {
      task.done = !task.done;
      saveTasks();
      renderTasks();
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => {
      state.tasks = state.tasks.filter((t) => t.id !== task.id);
      saveTasks();
      renderTasks();
    };

    actions.append(doneBtn, delBtn);
    li.append(text, actions);
    taskList.appendChild(li);
  });
}

function render() {
  timeDisplay.textContent = formatTime(state.remaining);
  completedCount.textContent = state.completed;
  focusMinutes.textContent = state.focusMinutes;
  const progress = ((state.total - state.remaining) / state.total) * 100;
  progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
  document.title = `${formatTime(state.remaining)} • Pomodoro Glass`;
}

document.querySelectorAll('.mode').forEach((btn) => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

startPauseBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  state.tasks.unshift({ id: crypto.randomUUID(), text, done: false });
  taskInput.value = '';
  saveTasks();
  renderTasks();
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && document.activeElement !== taskInput) {
    e.preventDefault();
    toggleTimer();
  }
  if (e.key.toLowerCase() === 'r') {
    resetTimer();
  }
});

if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

render();
renderTasks();
