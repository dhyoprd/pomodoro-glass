export class StatsRepository {
  constructor(storage, keys) {
    this.storage = storage;
    this.keys = keys;
  }

  load() {
    return {
      completed: this.storage.getNumber(this.keys.completed, 0),
      focusMinutes: this.storage.getNumber(this.keys.focusMinutes, 0),
    };
  }

  save(stats) {
    this.storage.set(this.keys.completed, stats.completed);
    this.storage.set(this.keys.focusMinutes, stats.focusMinutes);
  }
}
