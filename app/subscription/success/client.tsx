'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export function SubscriptionSuccessClient() {
  const params = useSearchParams();
  const subscriptionId = params.get('subscription_id');

  return (
    <section className="card stack-md">
      <h1>Subscription request received</h1>
      <p>Your PayPal subscription was created. Webhook confirmation will activate your Pro credits.</p>
      {subscriptionId ? <p className="hint">Subscription ID: {subscriptionId}</p> : null}
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
