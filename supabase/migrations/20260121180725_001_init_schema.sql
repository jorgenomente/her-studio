create extension if not exists \"pgcrypto\";

-- Core enums
create type public.user_role as enum ('superadmin', 'admin', 'seller');
create type public.appointment_status as enum (
  'scheduled',
  'scheduled_deposit_pending',
  'scheduled_deposit_verified',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);
create type public.deposit_status as enum ('pending', 'verified', 'rejected');
create type public.payment_method as enum ('cash', 'transfer', 'card', 'other');
create type public.purchase_status as enum ('pending', 'received');
create type public.stock_movement_type as enum ('in', 'out', 'waste', 'adjustment');
create type public.payment_source_type as enum (
  'recommendation',
  'instagram',
  'google_maps',
  'walk_in',
  'other'
);

-- Core tables
create table if not exists public.organization (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branch (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organization(id) on delete cascade,
  name text not null,
  address text,
  timezone text not null default 'UTC',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_branch_role (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  branch_id uuid not null references public.branch(id) on delete cascade,
  role public.user_role not null,
  can_manage_agenda boolean not null default false,
  can_manage_payments boolean not null default false,
  can_manage_stock boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, branch_id)
);

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branch(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_availability (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_time < end_time)
);

create table if not exists public.service (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_min integer not null check (duration_min > 0),
  price_base numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branch_service (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branch(id) on delete cascade,
  service_id uuid not null references public.service(id) on delete cascade,
  is_enabled boolean not null default true,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (branch_id, service_id)
);

create table if not exists public.client (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organization(id) on delete cascade,
  home_branch_id uuid references public.branch(id) on delete set null,
  full_name text,
  phone text not null,
  email text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, phone)
);

create table if not exists public.appointment (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branch(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete restrict,
  service_id uuid not null references public.service(id) on delete restrict,
  client_id uuid references public.client(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status public.appointment_status not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_at < end_at)
);

create table if not exists public.deposit (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointment(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  proof_url text,
  status public.deposit_status not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branch(id) on delete cascade,
  appointment_id uuid references public.appointment(id) on delete set null,
  client_id uuid references public.client(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  method public.payment_method not null,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.receipt (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null unique references public.payment(id) on delete cascade,
  receipt_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Stock tables
create table if not exists public.product (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branch(id) on delete cascade,
  name text not null,
  unit text not null,
  stock_min numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recipe (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branch(id) on delete cascade,
  service_id uuid not null references public.service(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (branch_id, service_id)
);

create table if not exists public.recipe_item (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipe(id) on delete cascade,
  product_id uuid not null references public.product(id) on delete restrict,
  quantity numeric(12,2) not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recipe_id, product_id)
);

create table if not exists public.purchase (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branch(id) on delete cascade,
  status public.purchase_status not null default 'pending',
  ordered_at timestamptz not null default now(),
  received_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_item (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchase(id) on delete cascade,
  product_id uuid not null references public.product(id) on delete restrict,
  quantity_ordered numeric(12,2) not null check (quantity_ordered > 0),
  quantity_received numeric(12,2) check (quantity_received >= 0),
  unit_cost numeric(12,2) check (unit_cost >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (purchase_id, product_id)
);

create table if not exists public.stock_movement (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branch(id) on delete cascade,
  product_id uuid not null references public.product(id) on delete restrict,
  movement_type public.stock_movement_type not null,
  quantity numeric(12,2) not null check (quantity > 0),
  reason text,
  appointment_id uuid references public.appointment(id) on delete set null,
  purchase_id uuid references public.purchase(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Analytics
create table if not exists public.payment_source (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null unique references public.payment(id) on delete cascade,
  source public.payment_source_type not null,
  is_recurrent boolean not null default false,
  referred_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
