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

export type MatchmakerEnergy = 'low' | 'steady' | 'high';
export type MatchmakerContext = 'mobile' | 'desk';
export type MatchmakerGoal = 'consistency' | 'depth' | 'restart';

export type MatchmakerProfile = {
  energy: MatchmakerEnergy;
  context: MatchmakerContext;
  goal: MatchmakerGoal;
};

export type PresetMatchRecommendation = {
  preset: UseCasePreset;
  confidence: number;
  reasons: string[];
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

export function recommendPresetByProfile(
  presets: ReadonlyArray<UseCasePreset>,
  profile: MatchmakerProfile,
): PresetMatchRecommendation | null {
  const recommendations = presets
    .map((preset) => {
      let score = 0;
      const reasons: string[] = [];

      if (profile.context === 'mobile') {
        if (preset.id === 'mobile-commute') {
          score += 4;
          reasons.push('Optimized for short mobile windows and interruption-heavy days.');
        }

        if (preset.settings.focus <= 15) {
          score += 2;
          reasons.push('Short focus blocks reduce friction when you are on the move.');
        }
      }

      if (profile.context === 'desk' && preset.settings.focus >= 25) {
        score += 1;
        reasons.push('Longer focus blocks fit stable desk sessions.');
      }

      if (profile.goal === 'depth' && preset.id === 'deep-work') {
        score += 4;
        reasons.push('Deep-work cadence maximizes uninterrupted concentration.');
      }

      if (profile.goal === 'consistency' && preset.id === 'student-revision') {
        score += 3;
        reasons.push('Balanced cycle supports repeatable daily consistency.');
      }

      if (profile.goal === 'restart' && preset.id === 'high-energy') {
        score += 4;
        reasons.push('Fast loops rebuild momentum when starting feels hard.');
      }

      if (profile.energy === 'low' && preset.settings.focus <= 20) {
        score += 2;
        reasons.push('Lower energy days benefit from shorter wins.');
      }

      if (profile.energy === 'steady' && preset.settings.focus >= 20 && preset.settings.focus <= 30) {
        score += 2;
        reasons.push('Mid-length sessions match steady cognitive output.');
      }

      if (profile.energy === 'high' && preset.settings.focus >= 40) {
        score += 2;
        reasons.push('High energy can sustain deeper focus intervals.');
      }

      const confidence = Math.min(98, 55 + score * 6);

      return {
        preset,
        score,
        confidence,
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score);

  const top = recommendations[0];
  if (!top) return null;

  return {
    preset: top.preset,
    confidence: top.confidence,
    reasons: top.reasons.slice(0, 2),
  };
}
