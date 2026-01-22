-- Views
create or replace view public.v_app_staff_list as
select
  s.id as staff_id,
  s.branch_id,
  s.full_name,
  s.email,
  s.phone,
  s.status,
  s.created_at,
  s.updated_at
from public.staff s;

create or replace view public.v_app_staff_detail as
select
  s.id as staff_id,
  s.branch_id,
  s.full_name,
  s.email,
  s.phone,
  s.status,
  s.created_at,
  s.updated_at
from public.staff s;

create or replace view public.v_app_staff_availability as
select
  sa.id as availability_id,
  s.branch_id,
  sa.staff_id,
  sa.weekday,
  sa.start_time,
  sa.end_time,
  sa.is_active
from public.staff_availability sa
join public.staff s on s.id = sa.staff_id;

create or replace view public.v_app_branch_services as
select
  b.id as branch_id,
  s.id as service_id,
  s.name as service_name,
  s.duration_min,
  s.price_base,
  s.is_active,
  coalesce(bs.is_enabled, false) as is_enabled,
  coalesce(bs.is_available, false) as is_available
from public.branch b
cross join public.service s
left join public.branch_service bs
  on bs.branch_id = b.id
 and bs.service_id = s.id;

create or replace view public.v_app_users_list as
select
  ubr.user_id,
  ubr.branch_id,
  b.name as branch_name,
  p.full_name,
  p.email,
  ubr.role,
  ubr.can_manage_agenda,
  ubr.can_manage_payments,
  ubr.can_manage_stock,
  ubr.is_active
from public.user_branch_role ubr
join public.profiles p on p.user_id = ubr.user_id
join public.branch b on b.id = ubr.branch_id;

