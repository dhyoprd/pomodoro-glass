import type { Mode, TimerSettings } from '@/constants';

export const MODES: ReadonlyArray<{ key: Mode; label: string }> = [
  { key: 'focus', label: 'Focus' },
  { key: 'shortBreak', label: 'Short Break' },
  { key: 'longBreak', label: 'Long Break' },
] as const;

export type UseCasePreset = {
  id: string;
  icon: string;
  name: string;
  description: string;
  outcome: string;
  settings: TimerSettings;
};

export const USE_CASE_PRESETS: ReadonlyArray<UseCasePreset> = [
  {
    id: 'student-revision',
    icon: '🎓',
    name: 'Student Revision',
    description: 'Steady pace for lectures, homework, and exam prep.',
    outcome: 'Best for consistency over long study days.',
    settings: { focus: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4 },
  },
  {
    id: 'deep-work',
    icon: '🧠',
    name: 'Deep Work Sprint',
    description: 'Longer focus windows for coding or writing sessions.',
    outcome: 'Fewer switches, more deep concentration.',
    settings: { focus: 50, shortBreak: 10, longBreak: 20, longBreakInterval: 3 },
  },
  {
    id: 'high-energy',
    icon: '⚡',
    name: 'High-Energy Loop',
    description: 'Short cycles for quick wins when motivation is low.',
    outcome: 'Fast momentum when energy is scattered.',
    settings: { focus: 15, shortBreak: 3, longBreak: 10, longBreakInterval: 4 },
  },
] as const;

export type OutcomeBlueprint = {
  id: string;
  icon: string;
  title: string;
  summary: string;
  presetId: UseCasePreset['id'];
};

export const OUTCOME_BLUEPRINTS: ReadonlyArray<OutcomeBlueprint> = [
  {
    id: 'exam-week',
    icon: '📚',
    title: 'Exam Week Coverage',
    summary: 'Sustain 4-6 hours/day without burnout.',
    presetId: 'student-revision',
  },
  {
    id: 'ship-feature',
    icon: '🚀',
    title: 'Ship a Feature Fast',
    summary: 'Protect deep blocks and reduce context switching.',
    presetId: 'deep-work',
  },
  {
    id: 'reset-momentum',
    icon: '🪫',
    title: 'Recover Momentum',
    summary: 'Use shorter loops to rebuild consistency.',
    presetId: 'high-energy',
  },
] as const;
