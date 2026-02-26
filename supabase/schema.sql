create schema if not exists avr;

create extension if not exists pgcrypto;

-- Keep PostgREST aware of custom schema `avr`.
do $$
begin
  execute 'alter role authenticator set pgrst.db_schemas = ''public,storage,graphql_public,avr''';
  perform pg_notify('pgrst', 'reload config');
exception
  when others then
    raise notice 'Skip PostgREST schema config, set `avr` in Dashboard -> Settings -> API -> Exposed schemas.';
end;
$$;

create table if not exists avr.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists avr.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'rewriter_modal',
  created_at timestamptz not null default now()
);

create table if not exists avr.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists avr.rewrite_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  anon_key text,
  input_text text not null,
  role text not null,
  tone text,
  seniority text not null,
  provider text not null check (provider in ('openrouter', 'local')),
  model text,
  weak_matches text[] not null default '{}',
  suggestions text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists avr.rewrite_results (
  id uuid primary key default gen_random_uuid(),
  rewrite_job_id uuid not null references avr.rewrite_jobs(id) on delete cascade,
  tone text not null,
  action_verb text not null,
  rewritten_bullet text not null,
  why_better text not null,
  quantification_hint text not null,
  created_at timestamptz not null default now()
);

create table if not exists avr.user_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  free_credits integer not null default 0,
  purchased_credits integer not null default 0,
  subscription_credits integer not null default 0,
  subscription_status text not null default 'free' check (subscription_status in ('free', 'pending', 'pro', 'cancelled')),
  subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists avr.credit_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id text not null,
  credits_amount integer not null check (credits_amount > 0),
  price_usd numeric(10, 2) not null check (price_usd > 0),
  paypal_order_id text not null unique,
  paypal_capture_id text,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists avr.user_daily_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  request_count integer not null default 0 check (request_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, usage_date)
);

create table if not exists avr.anon_daily_usage (
  id uuid primary key default gen_random_uuid(),
  anon_key text not null,
  usage_date date not null,
  request_count integer not null default 0 check (request_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (anon_key, usage_date)
);

create table if not exists avr.paypal_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  resource_id text,
  processing_status text not null default 'pending' check (processing_status in ('pending', 'processed', 'failed')),
  process_error text,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create or replace function avr.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_profiles_updated_at on avr.profiles;
create trigger touch_profiles_updated_at
before update on avr.profiles
for each row execute function avr.touch_updated_at();

drop trigger if exists touch_user_credits_updated_at on avr.user_credits;
create trigger touch_user_credits_updated_at
before update on avr.user_credits
for each row execute function avr.touch_updated_at();

drop trigger if exists touch_user_daily_usage_updated_at on avr.user_daily_usage;
create trigger touch_user_daily_usage_updated_at
before update on avr.user_daily_usage
for each row execute function avr.touch_updated_at();

drop trigger if exists touch_anon_daily_usage_updated_at on avr.anon_daily_usage;
create trigger touch_anon_daily_usage_updated_at
before update on avr.anon_daily_usage
for each row execute function avr.touch_updated_at();

create index if not exists rewrite_jobs_user_created_idx
  on avr.rewrite_jobs (user_id, created_at desc);
create index if not exists rewrite_jobs_anon_created_idx
  on avr.rewrite_jobs (anon_key, created_at desc);
create index if not exists rewrite_results_job_idx
  on avr.rewrite_results (rewrite_job_id);
create index if not exists credit_purchases_user_created_idx
  on avr.credit_purchases (user_id, created_at desc);
create index if not exists credit_purchases_order_idx
  on avr.credit_purchases (paypal_order_id);
create index if not exists user_credits_subscription_idx
  on avr.user_credits (subscription_id)
  where subscription_id is not null;
create index if not exists webhook_events_resource_idx
  on avr.paypal_webhook_events (resource_id, received_at desc);

grant usage on schema avr to anon, authenticated, service_role;
grant all privileges on all tables in schema avr to service_role;
grant all privileges on all sequences in schema avr to service_role;
grant all privileges on all routines in schema avr to service_role;

alter default privileges in schema avr grant all privileges on tables to service_role;
alter default privileges in schema avr grant all privileges on sequences to service_role;
alter default privileges in schema avr grant all privileges on routines to service_role;

alter table avr.profiles enable row level security;
alter table avr.rewrite_jobs enable row level security;
alter table avr.rewrite_results enable row level security;
alter table avr.leads enable row level security;
alter table avr.analytics_events enable row level security;
alter table avr.user_credits enable row level security;
alter table avr.credit_purchases enable row level security;
alter table avr.user_daily_usage enable row level security;
alter table avr.anon_daily_usage enable row level security;
alter table avr.paypal_webhook_events enable row level security;

drop policy if exists "profiles owner read" on avr.profiles;
drop policy if exists "profiles owner upsert" on avr.profiles;
drop policy if exists "profiles owner update" on avr.profiles;
drop policy if exists "jobs owner read" on avr.rewrite_jobs;
drop policy if exists "results owner read" on avr.rewrite_results;
drop policy if exists "credits owner read" on avr.user_credits;
drop policy if exists "purchases owner read" on avr.credit_purchases;
drop policy if exists "user usage owner read" on avr.user_daily_usage;

create policy "profiles owner read" on avr.profiles
  for select using (auth.uid() = user_id);

create policy "profiles owner upsert" on avr.profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles owner update" on avr.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "jobs owner read" on avr.rewrite_jobs
  for select using (auth.uid() = user_id);

create policy "results owner read" on avr.rewrite_results
  for select using (
    exists (
      select 1
      from avr.rewrite_jobs jobs
      where jobs.id = rewrite_results.rewrite_job_id
      and jobs.user_id = auth.uid()
    )
  );

create policy "credits owner read" on avr.user_credits
  for select using (auth.uid() = user_id);

create policy "purchases owner read" on avr.credit_purchases
  for select using (auth.uid() = user_id);

create policy "user usage owner read" on avr.user_daily_usage
  for select using (auth.uid() = user_id);

-- leads, analytics_events, anon_daily_usage, and paypal_webhook_events are service-role only.
