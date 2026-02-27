import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paypal/client';
import { hasServiceClientConfig } from '@/lib/supabase/server';
import {
  activateSubscriptionForUser,
  cancelSubscriptionBySubscriptionId,
  finalizeWebhookEvent,
  insertWebhookEvent,
  resetSubscriptionCreditsBySubscriptionId
} from '@/lib/supabase/billing';

export const runtime = 'nodejs';

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource?: {
    id?: string;
    custom_id?: string;
    billing_agreement_id?: string;
  };
}

export async function POST(request: NextRequest) {
  let eventId = 'unknown';

  try {
    if (!hasServiceClientConfig()) {
      return NextResponse.json({ error: 'Server billing storage is not configured.' }, { status: 500 });
    }

    const bodyText = await request.text();
    const event = JSON.parse(bodyText) as PayPalWebhookEvent;

    eventId = event.id;
    const eventType = event.event_type;
    const resourceId = event.resource?.id ?? event.resource?.billing_agreement_id ?? null;

    const valid = await verifyWebhookSignature({
      headers: {
        authAlgo: request.headers.get('paypal-auth-algo'),
        certUrl: request.headers.get('paypal-cert-url'),
        transmissionId: request.headers.get('paypal-transmission-id'),
        transmissionSig: request.headers.get('paypal-transmission-sig'),
        transmissionTime: request.headers.get('paypal-transmission-time')
      },
      body: event
    });

    if (!valid) {
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
    }

    const { inserted } = await insertWebhookEvent({
      eventId,
      eventType,
      resourceId,
      payload: event
    });

    if (!inserted) {
      return NextResponse.json({ success: true, duplicate: true });
    }

    try {
      await processWebhookEvent(event);
      await finalizeWebhookEvent({ eventId, status: 'processed' });
    } catch (processError) {
      const processMessage = processError instanceof Error ? processError.message : 'Webhook processing failed.';
      await finalizeWebhookEvent({
        eventId,
        status: 'failed',
        processError: processMessage
      });
      throw processError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook handler error.';
    return NextResponse.json({ error: message, eventId }, { status: 500 });
  }
}

async function processWebhookEvent(event: PayPalWebhookEvent) {
  const eventType = event.event_type;

  if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
    const userId = event.resource?.custom_id;
    const subscriptionId = event.resource?.id;

    if (!userId || !subscriptionId) {
      throw new Error('Missing user or subscription id in BILLING.SUBSCRIPTION.ACTIVATED event.');
    }

    await activateSubscriptionForUser({ userId, subscriptionId });
    return;
  }

  if (eventType === 'PAYMENT.SALE.COMPLETED') {
    const subscriptionId = event.resource?.billing_agreement_id;
    if (!subscriptionId) {
      return;
    }

    await resetSubscriptionCreditsBySubscriptionId(subscriptionId);
    return;
  }

  if (
    eventType === 'BILLING.SUBSCRIPTION.CANCELLED' ||
    eventType === 'BILLING.SUBSCRIPTION.SUSPENDED' ||
    eventType === 'BILLING.SUBSCRIPTION.EXPIRED'
  ) {
    const subscriptionId = event.resource?.id;
    if (!subscriptionId) {
      return;
    }

    await cancelSubscriptionBySubscriptionId(subscriptionId);
  }
}
