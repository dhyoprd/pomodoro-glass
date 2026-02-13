import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Loose',
  description: 'Productivity system for students and workers.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

