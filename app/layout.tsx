import type { Metadata } from 'next';
import { Bebas_Neue, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/NavBar';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo';

const headingFont = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: '400'
});

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body'
});
const ICON_VERSION = '20260303';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'action verbs for resume',
    'resume action verbs',
    'resume bullet rewriter',
    'ats resume bullets',
    'power verbs for resume'
  ],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION
  },
  manifest: `${SITE_URL}/site.webmanifest?v=${ICON_VERSION}`,
  themeColor: '#c43f1a',
  icons: {
    icon: [
      { url: `${SITE_URL}/favicon.ico?v=${ICON_VERSION}` },
      { url: `${SITE_URL}/favicon-32x32.png?v=${ICON_VERSION}`, sizes: '32x32', type: 'image/png' },
      { url: `${SITE_URL}/favicon-16x16.png?v=${ICON_VERSION}`, sizes: '16x16', type: 'image/png' }
    ],
    apple: [{ url: `${SITE_URL}/apple-touch-icon.png?v=${ICON_VERSION}`, sizes: '180x180', type: 'image/png' }],
    shortcut: `${SITE_URL}/favicon.ico?v=${ICON_VERSION}`
  }
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
