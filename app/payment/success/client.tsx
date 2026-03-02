'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { emitCreditsUpdated } from '@/lib/credits-events';

export function PaymentSuccessClient() {
  const params = useSearchParams();
  const orderId = params.get('token');
  const [message, setMessage] = useState(orderId ? 'Confirming your payment...' : 'Missing PayPal order token.');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(orderId ? 'loading' : 'error');

  useEffect(() => {
    if (!orderId) {
      return;
    }

    fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    })
      .then(async (response) => {
        const data = (await response.json()) as {
          success?: boolean;
          message?: string;
          error?: string;
          credits?: {
            total?: number;
          };
        };
        if (!response.ok || !data.success) {
          throw new Error(data.error ?? data.message ?? 'Failed to capture order.');
        }
        setStatus('success');
        setMessage(data.message ?? 'Payment completed successfully.');
        emitCreditsUpdated({ total: data.credits?.total });
      })
      .catch((requestError) => {
        setStatus('error');
        setMessage(requestError instanceof Error ? requestError.message : 'Payment capture failed.');
      });
  }, [orderId]);

  return (
    <section className="card stack-md">
      <h1>Payment status</h1>
      <p>{message}</p>
      <p className="hint">{status}</p>
      <div className="hero-links">
        <Link className="btn-primary link-btn" href="/">
          Back to tool
        </Link>
        <Link className="btn-secondary link-btn" href="/pricing">
          Pricing
        </Link>
      </div>
    </section>
  );
}
