import type { Metadata } from 'next';
import Link from 'next/link';
import { seoVerbCategories } from '@/lib/verb-bank';
import { SchemaScript } from '@/components/SchemaScript';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Resume Action Verbs',
  description: 'Resume action verbs organized by role and writing intent to help improve ATS clarity and impact.',
  path: '/resume-action-verbs',
  keywords: ['resume action verbs', 'resume bullet verbs', 'ats resume language']
});

export default function ResumeActionVerbsPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Resume Action Verbs',
        item: `${SITE_URL}/resume-action-verbs`
      }
    ]
  };

  return (
    <div className="stack-xl">
      <SchemaScript data={breadcrumbSchema} />

      <section className="card stack-md">
        <h1>Resume Action Verbs</h1>
        <p>
          Start each bullet with a precise verb. Then describe what you changed, who was affected, and what improved.
        </p>
      </section>

      <section className="card stack-md">
        <h2>How to use these verbs</h2>
        <ul className="plain-list">
          <li>Match verb strength to your actual scope (do not overclaim).</li>
          <li>Prefer one verb per bullet, then clarify outcome in the same line.</li>
          <li>Avoid repeating the same lead verb more than twice in one section.</li>
          <li>Add metrics where possible, but never fabricate numbers.</li>
        </ul>
      </section>

      <section className="card stack-md">
        <h2>Quick verb picks</h2>
        {Object.entries(seoVerbCategories).map(([category, verbs]) => (
          <article key={category} className="mini-card">
            <h3>{category}</h3>
            <p>{verbs.slice(0, 6).join(', ')}</p>
          </article>
        ))}
      </section>

      <section className="card stack-md">
        <p>
          Want tailored rewrites by role and tone? <Link href="/tool/resume-action-verbs-rewriter">Open the rewriter</Link>.
        </p>
      </section>
    </div>
  );
}
