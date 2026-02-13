export class TasksRepository {
  constructor(storage, key) {
    this.storage = storage;
    this.key = key;
  }

  load() {
    return this.storage.getJson(this.key, []);
  }

  save(tasks) {
    this.storage.setJson(this.key, tasks);
  }
}
