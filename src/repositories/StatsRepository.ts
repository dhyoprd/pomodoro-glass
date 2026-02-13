import type { Stats } from '@/constants';
import { StorageService } from '@/services/StorageService';

export class StatsRepository {
  constructor(
    private storage: StorageService,
    private keys: { completed: string; focusMinutes: string },
  ) {}

  load(): Stats {
    return {
      completed: this.storage.getNumber(this.keys.completed, 0),
      focusMinutes: this.storage.getNumber(this.keys.focusMinutes, 0),
    };
  }

  save(stats: Stats) {
    this.storage.set(this.keys.completed, stats.completed);
    this.storage.set(this.keys.focusMinutes, stats.focusMinutes);
  }
}

