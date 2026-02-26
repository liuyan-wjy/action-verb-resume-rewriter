import Link from 'next/link';
import { RewriterPanel } from '@/components/RewriterPanel';
import { VerbCategoryGrid } from '@/components/VerbCategoryGrid';
import { SchemaScript } from '@/components/SchemaScript';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

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
        <h1>Stop writing weak bullets. Start with power verbs.</h1>
        <p>
          Convert plain resume statements into stronger, ATS-friendly bullet points in one click. Built for job seekers who need
          better wording without exaggeration.
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

      <RewriterPanel />
      <VerbCategoryGrid />
    </div>
  );
}
