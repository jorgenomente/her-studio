-- Agenda day view
create or replace view public.v_app_agenda_day as
select
  a.id as appointment_id,
  a.branch_id,
  a.start_at,
  a.end_at,
  a.status,
  a.staff_id,
  s.full_name as staff_name,
  a.service_id,
  sv.name as service_name,
  a.client_id,
  c.full_name as client_name,
  c.phone as client_phone,
  exists (select 1 from public.deposit d where d.appointment_id = a.id) as has_deposit,
  exists (select 1 from public.payment p where p.appointment_id = a.id) as has_payment
from public.appointment a
join public.staff s on s.id = a.staff_id
join public.service sv on sv.id = a.service_id
left join public.client c on c.id = a.client_id;

-- Appointment detail view
create or replace view public.v_app_appointment_detail as
select
  a.id as appointment_id,
  a.branch_id,
  a.start_at,
  a.end_at,
  a.status,
  a.notes,
  a.staff_id,
  s.full_name as staff_name,
  a.service_id,
  sv.name as service_name,
  sv.duration_min as appointment_duration_min,
  a.client_id,
  c.full_name as client_name,
  c.phone as client_phone,
  c.email as client_email,
  d.id as deposit_id,
  d.amount as deposit_amount,
  d.status as deposit_status,
  d.proof_url as deposit_proof_url,
  d.verified_at as deposit_verified_at,
  p.id as payment_id,
  p.amount as payment_amount,
  p.method as payment_method,
  p.paid_at as payment_paid_at,
  r.id as receipt_id,
  r.receipt_number
from public.appointment a
join public.staff s on s.id = a.staff_id
join public.service sv on sv.id = a.service_id
left join public.client c on c.id = a.client_id
left join public.deposit d on d.appointment_id = a.id
left join public.payment p on p.appointment_id = a.id
left join public.receipt r on r.payment_id = p.id;

-- POS views
create or replace view public.v_app_pos_unpaid_appointments as
select
  a.id as appointment_id,
  a.branch_id,
  a.start_at,
  a.end_at,
  a.status,
  a.staff_id,
  s.full_name as staff_name,
  a.service_id,
  sv.name as service_name,
  a.client_id,
  c.full_name as client_name,
  c.phone as client_phone
from public.appointment a
join public.staff s on s.id = a.staff_id
join public.service sv on sv.id = a.service_id
left join public.client c on c.id = a.client_id
left join public.payment p on p.appointment_id = a.id
where a.status = 'completed'
  and p.id is null;

create or replace view public.v_app_pos_payments_day as
select
  p.id as payment_id,
  p.branch_id,
  p.appointment_id,
  p.client_id,
  p.amount,
  p.method,
  p.paid_at
from public.payment p
where p.paid_at::date = current_date;

create or replace view public.v_app_pos_payment_detail as
select
  p.id as payment_id,
  p.branch_id,
  p.appointment_id,
  p.client_id,
  p.amount,
  p.method,
  p.paid_at,
  r.id as receipt_id,
  r.receipt_number,
  ps.id as payment_source_id,
  ps.source as payment_source,
  ps.is_recurrent,
  ps.referred_by
from public.payment p
left join public.receipt r on r.payment_id = p.id
left join public.payment_source ps on ps.payment_id = p.id;

-- Stock snapshot
create or replace view public.v_app_stock_snapshot as
select
  p.branch_id,
  p.id as product_id,
  p.name as product_name,
  p.unit,
  p.stock_min,
  coalesce(sum(
    case
      when sm.movement_type = 'in' then sm.quantity
      when sm.movement_type in ('out', 'waste', 'adjustment') then -sm.quantity
      else 0
    end
  ), 0) as qty_on_hand,
  coalesce(sum(
    case
      when sm.movement_type = 'in' then sm.quantity
      when sm.movement_type in ('out', 'waste', 'adjustment') then -sm.quantity
      else 0
    end
  ), 0) <= p.stock_min as is_low_stock
from public.product p
left join public.stock_movement sm on sm.product_id = p.id
group by p.branch_id, p.id, p.name, p.unit, p.stock_min;

-- Dashboard day
create or replace view public.v_app_dashboard_day as
with appt as (
  select
    a.branch_id,
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
  group by a.branch_id
),
paid as (
  select
    p.branch_id,
    coalesce(sum(p.amount) filter (where p.paid_at::date = current_date), 0) as total_income_day
  from public.payment p
  group by p.branch_id
),
stock as (
  select
    s.branch_id,
    count(*) filter (where s.is_low_stock) as low_stock_count
  from public.v_app_stock_snapshot s
  group by s.branch_id
)
select
  b.id as branch_id,
  coalesce(paid.total_income_day, 0) as total_income_day,
  coalesce(appt.count_appointments_day, 0) as count_appointments_day,
  coalesce(appt.count_no_show_day, 0) as count_no_show_day,
  coalesce(appt.count_cancelled_day, 0) as count_cancelled_day,
  coalesce(appt.count_completed_day, 0) as count_completed_day,
  coalesce(appt.unpaid_count, 0) as unpaid_count,
  coalesce(stock.low_stock_count, 0) as low_stock_count
from public.branch b
left join appt on appt.branch_id = b.id
left join paid on paid.branch_id = b.id
left join stock on stock.branch_id = b.id;

-- Purchases
create or replace view public.v_app_purchases_list as
select
  pu.id as purchase_id,
  pu.branch_id,
  pu.status,
  pu.ordered_at,
  pu.received_at,
  pu.notes,
  count(pi.id) as items_count,
  coalesce(sum(pi.quantity_ordered), 0) as ordered_total_qty
from public.purchase pu
left join public.purchase_item pi on pi.purchase_id = pu.id
group by pu.id, pu.branch_id, pu.status, pu.ordered_at, pu.received_at, pu.notes;

create or replace view public.v_app_purchase_detail as
select
  pu.id as purchase_id,
  pu.branch_id,
  pu.status,
  pu.ordered_at,
  pu.received_at,
  pu.notes,
  pi.id as purchase_item_id,
  pi.product_id,
  pr.name as product_name,
  pi.quantity_ordered,
  pi.quantity_received,
  pi.unit_cost
from public.purchase pu
join public.purchase_item pi on pi.purchase_id = pu.id
join public.product pr on pr.id = pi.product_id;

-- Clients
create or replace view public.v_app_clients_list as
with visits as (
  select
    a.client_id,
    max(a.start_at) as last_visit_at,
    count(*) as visits_count
  from public.appointment a
  where a.client_id is not null
  group by a.client_id
),
spend as (
  select
    p.client_id,
    coalesce(sum(p.amount), 0) as total_spent
  from public.payment p
  where p.client_id is not null
  group by p.client_id
)
select
  c.id as client_id,
  c.home_branch_id as branch_id,
  c.full_name,
  c.phone,
  c.email,
  v.last_visit_at,
  coalesce(v.visits_count, 0) as visits_count,
  coalesce(s.total_spent, 0) as total_spent
from public.client c
left join visits v on v.client_id = c.id
left join spend s on s.client_id = c.id
where c.home_branch_id is not null;
