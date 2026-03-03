import type { Metadata } from 'next';

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'PowerVerb';
export const SITE_DESCRIPTION =
  'Rewrite weak resume bullets into action-verb, ATS-friendly statements with role-specific tone and quantification hints.';

const rawSiteUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.OPENROUTER_SITE_URL ?? 'https://resumeactionverbs.com';

export const SITE_URL = rawSiteUrl.replace(/\/$/, '');

interface BuildPageMetadataInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
}

function normalizePath(path: string) {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
}

export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const path = normalizePath(input.path);
  const canonicalUrl = `${SITE_URL}${path === '/' ? '' : path}`;

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical: path
    },
    openGraph: {
      title: `${input.title} | ${SITE_NAME}`,
      description: input.description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${input.title} | ${SITE_NAME}`,
      description: input.description
    },
    robots: input.noIndex
      ? {
          index: false,
          follow: false
        }
      : {
          index: true,
          follow: true
        }
  };
}
