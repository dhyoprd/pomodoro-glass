import { DEFAULT_SETTINGS_MINUTES } from '../constants.js';

export class SettingsRepository {
  constructor(storage, key) {
    this.storage = storage;
    this.key = key;
  }

  load() {
    const raw = this.storage.getJson(this.key, DEFAULT_SETTINGS_MINUTES);
    return {
      focus: Number(raw.focus) || DEFAULT_SETTINGS_MINUTES.focus,
      shortBreak: Number(raw.shortBreak) || DEFAULT_SETTINGS_MINUTES.shortBreak,
      longBreak: Number(raw.longBreak) || DEFAULT_SETTINGS_MINUTES.longBreak,
    };
  }

  save(settings) {
    this.storage.setJson(this.key, settings);
  }
}
