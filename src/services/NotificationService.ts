export class NotificationService {
  async init() {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  notify(message: string) {
    if (typeof window === 'undefined') return;
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(message);
    }
  }
}

