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
    settingsForm: document.getElementById('settingsForm'),
    resetSettingsBtn: document.getElementById('resetSettingsBtn'),
    settingsStatus: document.getElementById('settingsStatus'),
    focusMinutesInput: document.getElementById('focusMinutesInput'),
    shortBreakMinutesInput: document.getElementById('shortBreakMinutesInput'),
    longBreakMinutesInput: document.getElementById('longBreakMinutesInput'),
    modeButtons: Array.from(document.querySelectorAll('.mode')),
  };
}
