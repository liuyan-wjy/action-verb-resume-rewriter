import type { Metadata } from 'next';
import { Bebas_Neue, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/NavBar';

const headingFont = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: '400'
});

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body'
});

export const metadata: Metadata = {
  title: {
    default: 'Action Verb Resume Rewriter',
    template: '%s | Action Verb Resume Rewriter'
  },
  description:
    'Rewrite weak resume bullets into action-verb, ATS-friendly statements with role-specific tone and quantification hints.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <div className="background-orb" aria-hidden="true" />
        <NavBar />
        <main className="container page-stack">{children}</main>
      </body>
    </html>
  );
}
