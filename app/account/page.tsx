'use client';

import { useEffect, useState } from 'react';

interface MePayload {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
  credits: {
    free: number;
    purchased: number;
    subscription: number;
    total: number;
    subscriptionStatus: string;
    subscriptionId: string | null;
  };
  quota: {
    date: string;
    dailyLimit: number;
    dailyUsed: number;
    dailyRemaining: number;
  };
}

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MePayload | null>(null);

  useEffect(() => {
    fetch('/api/user/me')
      .then(async (response) => {
        const payload = (await response.json()) as MePayload & { error?: string };
        if (!response.ok) {
          throw new Error(payload.error ?? 'Failed to load account.');
        }
        setData(payload);
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Failed to load account.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="stack-xl">
      <section className="card stack-md">
        <h1>Account</h1>
        {loading ? <p>Loading account...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {data ? (
          <div className="stack-sm">
            <p>
              <strong>User:</strong> {data.user.name} ({data.user.email})
            </p>
            <p>
              <strong>Total credits:</strong> {data.credits.total}
            </p>
            <p>
              <strong>Credit breakdown:</strong> free {data.credits.free} / purchased {data.credits.purchased} / subscription{' '}
              {data.credits.subscription}
            </p>
            <p>
              <strong>Subscription:</strong> {data.credits.subscriptionStatus}
            </p>
            <p>
              <strong>Daily quota ({data.quota.date}):</strong> {data.quota.dailyUsed}/{data.quota.dailyLimit} used
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
