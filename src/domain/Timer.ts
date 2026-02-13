export class Timer {
  private onTick: (remaining: number, total: number) => void;
  private onComplete: () => void;

  remaining = 0;
  total = 0;
  running = false;
  private interval: ReturnType<typeof setInterval> | null = null;

  constructor({
    onTick,
    onComplete,
  }: {
    onTick: (remaining: number, total: number) => void;
    onComplete: () => void;
  }) {
    this.onTick = onTick;
    this.onComplete = onComplete;
  }

  setDuration(seconds: number) {
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
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }

  reset() {
    this.remaining = this.total;
    this.pause();
    this.onTick(this.remaining, this.total);
  }

  dispose() {
    this.pause();
  }
}

