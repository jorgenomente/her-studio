-- Client detail view (metrics)
create or replace view public.v_app_client_detail as
select
  c.id as client_id,
  c.home_branch_id as branch_id,
  c.full_name,
  c.phone,
  c.email,
  c.created_at,
  c.updated_at,
  v.last_visit_at,
  coalesce(v.visits_count, 0) as visits_count,
  coalesce(s.total_spent, 0) as total_spent
from public.client c
left join (
  select
    a.client_id,
    max(a.start_at) as last_visit_at,
    count(*) as visits_count
  from public.appointment a
  where a.client_id is not null
  group by a.client_id
) v on v.client_id = c.id
left join (
  select
    p.client_id,
    coalesce(sum(p.amount), 0) as total_spent
  from public.payment p
  where p.client_id is not null
  group by p.client_id
) s on s.client_id = c.id
where c.home_branch_id is not null;

-- Client appointments history
create or replace view public.v_app_client_appointments as
select
  a.id as appointment_id,
  a.branch_id,
  a.client_id,
  a.start_at,
  a.end_at,
  a.status,
  a.service_id,
  sv.name as service_name,
  a.staff_id,
  st.full_name as staff_name
from public.appointment a
join public.service sv on sv.id = a.service_id
join public.staff st on st.id = a.staff_id
where a.client_id is not null;

-- Client payments history + marketing fields
create or replace view public.v_app_client_payments as
select
  p.id as payment_id,
  p.branch_id,
  p.client_id,
  p.appointment_id,
  p.amount,
  p.method,
  p.paid_at,
  ps.source,
  ps.is_recurrent,
  ps.referred_by
from public.payment p
left join public.payment_source ps on ps.payment_id = p.id
where p.client_id is not null;
