export class NotificationService {
  async init() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  notify(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(message);
    }
  }
}
