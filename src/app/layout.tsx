import './globals.css';
import type { Metadata, Viewport } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://loose.run';
const ogImage = '/pomodoro-screenshot.png';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Loose',
    template: '%s · Loose',
  },
  description: 'Use-case-first productivity system for students and workers. Build momentum with focused sessions, XP, and streaks.',
  applicationName: 'Loose',
  keywords: ['pomodoro', 'focus timer', 'study timer', 'productivity', 'deep work', 'students'],
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Loose',
    title: 'Loose — use-case-first focus OS',
    description: 'Pick an outcome, run the best-fit rhythm, and compound focus momentum with gamified wins.',
    images: [
      {
        url: ogImage,
        width: 1280,
        height: 720,
        alt: 'Loose productivity dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loose — use-case-first focus OS',
    description: 'Run outcome-first focus sessions and stack visible momentum.',
    images: [ogImage],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon?size=192', sizes: '192x192', type: 'image/png' },
      { url: '/icon?size=512', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: 'Loose',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7c3aed',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

