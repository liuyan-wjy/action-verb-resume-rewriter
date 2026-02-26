'use client';

import { useState } from 'react';
import { CREDIT_PACKAGES, PRO_PLAN } from '@/lib/config/billing';

export function PricingSection() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buyCredits(packageId: string) {
    setLoadingId(packageId);
    setError(null);

    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      });

      const data = (await response.json()) as { approveUrl?: string; error?: string };
      if (!response.ok || !data.approveUrl) {
        throw new Error(data.error ?? 'Failed to create order.');
      }

      window.location.href = data.approveUrl;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to create order.');
      setLoadingId(null);
    }
  }

  async function subscribePro() {
    setLoadingId('pro');
    setError(null);

    try {
      const response = await fetch('/api/paypal/create-subscription', {
        method: 'POST'
      });

      const data = (await response.json()) as { approveUrl?: string; error?: string };
      if (!response.ok || !data.approveUrl) {
        throw new Error(data.error ?? 'Failed to create subscription.');
      }

      window.location.href = data.approveUrl;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to create subscription.');
      setLoadingId(null);
    }
  }

  return (
    <div className="stack-lg">
      <section className="card stack-md">
        <h2>One-Time Credit Packages</h2>
        <div className="pricing-grid">
          {CREDIT_PACKAGES.map((item) => (
            <article key={item.id} className={`mini-card stack-sm ${item.popular ? 'pricing-popular' : ''}`}>
              <h3>{item.label}</h3>
              <p className="pricing-value">{item.credits} credits</p>
              <p className="hint">${item.price.toFixed(2)} one-time</p>
              <button className="btn-primary" onClick={() => buyCredits(item.id)} disabled={loadingId === item.id}>
                {loadingId === item.id ? 'Redirecting...' : 'Buy with PayPal'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="card stack-md">
        <h2>Subscription</h2>
        <article className="mini-card stack-sm">
          <h3>{PRO_PLAN.label}</h3>
          <p className="pricing-value">{PRO_PLAN.monthlyCredits} credits/month</p>
          <p className="hint">${PRO_PLAN.monthlyPrice.toFixed(2)}/month via PayPal</p>
          <button className="btn-primary" onClick={subscribePro} disabled={loadingId === 'pro'}>
            {loadingId === 'pro' ? 'Redirecting...' : 'Start Pro Subscription'}
          </button>
        </article>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
    </div>
  );
}
