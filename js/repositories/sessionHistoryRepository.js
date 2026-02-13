export class SessionHistoryRepository {
  constructor(storage, key) {
    this.storage = storage;
    this.key = key;
  }

  load() {
    const raw = this.storage.getJson(this.key, []);
    if (!Array.isArray(raw)) return [];

    return raw
      .filter((entry) => entry && typeof entry.completedAt === 'string')
      .map((entry) => ({
        id: entry.id || crypto.randomUUID(),
        completedAt: entry.completedAt,
        focusMinutes: Number(entry.focusMinutes) || 0,
      }));
  }

  save(history) {
    this.storage.setJson(this.key, history);
  }
}
