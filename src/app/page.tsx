import { LANDING_FAQ } from '@/constants/landingFaq';
import { PomodoroApp } from '@/ui/PomodoroApp';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Loose',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Web',
      url: 'https://loose.run',
      description:
        'Use-case-first focus app for students and workers with session planning, gamification, streak analytics, and mobile quick actions.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: LANDING_FAQ.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PomodoroApp />
    </>
  );
}
