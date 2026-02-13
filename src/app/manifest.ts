import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/?source=pwa',
    name: 'Loose',
    short_name: 'Loose',
    description: 'Use-case-first productivity OS for students and workers.',
    lang: 'en',
    dir: 'ltr',
    categories: ['productivity', 'education', 'utilities'],
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'window-controls-overlay'],
    orientation: 'portrait',
    background_color: '#09090b',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/pomodoro-screenshot.png',
        sizes: '1368x813',
        type: 'image/png',
        label: 'Loose dashboard with timer, planner, and gamification widgets.',
        form_factor: 'wide',
      },
      {
        src: '/pomodoro-screenshot.png',
        sizes: '1368x813',
        type: 'image/png',
        label: 'Loose mobile quick-start flow with timer and section shortcuts.',
        form_factor: 'narrow',
      },
    ],
    shortcuts: [
      {
        name: 'Deep Work Sprint',
        short_name: 'Deep Work',
        description: 'Open Loose with the deep work preset and start immediately.',
        url: '/?preset=deep-work&autostart=1&source=shortcut-deep-work',
        icons: [{ src: '/icon?size=192', sizes: '192x192' }],
      },
      {
        name: 'Momentum Rescue',
        short_name: 'Rescue',
        description: 'Start the high-energy recovery loop when motivation drops.',
        url: '/?preset=high-energy&autostart=1&source=shortcut-rescue',
        icons: [{ src: '/icon?size=192', sizes: '192x192' }],
      },
      {
        name: 'Commute Micro-Sprints',
        short_name: 'Commute',
        description: 'Open a mobile-friendly commute loop and start focus.',
        url: '/?preset=mobile-commute&autostart=1&source=shortcut-commute',
        icons: [{ src: '/icon?size=192', sizes: '192x192' }],
      },
      {
        name: 'Plan My Day',
        short_name: 'Planner',
        description: 'Jump straight to the daily session planner.',
        url: '/?source=shortcut-planner#session-planner',
        icons: [{ src: '/icon?size=192', sizes: '192x192' }],
      },
    ],
  };
}
