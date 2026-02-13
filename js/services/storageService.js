export class StorageService {
  getNumber(key, fallback = 0) {
    return Number(localStorage.getItem(key) || fallback);
  }

  getJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  }

  set(key, value) {
    localStorage.setItem(key, String(value));
  }

  setJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
