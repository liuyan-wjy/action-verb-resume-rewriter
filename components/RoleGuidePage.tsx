import Link from 'next/link';
import { SchemaScript } from '@/components/SchemaScript';
import type { RoleGuideData } from '@/lib/role-guides';
import { SITE_URL } from '@/lib/seo';

interface RoleGuidePageProps {
  guide: RoleGuideData;
}

export function RoleGuidePage({ guide }: RoleGuidePageProps) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a
      }
    }))
  };

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
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: guide.title,
        item: `${SITE_URL}${guide.path}`
      }
    ]
  };

  return (
    <div className="stack-xl">
      <SchemaScript data={faqSchema} />
      <SchemaScript data={breadcrumbSchema} />

      <section className="card stack-md">
        <h1>{guide.title}</h1>
        <p>{guide.intro}</p>
        <p>
          Need personalized rewrites? <Link href="/tool/resume-action-verbs-rewriter">Use the free resume bullet rewriter</Link>.
        </p>
      </section>

      <section className="card stack-md">
        <h2>High-signal verbs for this role</h2>
        <p>{guide.verbList.join(' · ')}</p>
      </section>

      <section className="card stack-md">
        <h2>Before vs after bullet examples</h2>
        {guide.bulletExamples.map((item) => (
          <article key={item.weak} className="mini-card stack-sm">
            <p>
              <strong>Weak:</strong> {item.weak}
            </p>
            <p>
              <strong>Improved:</strong> {item.strong}
            </p>
          </article>
        ))}
      </section>

      <section className="card stack-md">
        <h2>Writing tips</h2>
        <ul className="plain-list">
          {guide.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <section className="card stack-md">
        <h2>FAQ</h2>
        {guide.faq.map((item) => (
          <article key={item.q} className="mini-card stack-sm">
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </article>
        ))}
      </section>

      <section className="card stack-md">
        <p>
          Explore broader lists: <Link href="/action-verbs-for-resume">action verbs for resume</Link> and{' '}
          <Link href="/action-verb-examples">action verb examples</Link>.
        </p>
      </section>
    </div>
  );
}
