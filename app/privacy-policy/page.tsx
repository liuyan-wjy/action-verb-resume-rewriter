import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description: 'How PowerVerb collects, uses, and protects your data.',
  path: '/privacy-policy',
  keywords: ['privacy policy', 'powerverb privacy']
});

export default function PrivacyPolicyPage() {
  return (
    <div className="stack-xl">
      <section className="card stack-md">
        <h1>Privacy Policy</h1>
        <p>
          Effective date: February 26, 2026. This policy explains how PowerVerb handles personal information and usage
          data when you use our resume rewriting tool.
        </p>

        <div className="stack-sm">
          <h2>1. Information we collect</h2>
          <p>
            We may collect account information (such as email from Google sign-in), billing events from payment
            providers, and technical logs required for reliability and abuse prevention.
          </p>

          <h2>2. How we use data</h2>
          <p>
            We use data to provide rewrites, manage credits/subscriptions, monitor system health, and improve output
            quality. We do not sell personal data.
          </p>

          <h2>3. Data retention</h2>
          <p>
            Data is retained only as needed for service delivery, legal obligations, and fraud prevention. You can
            request deletion by contacting us.
          </p>

          <h2>4. Third-party services</h2>
          <p>
            PowerVerb may use Supabase, Vercel, OpenRouter, and PayPal. These providers process data under their own
            privacy terms.
          </p>

          <h2>5. Contact</h2>
          <p>
            Privacy requests: <a href="mailto:support@resumeactionverbs.com">support@resumeactionverbs.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}
