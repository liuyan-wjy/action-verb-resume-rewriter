import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureUserCredits, syncProfile } from '@/lib/supabase/billing';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = normalizeNextPath(requestUrl.searchParams.get('next'));

  try {
    if (code) {
      const supabase = await createClient();
      await supabase.auth.exchangeCodeForSession(code);

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user?.id) {
        await syncProfile({
          userId: user.id,
          email: user.email ?? null,
          fullName: user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null
        });
        await ensureUserCredits(user.id);
      }
    }
  } catch {
    // Ignore callback failures and continue redirect.
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

function normalizeNextPath(raw: string | null): string {
  if (!raw) return '/';

  const value = raw.trim();
  if (!value.startsWith('/')) return '/';
  if (value.startsWith('//')) return '/';
  if (value.includes('\\') || value.includes('\0')) return '/';

  return value;
}
