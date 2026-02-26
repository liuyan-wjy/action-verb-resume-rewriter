import type { Metadata } from 'next';
import { PricingSection } from '@/components/PricingSection';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Buy credits or subscribe to Pro via PayPal for higher rewrite volume.'
};

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
