import { DEFAULT_SETTINGS_MINUTES, type TimerSettings } from '@/constants';
import { StorageService } from '@/services/StorageService';

export class SettingsRepository {
  constructor(
    private storage: StorageService,
    private key: string,
  ) {}

  load(): TimerSettings {
    const raw = this.storage.getJson<TimerSettings>(this.key, DEFAULT_SETTINGS_MINUTES);
    return {
      focus: Number(raw.focus) || DEFAULT_SETTINGS_MINUTES.focus,
      shortBreak: Number(raw.shortBreak) || DEFAULT_SETTINGS_MINUTES.shortBreak,
      longBreak: Number(raw.longBreak) || DEFAULT_SETTINGS_MINUTES.longBreak,
      longBreakInterval: Number(raw.longBreakInterval) || DEFAULT_SETTINGS_MINUTES.longBreakInterval,
    };
  }

  save(settings: TimerSettings) {
    this.storage.setJson(this.key, settings);
  }
}
