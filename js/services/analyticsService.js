const DAY_MS = 24 * 60 * 60 * 1000;

export class AnalyticsService {
  build(history, now = new Date()) {
    const sessions = history
      .map((entry) => ({
        completedAt: new Date(entry.completedAt),
        focusMinutes: Number(entry.focusMinutes) || 0,
      }))
      .filter((entry) => Number.isFinite(entry.completedAt.getTime()))
      .sort((a, b) => a.completedAt - b.completedAt);

    const dayKey = (date) => this.toLocalDayKey(date);
    const todayKey = dayKey(now);
    const sevenDayKeys = this.getRecentDayKeys(now, 7);

    const byDay = new Map();
    sessions.forEach((entry) => {
      const key = dayKey(entry.completedAt);
      const stat = byDay.get(key) || { sessions: 0, focusMinutes: 0 };
      stat.sessions += 1;
      stat.focusMinutes += entry.focusMinutes;
      byDay.set(key, stat);
    });

    const today = byDay.get(todayKey) || { sessions: 0, focusMinutes: 0 };

    const week = sevenDayKeys.map((key) => {
      const stat = byDay.get(key) || { sessions: 0, focusMinutes: 0 };
      return { day: key.slice(5), ...stat };
    });

    const last7 = week.reduce(
      (acc, day) => ({
        sessions: acc.sessions + day.sessions,
        focusMinutes: acc.focusMinutes + day.focusMinutes,
      }),
      { sessions: 0, focusMinutes: 0 },
    );

    const dayKeysWithSession = Array.from(byDay.keys()).sort();
    const streak = this.computeStreak(dayKeysWithSession, now);

    return {
      today,
      last7,
      streak,
      week,
    };
  }

  getRecentDayKeys(now, count) {
    return Array.from({ length: count }, (_, index) => {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      date.setTime(date.getTime() - (count - 1 - index) * DAY_MS);
      return date.toISOString().slice(0, 10);
    });
  }

  computeStreak(dayKeys, now) {
    if (!dayKeys.length) return { current: 0, best: 0 };

    const activeDays = new Set(dayKeys);
    let best = 0;
    let run = 0;
    let previous = null;

    dayKeys.forEach((key) => {
      const current = this.dayKeyToTime(key);
      if (previous !== null && current - previous === DAY_MS) run += 1;
      else run = 1;
      best = Math.max(best, run);
      previous = current;
    });

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    let current = 0;
    let cursor = today.getTime();

    while (activeDays.has(this.toLocalDayKey(new Date(cursor)))) {
      current += 1;
      cursor -= DAY_MS;
    }

    return { current, best };
  }

  toLocalDayKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  dayKeyToTime(key) {
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day).getTime();
  }
}
