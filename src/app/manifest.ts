import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Loose',
    short_name: 'Loose',
    description: 'Productivity system for students and workers.',
    start_url: '/',
    display: 'standalone',
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
    shortcuts: [
      {
        name: 'Deep Work Sprint',
        short_name: 'Deep Work',
        description: 'Open Loose with the deep work preset and start immediately.',
        url: '/?preset=deep-work&autostart=1',
        icons: [{ src: '/icon?size=192', sizes: '192x192' }],
      },
      {
        name: 'Commute Micro-Sprints',
        short_name: 'Commute',
        description: 'Open a mobile-friendly commute loop and start focus.',
        url: '/?preset=mobile-commute&autostart=1',
        icons: [{ src: '/icon?size=192', sizes: '192x192' }],
      },
      {
        name: 'Plan My Day',
        short_name: 'Planner',
        description: 'Jump straight to the daily session planner.',
        url: '/#session-planner',
        icons: [{ src: '/icon?size=192', sizes: '192x192' }],
      },
    ],
  };
}
