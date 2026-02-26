import type { Metadata } from 'next';
import Link from 'next/link';
import { RewriterPanel } from '@/components/RewriterPanel';
import { VerbCategoryGrid } from '@/components/VerbCategoryGrid';
import { SchemaScript } from '@/components/SchemaScript';
import { buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Action Verbs for Resume + Free AI Bullet Rewriter',
  description:
    'Improve weak resume bullets with stronger action verbs. Use the free AI rewriter and browse resume action verbs by role, tone, and impact.',
  path: '/',
  keywords: ['action verbs for resume', 'resume action verbs', 'resume bullet rewriter', 'power verbs for resume']
});

export default function HomePage() {
  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        email: '2471662450@qq.com'
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/tool/resume-action-verbs-rewriter`,
          'query-input': 'required name=resume bullet'
        }
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Resume Bullet Rewriter Tool',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      }
    ]
  } as const;

  return (
    <div className="stack-xl">
      <SchemaScript data={homeSchema} />
      <section className="hero card stack-md">
        <p className="eyebrow">Resume Language Booster</p>
        <h1>Action Verbs for Resume: Rewrite Weak Bullets Fast</h1>
        <p>
          Convert plain resume statements into stronger, ATS-friendly bullet points in one click. Use our free resume bullet
          rewriter to keep your facts and improve clarity, scope, and impact.
        </p>
        <div className="hero-links">
          <Link href="/tool/resume-action-verbs-rewriter" className="btn-primary link-btn">
            Open Rewriter Tool
          </Link>
          <Link href="/action-verbs-for-resume" className="btn-secondary link-btn">
            Browse Verb List
          </Link>
        </div>
      </section>

      <section className="card stack-md">
        <h2>Why recruiters prefer strong resume action verbs</h2>
        <p>
          Action verbs make each bullet easier to scan and help hiring managers understand ownership quickly. They also improve ATS
          readability by reducing vague phrases like “responsible for” and “helped with”.
        </p>
        <p>
          Start with a precise verb, keep the original fact pattern, and add measurable context when possible. If you need examples,
          see our <Link href="/action-verb-examples">action verb examples for resume bullets</Link>.
        </p>
      </section>

      <RewriterPanel />
      <VerbCategoryGrid />
    </div>
  );
}
