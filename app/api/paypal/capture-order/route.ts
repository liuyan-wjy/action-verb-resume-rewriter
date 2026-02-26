import { NextRequest, NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal/client';
import { createClient } from '@/lib/supabase/server';
import { completePurchase, ensureUserCredits, getPendingPurchase, getUserCredits } from '@/lib/supabase/billing';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { orderId?: string };
    if (!body.orderId) {
      return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });
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

    const pending = await getPendingPurchase(user.id, body.orderId);

    if (pending.payment_status === 'completed') {
      const credits = await getUserCredits(user.id);
      return NextResponse.json({
        success: true,
        message: 'Order already captured.',
        credits: {
          free: credits.free_credits,
          purchased: credits.purchased_credits,
          subscription: credits.subscription_credits,
          total: credits.free_credits + credits.purchased_credits + credits.subscription_credits
        }
      });
    }

    const capture = await captureOrder(body.orderId);
    if (capture.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Payment not completed.' }, { status: 400 });
    }

    await completePurchase({
      userId: user.id,
      purchaseId: pending.id,
      paypalOrderId: body.orderId,
      paypalCaptureId: capture.captureId ?? null,
      creditsToAdd: pending.credits_amount
    });

    const credits = await getUserCredits(user.id);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${pending.credits_amount} credits.`,
      credits: {
        free: credits.free_credits,
        purchased: credits.purchased_credits,
        subscription: credits.subscription_credits,
        total: credits.free_credits + credits.purchased_credits + credits.subscription_credits
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to capture order.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
