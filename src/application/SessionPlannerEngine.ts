import type { TimerSettings } from '@/constants';
import type { UseCasePreset } from '@/constants/useCases';
import { XP_PER_FOCUS_MINUTE, XP_PER_SESSION } from '@/application/GamificationEngine';

export type SessionPlannerSummary = {
  estimatedSessions: number;
  estimatedFocusMinutes: number;
  estimatedXp: number;
  estimatedWeeklyXp: number;
  cycleMinutes: number;
};

export type RankedPresetPlan = {
  preset: UseCasePreset;
  sessions: number;
  focusMinutes: number;
  remainder: number;
  score: number;
  focusRatio: number;
  xpPerHour: number;
};

export type SessionTimelineBlock = {
  id: string;
  kind: 'focus' | 'shortBreak' | 'longBreak';
  minutes: number;
  startsAtMinute: number;
  endsAtMinute: number;
};

export function buildSessionPlannerSummary(settings: TimerSettings, planningMinutes: number): SessionPlannerSummary {
  const cycleMinutes = settings.focus + settings.shortBreak;
  const estimatedSessions = Math.max(1, Math.floor(planningMinutes / cycleMinutes));
  const estimatedFocusMinutes = estimatedSessions * settings.focus;
  const estimatedXp = estimatedSessions * XP_PER_SESSION + estimatedFocusMinutes * XP_PER_FOCUS_MINUTE;

  return {
    estimatedSessions,
    estimatedFocusMinutes,
    estimatedXp,
    estimatedWeeklyXp: estimatedXp * 5,
    cycleMinutes,
  };
}

export function buildSessionTimeline(settings: TimerSettings, planningMinutes: number): SessionTimelineBlock[] {
  const blocks: SessionTimelineBlock[] = [];
  let elapsed = 0;
  let completedFocusSessions = 0;

  while (elapsed < planningMinutes) {
    const focusEnd = elapsed + settings.focus;
    if (focusEnd > planningMinutes) break;

    completedFocusSessions += 1;
    blocks.push({
      id: `focus-${completedFocusSessions}`,
      kind: 'focus',
      minutes: settings.focus,
      startsAtMinute: elapsed,
      endsAtMinute: focusEnd,
    });
    elapsed = focusEnd;

    if (elapsed >= planningMinutes) break;

    const isLongBreakDue = completedFocusSessions % settings.longBreakInterval === 0;
    const breakMinutes = isLongBreakDue ? settings.longBreak : settings.shortBreak;
    const breakKind: SessionTimelineBlock['kind'] = isLongBreakDue ? 'longBreak' : 'shortBreak';
    const breakEnd = elapsed + breakMinutes;

    if (breakEnd > planningMinutes) break;

    blocks.push({
      id: `${breakKind}-${completedFocusSessions}`,
      kind: breakKind,
      minutes: breakMinutes,
      startsAtMinute: elapsed,
      endsAtMinute: breakEnd,
    });
    elapsed = breakEnd;
  }

  return blocks;
}

export function rankPresetPlans(presets: ReadonlyArray<UseCasePreset>, planningMinutes: number): RankedPresetPlan[] {
  return presets
    .map((preset) => {
      const cycleMinutes = preset.settings.focus + preset.settings.shortBreak;
      const sessions = Math.max(1, Math.floor(planningMinutes / cycleMinutes));
      const focusMinutes = sessions * preset.settings.focus;
      const remainder = planningMinutes - sessions * cycleMinutes;
      const focusRatio = focusMinutes / planningMinutes;
      const estimatedXp = sessions * XP_PER_SESSION + focusMinutes * XP_PER_FOCUS_MINUTE;
      const xpPerHour = Math.round((estimatedXp / planningMinutes) * 60);
      const score = focusRatio * 100 - remainder;

      return {
        preset,
        sessions,
        focusMinutes,
        remainder,
        score,
        focusRatio,
        xpPerHour,
      };
    })
    .sort((a, b) => b.score - a.score);
}
