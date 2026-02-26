import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaymentSuccessClient } from '@/app/payment/success/client';

export const metadata: Metadata = {
  title: 'Payment Success',
  description: 'Payment confirmation page for PowerVerb credits.',
  robots: {
    index: false,
    follow: false
  }
};

export default function PaymentSuccessPage() {
  return (
    <div className="stack-xl">
      <Suspense fallback={<section className="card stack-md"><h1>Payment status</h1><p>Loading...</p></section>}>
        <PaymentSuccessClient />
      </Suspense>
    </div>
  );
}
