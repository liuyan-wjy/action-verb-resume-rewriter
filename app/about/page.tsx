import type { Metadata } from 'next';
import { SchemaScript } from '@/components/SchemaScript';
import { buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'About Us',
  description: 'Learn about PowerVerb and our mission.',
  path: '/about',
  keywords: ['about powerverb', 'resume rewriter company']
});

export default function AboutPage() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    email: 'support@resumeactionverbs.com'
  };

  return (
    <div className="stack-xl">
      <SchemaScript data={organizationSchema} />

      <section className="card stack-md">
        <h1>About PowerVerb</h1>
        <p>
          PowerVerb is an AI-assisted resume bullet rewriter focused on stronger action verbs, clearer ATS phrasing,
          and practical quantification hints.
        </p>

        <div className="stack-sm">
          <h2>Our mission</h2>
          <p>Help job seekers turn weak bullet points into concise, credible, and impactful resume language.</p>

          <h2>What makes us different</h2>
          <p>
            We emphasize factual fidelity. The tool is designed to preserve user facts, avoid fabricated achievements,
            and give copy-ready alternatives.
          </p>

          <h2>Reach us</h2>
          <p>
            Email: <a href="mailto:support@resumeactionverbs.com">support@resumeactionverbs.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}
