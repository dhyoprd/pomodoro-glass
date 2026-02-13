export function getDomRefs() {
  return {
    timeDisplay: document.getElementById('timeDisplay'),
    startPauseBtn: document.getElementById('startPauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    progressBar: document.getElementById('progressBar'),
    completedCount: document.getElementById('completedCount'),
    focusMinutes: document.getElementById('focusMinutes'),
    taskForm: document.getElementById('taskForm'),
    taskInput: document.getElementById('taskInput'),
    taskList: document.getElementById('taskList'),
    modeButtons: Array.from(document.querySelectorAll('.mode')),
  };
}
