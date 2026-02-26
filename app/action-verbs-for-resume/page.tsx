import type { Metadata } from 'next';
import Link from 'next/link';
import { VerbCategoryGrid } from '@/components/VerbCategoryGrid';
import { SchemaScript } from '@/components/SchemaScript';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Action Verbs for Resume',
  description: 'A categorized list of action verbs for resume bullet points, plus usage guidance and examples.',
  path: '/action-verbs-for-resume',
  keywords: ['action verbs for resume', 'power verbs for resume', 'resume wording']
});

const faqItems = [
  {
    question: 'What are strong action verbs for resume bullets?',
    answer:
      'Strong action verbs are specific lead words like Led, Optimized, Built, and Improved that describe what you did and clarify impact.'
  },
  {
    question: 'Should every resume bullet start with an action verb?',
    answer:
      'Yes in most cases. Starting with an action verb improves scannability and helps recruiters quickly understand scope and contribution.'
  },
  {
    question: 'Can I use the same action verb repeatedly?',
    answer: 'Avoid heavy repetition. Rotate verbs by context so each bullet communicates a distinct skill or outcome.'
  }
] as const;

export default function ActionVerbsForResumePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
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
        name: 'Action Verbs for Resume',
        item: `${SITE_URL}/action-verbs-for-resume`
      }
    ]
  };

  return (
    <div className="stack-xl">
      <SchemaScript data={faqSchema} />
      <SchemaScript data={breadcrumbSchema} />

      <section className="card stack-md">
        <h1>Action Verbs for Resume</h1>
        <p>
          Use this list when you need stronger opening words than “responsible for” or “helped”. Pick verbs that match your role,
          then back them with clear scope and outcomes.
        </p>
        <p>
          Need instant rewrites? Use the <Link href="/tool/resume-action-verbs-rewriter">Action Verb Resume Rewriter tool</Link>.
        </p>
      </section>

      <VerbCategoryGrid />

      <section className="card stack-md">
        <h2>Common Questions</h2>
        {faqItems.map((item) => (
          <article key={item.question} className="mini-card stack-sm">
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
