import assert from 'node:assert/strict';
import { AnalyticsService } from '../js/services/analyticsService.js';

const analytics = new AnalyticsService();
const now = new Date('2026-02-13T12:00:00+08:00');

const history = [
  { completedAt: '2026-02-13T09:00:00+08:00', focusMinutes: 25 },
  { completedAt: '2026-02-12T11:00:00+08:00', focusMinutes: 30 },
  { completedAt: '2026-02-11T11:00:00+08:00', focusMinutes: 25 },
  { completedAt: '2026-02-09T11:00:00+08:00', focusMinutes: 25 },
];

const result = analytics.build(history, now);

assert.equal(result.today.sessions, 1);
assert.equal(result.today.focusMinutes, 25);
assert.equal(result.streak.current, 3);
assert.equal(result.streak.best, 3);
assert.equal(result.week.length, 7);

console.log('Smoke check passed: analytics service works for basic streak + today calculations.');
