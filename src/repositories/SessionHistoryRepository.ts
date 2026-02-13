import type { SessionHistoryEntry } from '@/constants';
import { StorageService } from '@/services/StorageService';

export class SessionHistoryRepository {
  constructor(
    private storage: StorageService,
    private key: string,
  ) {}

  load(): SessionHistoryEntry[] {
    const raw = this.storage.getJson<SessionHistoryEntry[]>(this.key, []);
    if (!Array.isArray(raw)) return [];

    return raw
      .filter((entry) => entry && typeof entry.completedAt === 'string')
      .map((entry) => ({
        id: entry.id || crypto.randomUUID(),
        completedAt: entry.completedAt,
        focusMinutes: Number(entry.focusMinutes) || 0,
      }));
  }

  save(history: SessionHistoryEntry[]) {
    this.storage.setJson(this.key, history);
  }
}

