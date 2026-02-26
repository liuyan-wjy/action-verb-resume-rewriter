import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SubscriptionSuccessClient } from '@/app/subscription/success/client';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Subscription Success',
  description: 'Subscription confirmation page for PowerVerb Pro.',
  path: '/subscription/success',
  noIndex: true
});

export default function SubscriptionSuccessPage() {
  return (
    <div className="stack-xl">
      <Suspense fallback={<section className="card stack-md"><h1>Subscription status</h1><p>Loading...</p></section>}>
        <SubscriptionSuccessClient />
      </Suspense>
    </div>
  );
}