-- Invites table
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branch(id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null,
  can_manage_agenda boolean not null default false,
  can_manage_payments boolean not null default false,
  can_manage_stock boolean not null default false,
  token text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invites enable row level security;

create policy "invites_select" on public.invites
for select
using (
  public.is_superadmin()
  or exists (
    select 1
    from public.user_branch_role ubr
    where ubr.user_id = auth.uid()
      and ubr.branch_id = invites.branch_id
      and ubr.role = 'admin'
      and ubr.is_active = true
  )
);

create policy "invites_insert" on public.invites
for insert
with check (
  public.is_superadmin()
  or exists (
    select 1
    from public.user_branch_role ubr
    where ubr.user_id = auth.uid()
      and ubr.branch_id = invites.branch_id
      and ubr.role = 'admin'
      and ubr.is_active = true
  )
);

create policy "invites_update" on public.invites
for update
using (
  public.is_superadmin()
  or exists (
    select 1
    from public.user_branch_role ubr
    where ubr.user_id = auth.uid()
      and ubr.branch_id = invites.branch_id
      and ubr.role = 'admin'
      and ubr.is_active = true
  )
)
with check (
  public.is_superadmin()
  or exists (
    select 1
    from public.user_branch_role ubr
    where ubr.user_id = auth.uid()
      and ubr.branch_id = invites.branch_id
      and ubr.role = 'admin'
      and ubr.is_active = true
  )
);

-- RPCs
create or replace function public.rpc_create_staff(
  p_branch_id uuid,
  p_full_name text,
  p_email text default null,
  p_phone text default null
)
returns uuid
language plpgsql
as $$
declare
  v_staff_id uuid;
begin
  if not (public.is_superadmin() or exists (
    select 1
    from public.user_branch_role ubr
    where ubr.user_id = auth.uid()
      and ubr.branch_id = p_branch_id
      and ubr.role = 'admin'
      and ubr.is_active = true
  )) then
    raise exception 'permission_denied';
  end if;

  perform 1 from public.branch b where b.id = p_branch_id and b.status = 'active';
  if not found then
    raise exception 'branch_not_found_or_inactive';
  end if;

  insert into public.staff (
    branch_id,
    full_name,
    email,
    phone,
    status
  ) values (
    p_branch_id,
    p_full_name,
    p_email,
    p_phone,
    'active'
  ) returning id into v_staff_id;

  return v_staff_id;
end;
$$;

create or replace function public.rpc_update_staff(
  p_staff_id uuid,
  p_branch_id uuid,
  p_full_name text default null,
  p_email text default null,
  p_phone text default null,
  p_status text default null
)
returns void
language plpgsql
as $$
begin
  if not (public.is_superadmin() or exists (
    select 1
    from public.user_branch_role ubr
    where ubr.user_id = auth.uid()
      and ubr.branch_id = p_branch_id
      and ubr.role = 'admin'
      and ubr.is_active = true
  )) then
    raise exception 'permission_denied';
  end if;

  perform 1
  from public.staff s
  where s.id = p_staff_id
    and s.branch_id = p_branch_id;

  if not found then
    raise exception 'staff_not_found';
  end if;

  if p_status is not null and p_status not in ('active', 'inactive') then
    raise exception 'invalid_status';
  end if;

  update public.staff
  set
    full_name = coalesce(p_full_name, full_name),
    email = coalesce(p_email, email),
    phone = coalesce(p_phone, phone),
    status = coalesce(p_status, status),
    updated_at = now()
  where id = p_staff_id
    and branch_id = p_branch_id;
end;
$$;

create or replace function public.rpc_set_staff_availability(
  p_staff_id uuid,
  p_branch_id uuid,
  p_availability jsonb
)
returns void
language plpgsql
as $$
declare
  v_overlap boolean;
begin
  if not (public.is_superadmin() or exists (
    select 1
    from public.user_branch_role ubr
    where ubr.user_id = auth.uid()
      and ubr.branch_id = p_branch_id
      and ubr.role = 'admin'
      and ubr.is_active = true
  )) then
    raise exception 'permission_denied';
  end if;

  perform 1
  from public.staff s
  where s.id = p_staff_id
    and s.branch_id = p_branch_id;

  if not found then
    raise exception 'staff_not_found';
  end if;

  -- validate start/end
  if exists (
    select 1
    from jsonb_to_recordset(p_availability) as x(weekday int, start_time time, end_time time, is_active boolean)
    where x.is_active = true and (x.start_time is null or x.end_time is null or x.start_time >= x.end_time)
  ) then
    raise exception 'invalid_time_range';
  end if;

  select exists (
    select 1
    from (
      select *
      from jsonb_to_recordset(p_availability) with ordinality as x(weekday int, start_time time, end_time time, is_active boolean, ord int)
    ) a
    join (
      select *
      from jsonb_to_recordset(p_availability) with ordinality as x(weekday int, start_time time, end_time time, is_active boolean, ord int)
    ) b
      on a.weekday = b.weekday
     and a.is_active = true
     and b.is_active = true
     and a.ord < b.ord
     and a.start_time < b.end_time
     and b.start_time < a.end_time
  ) into v_overlap;

  if v_overlap then
    raise exception 'overlapping_availability';
  end if;

  delete from public.staff_availability where staff_id = p_staff_id;

  insert into public.staff_availability (staff_id, weekday, start_time, end_time, is_active)
  select
    p_staff_id,
    x.weekday,
    x.start_time,
    x.end_time,
    coalesce(x.is_active, true)
  from jsonb_to_recordset(p_availability) as x(weekday int, start_time time, end_time time, is_active boolean);
end;
$$;

create or replace function public.rpc_set_branch_service_state(
  p_branch_id uuid,
  p_service_id uuid,
  p_is_enabled boolean,
  p_is_available boolean
)
returns void
language plpgsql
as $$
begin
  if not (public.is_superadmin() or exists (
    select 1
    from public.user_branch_role ubr
    where ubr.user_id = auth.uid()
      and ubr.branch_id = p_branch_id
      and ubr.role = 'admin'
      and ubr.is_active = true
  )) then
    raise exception 'permission_denied';
  end if;

  perform 1 from public.branch b where b.id = p_branch_id and b.status = 'active';
  if not found then
    raise exception 'branch_not_found_or_inactive';
  end if;

  perform 1 from public.service s where s.id = p_service_id and s.is_active = true;
  if not found then
    raise exception 'service_not_active';
  end if;

  insert into public.branch_service (
    branch_id,
    service_id,
    is_enabled,
    is_available
  ) values (
    p_branch_id,
    p_service_id,
    p_is_enabled,
    p_is_available
  )
  on conflict (branch_id, service_id)
  do update set
    is_enabled = excluded.is_enabled,
    is_available = excluded.is_available,
    updated_at = now();
end;
$$;

create or replace function public.rpc_create_invite(
  p_branch_id uuid,
  p_email text,
  p_role public.user_role,
  p_can_manage_agenda boolean,
  p_can_manage_payments boolean,
  p_can_manage_stock boolean,
  p_full_name text default null
)
returns table(invite_id uuid, token text)
language plpgsql
as $$
declare
  v_token text;
begin
  if p_role not in ('admin', 'seller') then
    raise exception 'invalid_role';
  end if;

  if not (public.is_superadmin() or exists (
    select 1
    from public.user_branch_role ubr
    where ubr.user_id = auth.uid()
      and ubr.branch_id = p_branch_id
      and ubr.role = 'admin'
      and ubr.is_active = true
  )) then
    raise exception 'permission_denied';
  end if;

  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'email_required';
  end if;

  v_token := replace(gen_random_uuid()::text, '-', '');

  insert into public.invites (
    branch_id,
    email,
    full_name,
    role,
    can_manage_agenda,
    can_manage_payments,
    can_manage_stock,
    token,
    expires_at
  ) values (
    p_branch_id,
    lower(trim(p_email)),
    p_full_name,
    p_role,
    p_can_manage_agenda,
    p_can_manage_payments,
    p_can_manage_stock,
    v_token,
    now() + interval '7 days'
  ) returning id, token into invite_id, token;

  return;
end;
$$;

create or replace function public.rpc_accept_invite(
  p_token text,
  p_full_name text default null
)
returns void
language plpgsql
security definer
set search_path = public, auth
set row_security = off
as $$
declare
  v_invite record;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_invite
  from public.invites i
  where i.token = p_token
    and i.used_at is null
    and i.expires_at > now();

  if not found then
    raise exception 'invalid_or_expired_invite';
  end if;

  select email into v_email
  from auth.users
  where id = auth.uid();

  if v_email is null or lower(v_email) <> v_invite.email then
    raise exception 'email_mismatch';
  end if;

  insert into public.profiles (user_id, email, full_name)
  values (auth.uid(), v_email, coalesce(p_full_name, v_invite.full_name))
  on conflict (user_id) do update
  set full_name = coalesce(excluded.full_name, profiles.full_name),
      email = coalesce(excluded.email, profiles.email),
      updated_at = now();

  insert into public.user_branch_role (
    user_id,
    branch_id,
    role,
    can_manage_agenda,
    can_manage_payments,
    can_manage_stock,
    is_active
  ) values (
    auth.uid(),
    v_invite.branch_id,
    v_invite.role,
    v_invite.can_manage_agenda,
    v_invite.can_manage_payments,
    v_invite.can_manage_stock,
    true
  )
  on conflict (user_id, branch_id) do update
  set role = excluded.role,
      can_manage_agenda = excluded.can_manage_agenda,
      can_manage_payments = excluded.can_manage_payments,
      can_manage_stock = excluded.can_manage_stock,
      is_active = true,
      updated_at = now();

  update public.invites
  set used_at = now(),
      updated_at = now()
  where id = v_invite.id;
end;
$$;

create or replace function public.rpc_update_user_branch_role(
  p_user_id uuid,
  p_branch_id uuid,
  p_role public.user_role,
  p_can_manage_agenda boolean,
  p_can_manage_payments boolean,
  p_can_manage_stock boolean,
  p_is_active boolean
)
returns void
language plpgsql
as $$
begin
  if p_role not in ('admin', 'seller') then
    raise exception 'invalid_role';
  end if;

  if not (public.is_superadmin() or exists (
    select 1
    from public.user_branch_role ubr
    where ubr.user_id = auth.uid()
      and ubr.branch_id = p_branch_id
      and ubr.role = 'admin'
      and ubr.is_active = true
  )) then
    raise exception 'permission_denied';
  end if;

  update public.user_branch_role
  set role = p_role,
      can_manage_agenda = p_can_manage_agenda,
      can_manage_payments = p_can_manage_payments,
      can_manage_stock = p_can_manage_stock,
      is_active = p_is_active,
      updated_at = now()
  where user_id = p_user_id
    and branch_id = p_branch_id;
end;
$$;
