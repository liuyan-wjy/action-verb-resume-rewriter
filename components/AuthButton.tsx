'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUser(data.user ?? null);
        setReady(true);
      })
      .catch(() => setReady(true));

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

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

  return (
    <div className="auth-wrap">
      <Link href="/account" className="btn-secondary auth-btn">
        {displayName}
      </Link>
      <button className="btn-secondary auth-btn" type="button" onClick={handleLogout}>
        Sign out
      </button>
    </div>
  );
}
