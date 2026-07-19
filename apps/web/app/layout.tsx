import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FinPilot AI — Your intelligent financial copilot',
  description:
    'Track income, expenses, budgets, and goals — with an AI coach that explains your money using your own transaction history.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
