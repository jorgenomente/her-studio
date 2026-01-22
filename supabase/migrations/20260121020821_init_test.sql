create table if not exists public.migration_smoke_test (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  note text
);
