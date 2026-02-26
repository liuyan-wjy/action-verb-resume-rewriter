import type { Metadata } from 'next';
import { PricingSection } from '@/components/PricingSection';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Pricing',
  description: 'Buy credits or subscribe to Pro via PayPal for higher rewrite volume.',
  path: '/pricing',
  keywords: ['resume rewriter pricing', 'resume tool credits', 'resume subscription']
});

export default function PricingPage() {
  return (
    <div className="stack-xl">
      <section className="card stack-md">
        <h1>Pricing</h1>
        <p>Start free, then buy credits or subscribe for more rewrite capacity.</p>
      </section>
      <PricingSection />
    </div>
  );
}
