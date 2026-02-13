import { STORAGE_KEYS } from './constants.js';
import { AppController } from './appController.js';
import { SessionHistoryRepository } from './repositories/sessionHistoryRepository.js';
import { SettingsRepository } from './repositories/settingsRepository.js';
import { StatsRepository } from './repositories/statsRepository.js';
import { TasksRepository } from './repositories/tasksRepository.js';
import { AnalyticsService } from './services/analyticsService.js';
import { NotificationService } from './services/notificationService.js';
import { StorageService } from './services/storageService.js';
import { getDomRefs } from './ui/domRefs.js';
import { UIRenderer } from './ui/uiRenderer.js';

const refs = getDomRefs();
const storage = new StorageService();
const notify = new NotificationService();
const ui = new UIRenderer(refs);

const app = new AppController({
  ui,
  statsRepo: new StatsRepository(storage, STORAGE_KEYS),
  tasksRepo: new TasksRepository(storage, STORAGE_KEYS.tasks),
  settingsRepo: new SettingsRepository(storage, STORAGE_KEYS.settings),
  sessionHistoryRepo: new SessionHistoryRepository(storage, STORAGE_KEYS.sessionHistory),
  analyticsService: new AnalyticsService(),
  notify,
});

refs.modeButtons.forEach((btn) => btn.addEventListener('click', () => app.setMode(btn.dataset.mode)));
refs.startPauseBtn.addEventListener('click', () => app.toggleTimer());
refs.resetBtn.addEventListener('click', () => app.resetTimer());

refs.taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = refs.taskInput.value.trim();
  if (!text) return;
  app.addTask(text);
  refs.taskInput.value = '';
});

const collectSettingsInput = () => ({
  focus: refs.focusMinutesInput.value,
  shortBreak: refs.shortBreakMinutesInput.value,
  longBreak: refs.longBreakMinutesInput.value,
});

const applySettingsFromForm = () => {
  const result = app.updateSettings(collectSettingsInput());
  ui.renderSettingsValidation(result);
};

refs.settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  applySettingsFromForm();
});

[refs.focusMinutesInput, refs.shortBreakMinutesInput, refs.longBreakMinutesInput].forEach((input) => {
  input.addEventListener('change', applySettingsFromForm);
});

refs.resetSettingsBtn.addEventListener('click', () => {
  const result = app.resetSettingsToDefaults();
  ui.renderSettingsValidation(result);
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && document.activeElement !== refs.taskInput) {
    e.preventDefault();
    app.toggleTimer();
  }
  if (e.key.toLowerCase() === 'r') app.resetTimer();
});

notify.init();
app.initialize();
