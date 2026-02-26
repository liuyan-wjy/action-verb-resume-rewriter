# Action Verb Resume Rewriter

## Features

- Bullet Rewriter (3 variations: leadership/execution/impact)
- Weak Verb Detector
- Repetition Checker
- Copy to clipboard
- Local history (last 5 rewrites)
- Lead capture modal (after repeated use)
- Supabase-backed events, leads, and rewrite history
- Google OAuth via Supabase
- PayPal one-time credits + subscription flow
- SEO pages:
  - `/action-verbs-for-resume`
  - `/resume-action-verbs`
  - `/action-verb-examples`
- Legal pages:
  - `/privacy-policy`
  - `/about`
  - `/contact`

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Initialize database schema (Supabase SQL editor):

```sql
-- paste file contents from:
supabase/schema.sql
```

4. Run dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## OpenRouter

Set these values in `.env`:

- `OPENROUTER_API_KEY`
- `OPENROUTER_PRIMARY_MODEL` (default `openai/gpt-4o-mini`)
- `OPENROUTER_FALLBACK_MODEL`
- `OPENROUTER_SITE_URL`
- `OPENROUTER_SITE_NAME`

If `OPENROUTER_API_KEY` is missing, the app uses a local rewrite fallback.

## Supabase Setup

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_SCHEMA` (default `avr`)

Optional limits:
- `FREE_DAILY_LIMIT` (default `10`)
- `ANON_DAILY_LIMIT` (default `5`)

## PayPal Setup

Required:
- `PAYPAL_MODE` (`sandbox` or `production`)
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_PRO_PLAN_ID`
- `PAYPAL_WEBHOOK_ID`

Server routes:
- `POST /api/paypal/create-order`
- `POST /api/paypal/capture-order`
- `POST /api/paypal/create-subscription`
- `POST /api/paypal/webhook`
