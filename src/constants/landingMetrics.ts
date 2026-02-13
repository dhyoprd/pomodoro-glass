export type LandingMetric = {
  id: string;
  icon: string;
  label: string;
  value: string;
  detail: string;
};

export const LANDING_METRICS: LandingMetric[] = [
  {
    id: 'activation-time',
    icon: '⚡',
    label: 'Time to first focus block',
    value: '< 60 sec',
    detail: 'Pick an outcome and start a matching rhythm instantly.',
  },
  {
    id: 'weekly-focus-return',
    icon: '⏱️',
    label: 'Projected weekly deep focus',
    value: '10h+',
    detail: 'Based on a 120-minute daily plan across 5 active days.',
  },
  {
    id: 'engagement-loop',
    icon: '🎮',
    label: 'Gamified consistency loop',
    value: 'XP + streaks',
    detail: 'Visible wins keep momentum alive even on low-energy days.',
  },
  {
    id: 'mobile-readiness',
    icon: '📱',
    label: 'Mobile-ready rescue actions',
    value: '1-tap restart',
    detail: 'Commute and rescue flows are optimized for short interruptions.',
  },
];
