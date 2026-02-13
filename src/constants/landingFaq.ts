export type LandingFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const LANDING_FAQ: LandingFaqItem[] = [
  {
    id: 'faq-use-case-first',
    question: 'How is Loose different from a normal Pomodoro timer?',
    answer:
      'Loose starts with your outcome first (exam prep, deep work, momentum restart) and recommends a best-fit rhythm, instead of forcing one generic timer for every day.',
  },
  {
    id: 'faq-mobile',
    question: 'Can I use Loose effectively on mobile during commute blocks?',
    answer:
      'Yes. Loose includes mobile quick controls, installable app behavior, and quick-start links so you can launch a focused session in a few taps while moving.',
  },
  {
    id: 'faq-gamification',
    question: 'Is the gamification just cosmetic?',
    answer:
      'No. XP, levels, streaks, and milestones are tied to completed focus time and are designed to keep momentum visible so it is easier to stay consistent over weeks.',
  },
  {
    id: 'faq-data',
    question: 'Where is my data stored?',
    answer:
      'Your session history, settings, and tasks are stored locally in your browser using localStorage, so your progress persists between visits on the same device.',
  },
];
