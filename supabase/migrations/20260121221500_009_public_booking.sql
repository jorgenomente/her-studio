-- Public booking reads + availability
create or replace function public.rpc_public_list_branches()
returns table(branch_id uuid, name text, address text, timezone text)
language sql
security definer
set search_path = public
set row_security = off
as $$
  select b.id as branch_id,
         b.name,
         b.address,
         b.timezone
  from public.branch b
  where b.status = 'active'
  order by b.name;
$$;

create or replace function public.rpc_public_list_branch_services(
  p_branch_id uuid
)
returns table(
  branch_id uuid,
  service_id uuid,
  service_name text,
  duration_min int,
  price_base numeric,
  is_available boolean
)
language sql
security definer
set search_path = public
set row_security = off
as $$
  select b.id as branch_id,
         s.id as service_id,
         s.name as service_name,
         s.duration_min,
         s.price_base,
         bs.is_available
  from public.branch b
  join public.branch_service bs on bs.branch_id = b.id
  join public.service s on s.id = bs.service_id
  where b.id = p_branch_id
    and b.status = 'active'
    and s.is_active = true
    and bs.is_enabled = true
    and bs.is_available = true
  order by s.name;
$$;

create or replace function public.rpc_public_list_staff(
  p_branch_id uuid
)
returns table(
  staff_id uuid,
  staff_name text
)
language sql
security definer
set search_path = public
set row_security = off
as $$
  select s.id as staff_id,
         s.full_name as staff_name
  from public.staff s
  join public.branch b on b.id = s.branch_id
  where s.branch_id = p_branch_id
    and b.status = 'active'
    and s.status = 'active'
  order by s.full_name;
$$;

create or replace function public.rpc_public_availability_day(
  p_branch_id uuid,
  p_service_id uuid,
  p_date date
)
returns table(
  start_at timestamptz,
  end_at timestamptz,
  staff_id uuid,
  staff_name text
)
language sql
security definer
set search_path = public
set row_security = off
as $$
  with branch_data as (
    select b.id, b.timezone
    from public.branch b
    where b.id = p_branch_id
      and b.status = 'active'
  ),
  service_data as (
    select s.id, s.duration_min
    from public.service s
    join public.branch_service bs on bs.service_id = s.id
    where s.id = p_service_id
      and s.is_active = true
      and bs.branch_id = p_branch_id
      and bs.is_enabled = true
      and bs.is_available = true
  ),
  availability as (
    select s.id as staff_id,
           s.full_name as staff_name,
           sa.start_time,
           sa.end_time,
           bd.timezone,
           sd.duration_min
    from public.staff s
    join public.staff_availability sa on sa.staff_id = s.id
    join branch_data bd on bd.id = s.branch_id
    join service_data sd on true
    where s.branch_id = p_branch_id
      and s.status = 'active'
      and sa.is_active = true
      and sa.weekday = extract(dow from p_date)::int
  ),
  slots as (
    select
      a.staff_id,
      a.staff_name,
      generate_series(
        make_timestamptz(
          extract(year from p_date)::int,
          extract(month from p_date)::int,
          extract(day from p_date)::int,
          extract(hour from a.start_time)::int,
          extract(minute from a.start_time)::int,
          0,
          a.timezone
        ),
        make_timestamptz(
          extract(year from p_date)::int,
          extract(month from p_date)::int,
          extract(day from p_date)::int,
          extract(hour from a.end_time)::int,
          extract(minute from a.end_time)::int,
          0,
          a.timezone
        ) - make_interval(mins => a.duration_min),
        make_interval(mins => a.duration_min)
      ) as start_at,
      a.duration_min
    from availability a
  )
  select
    s.start_at,
    s.start_at + make_interval(mins => s.duration_min) as end_at,
    s.staff_id,
    s.staff_name
  from slots s
  where not exists (
    select 1
    from public.appointment ap
    where ap.staff_id = s.staff_id
      and ap.status in (
        'scheduled',
        'scheduled_deposit_pending',
        'scheduled_deposit_verified',
        'in_progress'
      )
      and ap.start_at < (s.start_at + make_interval(mins => s.duration_min))
      and ap.end_at > s.start_at
  )
  order by s.start_at, s.staff_name;
$$;

insert into storage.buckets (id, name, public)
values ('public-deposits', 'public-deposits', true)
on conflict (id) do nothing;
