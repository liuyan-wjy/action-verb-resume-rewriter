'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { CREDITS_UPDATED_EVENT } from '@/lib/credits-events';

interface UserMeResponse {
  credits?: {
    total?: number;
  };
}

export function AuthButton() {
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!supabase);
  const [totalCredits, setTotalCredits] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);

  const refreshCredits = useCallback(async () => {
    setCreditsLoading(true);

    try {
      const response = await fetch('/api/user/me', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });

      if (!response.ok) {
        if (response.status === 401) {
          setTotalCredits(null);
        }
        return;
      }

      const data = (await response.json()) as UserMeResponse;
      const total = Number(data?.credits?.total);
      setTotalCredits(Number.isFinite(total) ? total : 0);
    } catch {
      setTotalCredits(null);
    } finally {
      setCreditsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth
      .getUser()
      .then(({ data }) => {
        const currentUser = data.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          void refreshCredits();
        } else {
          setTotalCredits(null);
        }
        setReady(true);
      })
      .catch(() => setReady(true));

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        void refreshCredits();
      } else {
        setTotalCredits(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, refreshCredits]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const timer = window.setInterval(() => {
      void refreshCredits();
    }, 45000);

    return () => window.clearInterval(timer);
  }, [user, refreshCredits]);

  useEffect(() => {
    function handleCreditsUpdated(event: Event) {
      const customEvent = event as CustomEvent<{ total?: number }>;
      const total = Number(customEvent.detail?.total);
      if (Number.isFinite(total)) {
        setTotalCredits(total);
      }
      void refreshCredits();
    }

    window.addEventListener(CREDITS_UPDATED_EVENT, handleCreditsUpdated as EventListener);

    return () => {
      window.removeEventListener(CREDITS_UPDATED_EVENT, handleCreditsUpdated as EventListener);
    };
  }, [refreshCredits]);

  async function handleLogin() {
    if (!supabase) return;

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }

  if (!ready) {
    return <span className="auth-muted">Auth...</span>;
  }

  if (!supabase) {
    return <span className="auth-muted">Auth disabled</span>;
  }

  if (!user) {
    return (
      <button className="btn-secondary auth-btn" type="button" onClick={handleLogin}>
        Sign in
      </button>
    );
  }

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Account';
  const showLowCredits = typeof totalCredits === 'number' && totalCredits <= 3;
  const creditsLabel = creditsLoading && totalCredits === null ? 'Credits...' : `${totalCredits ?? '--'} credits`;

  return (
    <div className="auth-wrap">
      <Link href="/account" className={`credit-pill${showLowCredits ? ' credit-pill-low' : ''}`}>
        {creditsLabel}
      </Link>
      <Link href="/account" className="btn-secondary auth-btn">
        {displayName}
      </Link>
      <button className="btn-secondary auth-btn" type="button" onClick={handleLogout}>
        Sign out
      </button>
    </div>
  );
}
