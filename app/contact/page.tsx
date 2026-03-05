import type { Metadata } from 'next';
import { SchemaScript } from '@/components/SchemaScript';
import { buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Us',
  description: 'Contact PowerVerb for support, billing, and partnership inquiries.',
  path: '/contact',
  keywords: ['contact powerverb', 'resume rewriter support']
});

export default function ContactPage() {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${SITE_NAME}`,
    url: `${SITE_URL}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: SITE_NAME,
      email: 'support@resumeactionverbs.com',
      url: SITE_URL
    }
  };

  return (
    <div className="stack-xl">
      <SchemaScript data={contactSchema} />

      <section className="card stack-md">
        <h1>Contact Us</h1>
        <p>For support, billing, or business inquiries, send us an email.</p>

        <div className="stack-sm">
          <h2>Support email</h2>
          <p>
            <a href="mailto:support@resumeactionverbs.com">support@resumeactionverbs.com</a>
          </p>

          <h2>What to include</h2>
          <p>Include your account email, issue summary, and screenshots when possible.</p>
        </div>
      </section>
    </div>
  );
}
