interface RateLimitState {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitState>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const state = buckets.get(key);

  if (!state || state.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSec: Math.ceil(windowMs / 1000)
    };
  }

  if (state.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((state.resetAt - now) / 1000))
    };
  }

  state.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - state.count),
    retryAfterSec: Math.max(1, Math.ceil((state.resetAt - now) / 1000))
  };
}
