import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaymentSuccessClient } from '@/app/payment/success/client';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Payment Success',
  description: 'Payment confirmation page for PowerVerb credits.',
  path: '/payment/success',
  noIndex: true
});

export default function PaymentSuccessPage() {
  return (
    <div className="stack-xl">
      <Suspense fallback={<section className="card stack-md"><h1>Payment status</h1><p>Loading...</p></section>}>
        <PaymentSuccessClient />
      </Suspense>
    </div>
  );
}
