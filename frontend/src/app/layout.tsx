import './globals.css';

import { Space_Grotesk } from 'next/font/google';
import type { Metadata } from 'next';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Knowledge Exchange Platform',
  description:
    'Open-source platform for running internal and cross-company knowledge exchange sessions.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
