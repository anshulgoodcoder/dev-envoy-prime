
create type api_environment as enum ('sandbox', 'staging', 'production');

create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  environment api_environment not null default 'sandbox',
  key_prefix text not null,
  key_hash text not null,
  expires_at timestamptz,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.api_keys enable row level security;

create policy "users select own keys" on public.api_keys for select using (auth.uid() = user_id);
create policy "users insert own keys" on public.api_keys for insert with check (auth.uid() = user_id);
create policy "users update own keys" on public.api_keys for update using (auth.uid() = user_id);
create policy "users delete own keys" on public.api_keys for delete using (auth.uid() = user_id);

create table public.request_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  api_id text not null,
  method text not null,
  path text not null,
  status int,
  latency_ms int,
  request jsonb,
  created_at timestamptz not null default now()
);

alter table public.request_history enable row level security;

create policy "users select own history" on public.request_history for select using (auth.uid() = user_id);
create policy "users insert own history" on public.request_history for insert with check (auth.uid() = user_id);
create policy "users delete own history" on public.request_history for delete using (auth.uid() = user_id);

create index on public.api_keys (user_id, created_at desc);
create index on public.request_history (user_id, created_at desc);
