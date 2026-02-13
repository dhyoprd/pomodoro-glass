export class Timer {
  constructor({ onTick, onComplete }) {
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.remaining = 0;
    this.total = 0;
    this.interval = null;
    this.running = false;
  }

  setDuration(seconds) {
    this.total = seconds;
    this.remaining = seconds;
    this.pause();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.interval = setInterval(() => {
      this.remaining -= 1;
      this.onTick(this.remaining, this.total);
      if (this.remaining <= 0) {
        this.pause();
        this.onComplete();
      }
    }, 1000);
  }

  pause() {
    this.running = false;
    clearInterval(this.interval);
    this.interval = null;
  }

  reset() {
    this.remaining = this.total;
    this.pause();
    this.onTick(this.remaining, this.total);
  }
}
