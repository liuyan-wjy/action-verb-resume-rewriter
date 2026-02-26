import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SubscriptionSuccessClient } from '@/app/subscription/success/client';

export const metadata: Metadata = {
  title: 'Subscription Success',
  description: 'Subscription confirmation page for PowerVerb Pro.',
  robots: {
    index: false,
    follow: false
  }
};

export default function SubscriptionSuccessPage() {
  return (
    <div className="stack-xl">
      <Suspense fallback={<section className="card stack-md"><h1>Subscription status</h1><p>Loading...</p></section>}>
        <SubscriptionSuccessClient />
      </Suspense>
    </div>
  );
}
