import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureUserCredits, getDailyLimits, getUserCredits, getUserDailyUsage, getToday } from '@/lib/supabase/billing';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await ensureUserCredits(user.id);
    const credits = await getUserCredits(user.id);
    const usageDate = getToday();
    const dailyUsed = await getUserDailyUsage(user.id, usageDate);
    const limits = getDailyLimits();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null
      },
      credits: {
        free: credits.free_credits,
        purchased: credits.purchased_credits,
        subscription: credits.subscription_credits,
        total: credits.free_credits + credits.purchased_credits + credits.subscription_credits,
        subscriptionStatus: credits.subscription_status,
        subscriptionId: credits.subscription_id
      },
      quota: {
        date: usageDate,
        dailyLimit: limits.user,
        dailyUsed,
        dailyRemaining: Math.max(0, limits.user - dailyUsed)
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
