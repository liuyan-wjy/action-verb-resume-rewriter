# Vercel + Cloudflare Deploy Runbook

## Domain suggestions
- resumeverb.com
- powerverb.ai
- actionverbtool.com
- resumebullet.ai
- rewritebullet.com

## Vercel deployment
1. Link project:
   - `vercel`
2. Set production env vars in Vercel dashboard:
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_PRIMARY_MODEL`
   - `OPENROUTER_FALLBACK_MODEL`
   - `OPENROUTER_SITE_URL`
   - `OPENROUTER_SITE_NAME`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_SITE_NAME`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_SCHEMA=avr`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FREE_DAILY_LIMIT`
   - `ANON_DAILY_LIMIT`
   - `PAYPAL_MODE`
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_PRO_PLAN_ID`
   - `PAYPAL_WEBHOOK_ID`
3. Deploy production:
   - `vercel deploy --prod -y`

## Domain bind (Vercel)
1. Add domain in Vercel project.
2. Capture required DNS records shown by Vercel:
   - apex/root usually `A` -> `76.76.21.21`
   - www usually `CNAME` -> `cname.vercel-dns.com`

## DNS on Cloudflare
1. In Cloudflare DNS, add exactly the Vercel records.
2. Keep proxy mode DNS-only during first verification (recommended).
3. After SSL issued and domain verified in Vercel, optional: enable proxied mode.

## Supabase schema
- Run `supabase/schema.sql` in Supabase SQL editor.
- Ensure `avr` is exposed in API settings if role update is blocked.

## PayPal webhook
- Endpoint: `https://<your-domain>/api/paypal/webhook`
- Add webhook event types:
  - `BILLING.SUBSCRIPTION.ACTIVATED`
  - `PAYMENT.SALE.COMPLETED`
  - `BILLING.SUBSCRIPTION.CANCELLED`
  - `BILLING.SUBSCRIPTION.SUSPENDED`
  - `BILLING.SUBSCRIPTION.EXPIRED`
