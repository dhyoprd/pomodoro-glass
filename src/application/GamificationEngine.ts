import type { AppState } from '@/application/AppController';
import { clamp } from '@/lib/utils';

export const XP_PER_SESSION = 100;
export const XP_PER_FOCUS_MINUTE = 2;
const XP_PER_LEVEL = 500;

const ACHIEVEMENTS = [
  {
    id: 'ach-first-session',
    icon: '🥉',
    title: 'First Win',
    target: 1,
    unit: 'session',
    getProgress: (state: AppState) => state.stats.completed,
  },
  {
    id: 'ach-focus-1000',
    icon: '🥈',
    title: '1,000 Focus Minutes',
    target: 1000,
    unit: 'minutes',
    getProgress: (state: AppState) => state.stats.focusMinutes,
  },
  {
    id: 'ach-streak-7',
    icon: '🥇',
    title: '7-Day Streak',
    target: 7,
    unit: 'days',
    getProgress: (state: AppState) => state.analytics.streak.current,
  },
] as const;

const DAILY_QUESTS = [
  {
    id: 'quest-focus-minutes',
    icon: '⚡',
    title: 'Focus Momentum',
    target: 120,
    description: 'Accumulate 120 focused minutes today.',
    getProgress: (state: AppState) => state.analytics.today.focusMinutes,
  },
  {
    id: 'quest-sessions',
    icon: '🍅',
    title: 'Pomodoro Finisher',
    target: 4,
    description: 'Complete 4 sessions in a day.',
    getProgress: (state: AppState) => state.analytics.today.sessions,
  },
  {
    id: 'quest-task-clear',
    icon: '✅',
    title: 'Task Clarity',
    target: 3,
    description: 'Close out 3 tasks from your queue.',
    getProgress: (state: AppState) => state.tasks.filter((task) => task.done).length,
  },
] as const;

export function buildGamificationProgress(state: AppState) {
  const xp = state.stats.completed * XP_PER_SESSION + state.stats.focusMinutes * XP_PER_FOCUS_MINUTE;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const levelBaseXp = (level - 1) * XP_PER_LEVEL;
  const xpIntoLevel = xp - levelBaseXp;
  const xpToNextLevel = XP_PER_LEVEL - xpIntoLevel;
  const levelProgress = clamp((xpIntoLevel / XP_PER_LEVEL) * 100, 0, 100);

  return { xp, level, xpToNextLevel, levelProgress };
}

export function buildAchievementProgress(state: AppState) {
  return ACHIEVEMENTS.map((achievement) => {
    const progressValue = achievement.getProgress(state);
    const progress = clamp((progressValue / achievement.target) * 100, 0, 100);
    const unlocked = progressValue >= achievement.target;

    return {
      ...achievement,
      progressValue,
      progress,
      unlocked,
    };
  });
}

export function buildDailyQuestProgress(state: AppState) {
  return DAILY_QUESTS.map((quest) => {
    const progressValue = quest.getProgress(state);
    const progress = clamp((progressValue / quest.target) * 100, 0, 100);
    const complete = progressValue >= quest.target;

    return {
      ...quest,
      progressValue,
      progress,
      complete,
    };
  });
}
