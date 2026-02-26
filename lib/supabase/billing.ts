import { createHash } from 'node:crypto';
import { PRO_PLAN } from '@/lib/config/billing';
import { createServiceClient } from '@/lib/supabase/server';

const MAX_CAS_RETRIES = 6;
const USER_QUOTA_ERROR = 'Daily free quota reached. Upgrade to Pro or buy credits.';
const ANON_QUOTA_ERROR = 'Anonymous daily quota reached. Sign in or upgrade to continue.';

export interface UserCredits {
  user_id: string;
  free_credits: number;
  purchased_credits: number;
  subscription_credits: number;
  subscription_status: 'free' | 'pending' | 'pro' | 'cancelled';
  subscription_id: string | null;
}

export function getDailyLimits() {
  const user = Number(process.env.FREE_DAILY_LIMIT ?? 10);
  const anonymous = Number(process.env.ANON_DAILY_LIMIT ?? 5);

  return {
    user: Number.isFinite(user) ? user : 10,
    anonymous: Number.isFinite(anonymous) ? anonymous : 5
  };
}

export function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function deriveAnonKey(ip: string | null, userAgent: string | null) {
  const value = `${ip ?? 'unknown'}|${userAgent ?? 'unknown'}`;
  return createHash('sha256').update(value).digest('hex').slice(0, 24);
}

