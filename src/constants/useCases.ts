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
  idealFor: ReadonlyArray<string>;
  momentumTip: string;
  settings: TimerSettings;
};

export const USE_CASE_PRESETS: ReadonlyArray<UseCasePreset> = [
  {
    id: 'student-revision',
    icon: '🎓',
    name: 'Student Revision',
    description: 'Steady pace for lectures, homework, and exam prep.',
    outcome: 'Best for consistency over long study days.',
    idealFor: ['Exam prep', 'Lecture backlog', 'Balanced energy'],
    momentumTip: 'Batch 2-3 related chapters per cycle to avoid context switching.',
    settings: { focus: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4 },
  },
  {
    id: 'deep-work',
    icon: '🧠',
    name: 'Deep Work Sprint',
    description: 'Longer focus windows for coding or writing sessions.',
    outcome: 'Fewer switches, more deep concentration.',
    idealFor: ['Feature shipping', 'Writing drafts', 'High clarity windows'],
    momentumTip: 'Define one hard outcome before pressing start to protect the block.',
    settings: { focus: 50, shortBreak: 10, longBreak: 20, longBreakInterval: 3 },
  },
  {
    id: 'high-energy',
    icon: '⚡',
    name: 'High-Energy Loop',
    description: 'Short cycles for quick wins when motivation is low.',
    outcome: 'Fast momentum when energy is scattered.',
    idealFor: ['Low motivation', 'Task anxiety', 'Quick restart days'],
    momentumTip: 'Aim for 3 fast wins first; confidence usually rebounds by session 2.',
    settings: { focus: 15, shortBreak: 3, longBreak: 10, longBreakInterval: 4 },
  },
  {
    id: 'mobile-commute',
    icon: '🚇',
    name: 'Commute Micro-Sprints',
    description: 'Phone-friendly loops for trains, buses, and waiting windows.',
    outcome: 'Turn fragmented travel time into measurable progress.',
    idealFor: ['Transit sessions', 'Errand gaps', 'On-the-go planning'],
    momentumTip: 'Queue bite-sized tasks before leaving home so you can start instantly.',
    settings: { focus: 10, shortBreak: 2, longBreak: 8, longBreakInterval: 5 },
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
  {
    id: 'commute-bites',
    icon: '📱',
    title: 'Make Commute Time Count',
    summary: 'Ship bite-sized wins from your phone during transit.',
    presetId: 'mobile-commute',
  },
] as const;
