import './globals.css';

import { Space_Grotesk } from 'next/font/google';
import type { Metadata } from 'next';
import Navigation from './components/Navigation';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Knowledge Platform - Expert-Led Sessions',
  description:
    'Enterprise knowledge management system for facilitating expert-led learning sessions with advanced role-based access control and comprehensive security features.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
