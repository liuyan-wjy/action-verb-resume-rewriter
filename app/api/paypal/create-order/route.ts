import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal/client';
import { getCreditPackageById } from '@/lib/config/billing';
import { createClient } from '@/lib/supabase/server';
import { createPendingPurchase, ensureUserCredits } from '@/lib/supabase/billing';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { packageId?: string };
    if (!body.packageId) {
      return NextResponse.json({ error: 'packageId is required.' }, { status: 400 });
    }

    const creditPackage = getCreditPackageById(body.packageId);
    if (!creditPackage) {
      return NextResponse.json({ error: 'Invalid package.' }, { status: 400 });
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

    const { orderId, approveUrl } = await createOrder({
      packageId: creditPackage.id,
      credits: creditPackage.credits,
      price: creditPackage.price,
      userId: user.id
    });

    if (!approveUrl) {
      return NextResponse.json({ error: 'Failed to get PayPal approval URL.' }, { status: 500 });
    }

    await createPendingPurchase({
      userId: user.id,
      packageId: creditPackage.id,
      credits: creditPackage.credits,
      price: creditPackage.price,
      paypalOrderId: orderId
    });

    return NextResponse.json({ success: true, orderId, approveUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create PayPal order.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
