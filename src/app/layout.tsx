import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pomodoro Glass',
  description: 'Focus beautifully.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