export async function ensureUserCredits(userId: string) {
  const supabase = createServiceClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from('user_credits').upsert(
    {
      user_id: userId
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function getUserCredits(userId: string): Promise<UserCredits> {
  const supabase = createServiceClient();
  if (!supabase) {
    return {
      user_id: userId,
      free_credits: 0,
      purchased_credits: 0,
      subscription_credits: 0,
      subscription_status: 'free',
      subscription_id: null
    };
  }

  const { data, error } = await supabase
    .from('user_credits')
    .select('user_id, free_credits, purchased_credits, subscription_credits, subscription_status, subscription_id')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to load user credits.');
  }

  return data as UserCredits;
}

export async function consumePurchasedCreditIfAvailable(userId: string): Promise<{ consumed: boolean; remaining: number }> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { consumed: false, remaining: 0 };
  }

  for (let attempt = 0; attempt < MAX_CAS_RETRIES; attempt += 1) {
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('purchased_credits')
      .eq('user_id', userId)
      .single();

    if (creditsError || !credits) {
      throw new Error(creditsError?.message ?? 'Failed to read user credits.');
    }

    if (credits.purchased_credits <= 0) {
      return { consumed: false, remaining: 0 };
    }

    const next = credits.purchased_credits - 1;
    const { data: updated, error: updateError } = await supabase
      .from('user_credits')
      .update({
        purchased_credits: next,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('purchased_credits', credits.purchased_credits)
      .select('purchased_credits')
      .maybeSingle();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (updated) {
      return { consumed: true, remaining: updated.purchased_credits };
    }
  }

  throw new Error('Failed to consume purchased credits due to concurrent updates.');
}

export async function consumeSubscriptionCreditIfAvailable(userId: string): Promise<{ consumed: boolean; remaining: number }> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { consumed: false, remaining: 0 };
  }

  for (let attempt = 0; attempt < MAX_CAS_RETRIES; attempt += 1) {
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('subscription_credits, subscription_status')
      .eq('user_id', userId)
      .single();

    if (creditsError || !credits) {
      throw new Error(creditsError?.message ?? 'Failed to read subscription credits.');
    }

    if (credits.subscription_status !== 'pro' || credits.subscription_credits <= 0) {
      return { consumed: false, remaining: 0 };
    }

    const next = credits.subscription_credits - 1;
    const { data: updated, error: updateError } = await supabase
      .from('user_credits')
      .update({
        subscription_credits: next,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('subscription_credits', credits.subscription_credits)
      .select('subscription_credits')
      .maybeSingle();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (updated) {
      return { consumed: true, remaining: updated.subscription_credits };
    }
  }

  throw new Error('Failed to consume subscription credits due to concurrent updates.');
}

export async function getUserDailyUsage(userId: string, usageDate: string): Promise<number> {
  const supabase = createServiceClient();
  if (!supabase) {
    return 0;
  }

  const { data, error } = await supabase
    .from('user_daily_usage')
    .select('request_count')
    .eq('user_id', userId)
    .eq('usage_date', usageDate)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.request_count ?? 0;
}

export async function incrementUserDailyUsage(userId: string, usageDate: string, maxLimit?: number): Promise<number> {
  const supabase = createServiceClient();
  if (!supabase) {
    return 1;
  }

  for (let attempt = 0; attempt < MAX_CAS_RETRIES; attempt += 1) {
    const current = await getUserDailyUsage(userId, usageDate);

    if (typeof maxLimit === 'number' && current >= maxLimit) {
      throw new Error(USER_QUOTA_ERROR);
    }

    if (current === 0) {
      const { error } = await supabase.from('user_daily_usage').insert({
        user_id: userId,
        usage_date: usageDate,
        request_count: 1
      });

      if (!error) {
        return 1;
      }

      if (error.code === '23505') {
        continue;
      }

      throw new Error(error.message);
    }

    const nextCount = current + 1;
    const { data: updated, error } = await supabase
      .from('user_daily_usage')
      .update({
        request_count: nextCount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('usage_date', usageDate)
      .eq('request_count', current)
      .select('request_count')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (updated) {
      return updated.request_count;
    }
  }

  throw new Error('Failed to update user usage due to concurrent requests.');
}

export async function getAnonDailyUsage(anonKey: string, usageDate: string): Promise<number> {
  const supabase = createServiceClient();
  if (!supabase) {
    return 0;
  }

  const { data, error } = await supabase
    .from('anon_daily_usage')
    .select('request_count')
    .eq('anon_key', anonKey)
    .eq('usage_date', usageDate)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.request_count ?? 0;
}

export async function incrementAnonDailyUsage(anonKey: string, usageDate: string, maxLimit?: number): Promise<number> {
  const supabase = createServiceClient();
  if (!supabase) {
    return 1;
  }

  for (let attempt = 0; attempt < MAX_CAS_RETRIES; attempt += 1) {
    const current = await getAnonDailyUsage(anonKey, usageDate);

    if (typeof maxLimit === 'number' && current >= maxLimit) {
      throw new Error(ANON_QUOTA_ERROR);
    }

    if (current === 0) {
      const { error } = await supabase.from('anon_daily_usage').insert({
        anon_key: anonKey,
        usage_date: usageDate,
        request_count: 1
      });

      if (!error) {
        return 1;
      }

      if (error.code === '23505') {
        continue;
      }

      throw new Error(error.message);
    }

    const nextCount = current + 1;
    const { data: updated, error } = await supabase
      .from('anon_daily_usage')
      .update({
        request_count: nextCount,
        updated_at: new Date().toISOString()
      })
      .eq('anon_key', anonKey)
      .eq('usage_date', usageDate)
      .eq('request_count', current)
      .select('request_count')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (updated) {
      return updated.request_count;
    }
  }

  throw new Error('Failed to update anonymous usage due to concurrent requests.');
}

export async function createPendingPurchase(params: {
  userId: string;
  packageId: string;
  credits: number;
  price: number;
  paypalOrderId: string;
}) {
  const supabase = createServiceClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from('credit_purchases').insert({
    user_id: params.userId,
    package_id: params.packageId,
    credits_amount: params.credits,
    price_usd: params.price,
    paypal_order_id: params.paypalOrderId,
    payment_status: 'pending'
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getPendingPurchase(userId: string, paypalOrderId: string) {
  const supabase = createServiceClient();
  if (!supabase) {
    throw new Error('Supabase service role is not configured.');
  }

  const { data, error } = await supabase
    .from('credit_purchases')
    .select('id, credits_amount, payment_status')
    .eq('user_id', userId)
    .eq('paypal_order_id', paypalOrderId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Pending purchase not found.');
  }

  return data as { id: string; credits_amount: number; payment_status: string };
}

export async function completePurchase(params: {
  userId: string;
  purchaseId: string;
  paypalOrderId: string;
  paypalCaptureId: string | null;
  creditsToAdd: number;
}) {
  const supabase = createServiceClient();
  if (!supabase) {
    return;
  }

  const { data: updatedPurchase, error: updatePurchaseError } = await supabase
    .from('credit_purchases')
    .update({
      paypal_capture_id: params.paypalCaptureId,
      payment_status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', params.purchaseId)
    .eq('paypal_order_id', params.paypalOrderId)
    .eq('payment_status', 'pending')
    .select('id')
    .maybeSingle();

  if (updatePurchaseError) {
    throw new Error(updatePurchaseError.message);
  }

  if (!updatedPurchase) {
    throw new Error('Purchase already processed.');
  }

  await adjustPurchasedCredits(params.userId, params.creditsToAdd);
}

async function adjustPurchasedCredits(userId: string, delta: number): Promise<number> {
  const supabase = createServiceClient();
  if (!supabase) {
    return 0;
  }

  for (let attempt = 0; attempt < MAX_CAS_RETRIES; attempt += 1) {
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('purchased_credits')
      .eq('user_id', userId)
      .single();

    if (creditsError || !credits) {
      throw new Error(creditsError?.message ?? 'Failed to read user credits.');
    }

    const next = credits.purchased_credits + delta;
    if (next < 0) {
      throw new Error('Insufficient purchased credits.');
    }

    const { data: updated, error: updateError } = await supabase
      .from('user_credits')
      .update({
        purchased_credits: next,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('purchased_credits', credits.purchased_credits)
      .select('purchased_credits')
      .maybeSingle();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (updated) {
      return updated.purchased_credits;
    }
  }

  throw new Error('Failed to update purchased credits due to concurrent updates.');
}

export async function markSubscriptionPending(userId: string, subscriptionId: string) {
  const supabase = createServiceClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from('user_credits')
    .update({
      subscription_id: subscriptionId,
      subscription_status: 'pending',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function syncProfile(params: {
  userId: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}) {
  const supabase = createServiceClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from('profiles').upsert(
    {
      user_id: params.userId,
      email: params.email,
      full_name: params.fullName,
      avatar_url: params.avatarUrl
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function insertWebhookEvent(params: {
  eventId: string;
  eventType: string;
  resourceId: string | null;
  payload: unknown;
}): Promise<{ inserted: boolean }> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { inserted: true };
  }

  const { error } = await supabase.from('paypal_webhook_events').insert({
    event_id: params.eventId,
    event_type: params.eventType,
    resource_id: params.resourceId,
    payload: params.payload,
    processing_status: 'pending'
  });

  if (!error) {
    return { inserted: true };
  }

  if (error.code === '23505') {
    return { inserted: false };
  }

  throw new Error(error.message);
}

export async function finalizeWebhookEvent(params: {
  eventId: string;
  status: 'processed' | 'failed';
  processError?: string | null;
}) {
  const supabase = createServiceClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from('paypal_webhook_events')
    .update({
      processing_status: params.status,
      process_error: params.processError ?? null,
      processed_at: new Date().toISOString()
    })
    .eq('event_id', params.eventId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function activateSubscriptionForUser(params: {
  userId: string;
  subscriptionId: string;
}) {
  const supabase = createServiceClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from('user_credits')
    .update({
      subscription_status: 'pro',
      subscription_id: params.subscriptionId,
      subscription_credits: PRO_PLAN.monthlyCredits,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', params.userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function resetSubscriptionCreditsBySubscriptionId(subscriptionId: string) {
  const supabase = createServiceClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from('user_credits')
    .update({
      subscription_status: 'pro',
      subscription_credits: PRO_PLAN.monthlyCredits,
      updated_at: new Date().toISOString()
    })
    .eq('subscription_id', subscriptionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function cancelSubscriptionBySubscriptionId(subscriptionId: string) {
  const supabase = createServiceClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from('user_credits')
    .update({
      subscription_status: 'cancelled',
      subscription_credits: 0,
      updated_at: new Date().toISOString()
    })
    .eq('subscription_id', subscriptionId);

  if (error) {
    throw new Error(error.message);
  }
}

export { USER_QUOTA_ERROR, ANON_QUOTA_ERROR };
