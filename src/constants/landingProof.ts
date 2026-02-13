export type LandingSocialProofStory = {
  id: string;
  icon: string;
  archetype: string;
  blueprint: string;
  quote: string;
  outcome: string;
  streakLift: string;
  focusWins: string;
};

export const LANDING_SOCIAL_PROOF: LandingSocialProofStory[] = [
  {
    id: 'exam-week-student',
    icon: '📚',
    archetype: 'Exam-week student',
    blueprint: 'Student Revision blueprint',
    quote: 'I stopped guessing my schedule. Loose gave me an exam rhythm and I covered 6 chapters in 4 days without burning out.',
    outcome: '6 chapters covered',
    streakLift: '+4 active days',
    focusWins: '18 wins',
  },
  {
    id: 'startup-engineer',
    icon: '🚀',
    archetype: 'Startup engineer',
    blueprint: 'Deep Work Sprint blueprint',
    quote: 'Shipping got easier once each block had a clear mission. I finished a launch bug list in one focused afternoon.',
    outcome: 'Feature shipped',
    streakLift: '+3 active days',
    focusWins: '11 wins',
  },
  {
    id: 'momentum-restart',
    icon: '🔥',
    archetype: 'Momentum rebuild',
    blueprint: 'High-Energy Loop blueprint',
    quote: 'When my week dipped, Loose gave me tiny wins first. The gamified XP loop helped me restart instead of quitting.',
    outcome: 'Routine recovered',
    streakLift: '+5 active days',
    focusWins: '14 wins',
  },
];
