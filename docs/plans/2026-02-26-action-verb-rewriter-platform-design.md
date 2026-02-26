# Action Verb Rewriter Platform Design (2026-02-26)

## Scope
- Keep existing PRD MVP functionality intact.
- Add Supabase persistence using dedicated schema `avr`.
- Add Google OAuth login via Supabase.
- Add PayPal one-time credit purchases + subscriptions + webhook processing.
- Add legal pages: privacy policy, about, contact.
- Prepare GitHub + Vercel + Cloudflare deployment flow.

## Architecture
- Frontend: Next.js App Router pages and client components.
- Auth: Supabase OAuth (Google) using `/auth/callback`.
- Billing: PayPal server-side API calls from route handlers.
- Persistence: Supabase Postgres tables in schema `avr`.
- Analytics: existing event stream posted to `/api/events`, now persisted when service role key exists.

## Data Model
- `avr.profiles`: OAuth profile metadata.
- `avr.leads`: lead capture emails.
- `avr.analytics_events`: product event stream.
- `avr.rewrite_jobs`: each rewrite request and context.
- `avr.rewrite_results`: generated variations per rewrite.
- `avr.user_credits`: free/purchased/subscription balances.
- `avr.credit_purchases`: one-time purchase lifecycle.
- `avr.user_daily_usage`, `avr.anon_daily_usage`: quota tracking.
- `avr.paypal_webhook_events`: idempotent webhook ingestion log.

## Rewrite Quota Rules
- Logged-in users:
  - consume purchased credits first;
  - then consume subscription credits;
  - otherwise enforce daily free quota.
- Anonymous users:
  - enforce anonymous daily quota.

## Error Handling
- If Supabase service-role env vars are absent, app remains usable with degraded persistence.
- Payment and webhook routes return structured error JSON.
- OAuth callback failures fail-open and redirect safely.

## Security & RLS
- RLS enabled on all tables.
- User-select policies for own profile, usage, credits, purchases, and rewrites.
- Service-role only tables (leads/events/webhook logs) have no anon/authenticated policies.

## Deployment Plan
- GitHub repository initialization and push.
- Vercel deployment with project env variables.
- Domain binding in Vercel; DNS records managed in Cloudflare.
