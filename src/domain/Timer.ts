export class Timer {
  private onTick: (remaining: number, total: number) => void;
  private onComplete: () => void;

  remaining = 0;
  total = 0;
  running = false;

  private interval: ReturnType<typeof setInterval> | null = null;
  private targetEndMs: number | null = null;

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
    this.targetEndMs = null;
    this.pause();
  }

  start() {
    if (this.running || this.remaining <= 0) return;

    this.running = true;
    this.targetEndMs = Date.now() + this.remaining * 1000;

    this.interval = setInterval(() => {
      if (!this.targetEndMs) return;

      const nextRemaining = Math.max(0, Math.ceil((this.targetEndMs - Date.now()) / 1000));

      if (nextRemaining !== this.remaining) {
        this.remaining = nextRemaining;
        this.onTick(this.remaining, this.total);
      }

      if (this.remaining <= 0) {
        this.pause();
        this.onComplete();
      }
    }, 250);
  }

  pause() {
    this.running = false;
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
    this.targetEndMs = null;
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
