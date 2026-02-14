import type {
  MatchmakerContext,
  MatchmakerEnergy,
  MatchmakerGoal,
} from '@/application/SessionPlannerEngine';

export type MatchmakerPersona = {
  id: string;
  label: string;
  blurb: string;
  profile: {
    energy: MatchmakerEnergy;
    context: MatchmakerContext;
    goal: MatchmakerGoal;
  };
};

export const MATCHMAKER_PERSONAS: ReadonlyArray<MatchmakerPersona> = [
  {
    id: 'deep-desk-shipper',
    label: 'Deep Desk Shipper',
    blurb: 'High energy + deep work output at your desk.',
    profile: { energy: 'high', context: 'desk', goal: 'depth' },
  },
  {
    id: 'steady-consistency-builder',
    label: 'Steady Consistency Builder',
    blurb: 'Reliable daily progress with balanced energy.',
    profile: { energy: 'steady', context: 'desk', goal: 'consistency' },
  },
  {
    id: 'commute-rescue-runner',
    label: 'Commute Rescue Runner',
    blurb: 'Low-friction momentum restart while mobile.',
    profile: { energy: 'low', context: 'mobile', goal: 'restart' },
  },
] as const;

export const HERO_QUICK_SCENARIOS: ReadonlyArray<{
  id: string;
  label: string;
  description: string;
  personaId: string;
}> = [
  {
    id: 'hero-scenario-deep-desk',
    label: 'Deep desk ship',
    description: 'High-energy desk sprint for shipping output fast.',
    personaId: 'deep-desk-shipper',
  },
  {
    id: 'hero-scenario-steady-consistency',
    label: 'Steady consistency',
    description: 'Balanced daily loop for predictable progress.',
    personaId: 'steady-consistency-builder',
  },
  {
    id: 'hero-scenario-commute-rescue',
    label: 'Commute rescue',
    description: 'Low-friction mobile reset when momentum is slipping.',
    personaId: 'commute-rescue-runner',
  },
] as const;

export const HERO_TIME_BUDGET_PRESETS: ReadonlyArray<{ minutes: number; label: string }> = [
  { minutes: 45, label: 'Quick sprint' },
  { minutes: 90, label: 'Standard run' },
  { minutes: 120, label: 'Deep work' },
  { minutes: 180, label: 'Long game' },
] as const;

export const findMatchmakerPersona = (personaId: string) =>
  MATCHMAKER_PERSONAS.find((item) => item.id === personaId);
