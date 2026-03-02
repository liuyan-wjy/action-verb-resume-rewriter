'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { emitCreditsUpdated } from '@/lib/credits-events';

interface UserMeResponse {
  credits?: {
    total?: number;
    subscriptionStatus?: string;
    subscriptionId?: string | null;
  };
}

export function SubscriptionSuccessClient() {
  const params = useSearchParams();
  const subscriptionId = params.get('subscription_id');
  const [status, setStatus] = useState<'pending' | 'active' | 'timeout' | 'error'>('pending');
  const [message, setMessage] = useState('Your PayPal subscription was created. Waiting for webhook confirmation...');

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 24;
    const intervalMs = 5000;

    function scheduleNextCheck() {
      if (!cancelled) {
        window.setTimeout(checkStatus, intervalMs);
      }
    }

    async function checkStatus() {
      if (cancelled) {
        return;
      }

      attempts += 1;
      try {
        const response = await fetch('/api/user/me', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store'
        });

        if (!response.ok) {
          if (attempts >= maxAttempts && !cancelled) {
            setStatus('timeout');
            setMessage('Subscription created, but activation is still pending. Please refresh in a moment.');
            return;
          }
          scheduleNextCheck();
          return;
        }

        const data = (await response.json()) as UserMeResponse;
        const currentStatus = data?.credits?.subscriptionStatus;
        const currentSubscriptionId = data?.credits?.subscriptionId ?? null;
        const total = Number(data?.credits?.total);

        const activated =
          currentStatus === 'pro' &&
          (!subscriptionId || !currentSubscriptionId || currentSubscriptionId === subscriptionId);

        if (activated && !cancelled) {
          setStatus('active');
          setMessage('Pro subscription is active. Monthly credits are now available.');
          emitCreditsUpdated({ total: Number.isFinite(total) ? total : undefined });
          return;
        }

        if (attempts >= maxAttempts && !cancelled) {
          setStatus('timeout');
          setMessage('Subscription created, but activation is still pending. Please refresh in a moment.');
          return;
        }

        scheduleNextCheck();
      } catch {
        if (attempts >= maxAttempts && !cancelled) {
          setStatus('error');
          setMessage('Unable to confirm subscription status right now. Please check your account page.');
          return;
        }
        scheduleNextCheck();
      }
    }

    void checkStatus();

    return () => {
      cancelled = true;
    };
  }, [subscriptionId]);

  return (
    <section className="card stack-md">
      <h1>Subscription request received</h1>
      <p>{message}</p>
      {subscriptionId ? <p className="hint">Subscription ID: {subscriptionId}</p> : null}
      <p className="hint">Status: {status}</p>
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
