import { NextResponse } from 'next/server';
import { createSubscription } from '@/lib/paypal/client';
import { createClient } from '@/lib/supabase/server';
import { ensureUserCredits, getUserCredits, markSubscriptionPending } from '@/lib/supabase/billing';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const planId = process.env.PAYPAL_PRO_PLAN_ID;
    if (!planId) {
      return NextResponse.json({ error: 'PAYPAL_PRO_PLAN_ID is not configured.' }, { status: 500 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
    }

    await ensureUserCredits(user.id);
    const credits = await getUserCredits(user.id);

    if (credits.subscription_status === 'pro') {
      return NextResponse.json(
        {
          error: 'You already have an active Pro subscription.',
          subscriptionId: credits.subscription_id
        },
        { status: 400 }
      );
    }

    const { subscriptionId, approveUrl } = await createSubscription({ userId: user.id, planId });

    if (!approveUrl) {
      return NextResponse.json({ error: 'Failed to get PayPal approval URL.' }, { status: 500 });
    }

    await markSubscriptionPending(user.id, subscriptionId);

    return NextResponse.json({ success: true, subscriptionId, approveUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create subscription.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
