import type { Task } from '@/constants';
import { StorageService } from '@/services/StorageService';

export class TasksRepository {
  constructor(
    private storage: StorageService,
    private key: string,
  ) {}

  load(): Task[] {
    return this.storage.getJson<Task[]>(this.key, []);
  }

  save(tasks: Task[]) {
    this.storage.setJson(this.key, tasks);
  }
}

