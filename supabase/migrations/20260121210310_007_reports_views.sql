-- Dashboard global day (superadmin)
create or replace view public.v_app_dashboard_global_day as
with appt as (
  select
    count(*) filter (where a.status = 'completed' and a.start_at::date = current_date) as count_completed_day,
    count(*) filter (where a.status = 'cancelled' and a.start_at::date = current_date) as count_cancelled_day,
    count(*) filter (where a.status = 'no_show' and a.start_at::date = current_date) as count_no_show_day,
    count(*) filter (where a.start_at::date = current_date) as count_appointments_day,
    count(*) filter (
      where a.status = 'completed'
        and a.start_at::date = current_date
        and not exists (select 1 from public.payment p where p.appointment_id = a.id)
    ) as unpaid_count
  from public.appointment a
),
paid as (
  select coalesce(sum(p.amount) filter (where p.paid_at::date = current_date), 0) as total_income_day
  from public.payment p
),
stock as (
  select count(*) filter (where s.is_low_stock) as low_stock_count
  from public.v_app_stock_snapshot s
)
select
  null::uuid as branch_id,
  coalesce(paid.total_income_day, 0) as total_income_day,
  coalesce(appt.count_appointments_day, 0) as count_appointments_day,
  coalesce(appt.count_no_show_day, 0) as count_no_show_day,
  coalesce(appt.count_cancelled_day, 0) as count_cancelled_day,
  coalesce(appt.count_completed_day, 0) as count_completed_day,
  coalesce(appt.unpaid_count, 0) as unpaid_count,
  coalesce(stock.low_stock_count, 0) as low_stock_count
from appt, paid, stock;

-- Reports views (base aggregations by day)
create or replace view public.v_app_reports_income_by_day as
select
  p.branch_id,
  p.paid_at::date as paid_date,
  count(*) as count,
  coalesce(sum(p.amount), 0) as total_amount
from public.payment p
group by p.branch_id, p.paid_at::date;

create or replace view public.v_app_reports_income_by_method as
select
  p.branch_id,
  p.paid_at::date as paid_date,
  p.method,
  count(*) as count,
  coalesce(sum(p.amount), 0) as total_amount
from public.payment p
group by p.branch_id, p.paid_at::date, p.method;

create or replace view public.v_app_reports_income_by_source as
select
  p.branch_id,
  p.paid_at::date as paid_date,
  ps.source,
  count(*) as count,
  coalesce(sum(p.amount), 0) as total_amount
from public.payment p
left join public.payment_source ps on ps.payment_id = p.id
group by p.branch_id, p.paid_at::date, ps.source;

create or replace view public.v_app_reports_income_recurrent_split as
select
  p.branch_id,
  p.paid_at::date as paid_date,
  ps.is_recurrent,
  count(*) as count,
  coalesce(sum(p.amount), 0) as total_amount
from public.payment p
left join public.payment_source ps on ps.payment_id = p.id
group by p.branch_id, p.paid_at::date, ps.is_recurrent;

create or replace view public.v_app_reports_top_services as
select
  a.branch_id,
  p.paid_at::date as paid_date,
  a.service_id,
  sv.name as service_name,
  count(*) as count,
  coalesce(sum(p.amount), 0) as total_amount
from public.payment p
join public.appointment a on a.id = p.appointment_id
join public.service sv on sv.id = a.service_id
group by a.branch_id, p.paid_at::date, a.service_id, sv.name;
