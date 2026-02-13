export class StorageService {
  private canUseStorage() {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  getNumber(key: string, fallback = 0) {
    if (!this.canUseStorage()) return fallback;
    return Number(window.localStorage.getItem(key) || fallback);
  }

  getJson<T>(key: string, fallback: T): T {
    if (!this.canUseStorage()) return fallback;
    try {
      return JSON.parse(window.localStorage.getItem(key) || JSON.stringify(fallback)) as T;
    } catch {
      return fallback;
    }
  }

  set(key: string, value: number | string) {
    if (!this.canUseStorage()) return;
    window.localStorage.setItem(key, String(value));
  }

  setJson<T>(key: string, value: T) {
    if (!this.canUseStorage()) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

