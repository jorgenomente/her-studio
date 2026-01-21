-- RPC: Public reservation (SECURITY DEFINER, no auth required)
create or replace function public.rpc_public_create_reservation(
  p_branch_id uuid,
  p_service_id uuid,
  p_start_at timestamptz,
  p_full_name text,
  p_phone text,
  p_staff_id uuid default null,
  p_email text default null,
  p_notes text default null,
  p_staff_strategy text default 'any'  -- 'any' | 'explicit'
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
set row_security = off
as $$
declare
  v_branch public.branch%rowtype;
  v_service public.service%rowtype;
  v_branch_service public.branch_service%rowtype;
  v_org_id uuid;
  v_client_id uuid;
  v_staff_id uuid;
  v_end_at timestamptz;
  v_weekday int;
  v_start_time time;
  v_end_time time;
  v_overlap_count int;
  v_has_availability boolean;
  v_appointment_id uuid;
begin
  -- validate branch
  select * into v_branch
  from public.branch
  where id = p_branch_id
    and status = 'active';
  if not found then
    raise exception 'branch_not_found_or_inactive';
  end if;

  -- validate service
  select * into v_service
  from public.service
  where id = p_service_id
    and is_active = true;
  if not found then
    raise exception 'service_not_found_or_inactive';
  end if;

  -- validate branch_service
  select * into v_branch_service
  from public.branch_service
  where branch_id = p_branch_id
    and service_id = p_service_id
    and is_enabled = true
    and is_available = true;
  if not found then
    raise exception 'service_not_enabled_for_branch';
  end if;

  -- validate start_at window
  if p_start_at < (now() - interval '5 minutes')
     or p_start_at > (now() + interval '365 days') then
    raise exception 'start_at_out_of_range';
  end if;

  v_end_at := p_start_at + make_interval(mins => v_service.duration_min);
  v_weekday := extract(dow from p_start_at)::int;
  v_start_time := p_start_at::time;
  v_end_time := v_end_at::time;

  -- resolve staff
  if p_staff_strategy = 'explicit' then
    if p_staff_id is null then
      raise exception 'staff_id_required';
    end if;

    select s.id into v_staff_id
    from public.staff s
    where s.id = p_staff_id
      and s.branch_id = p_branch_id
      and s.status = 'active';

    if v_staff_id is null then
      raise exception 'staff_not_found_or_inactive';
    end if;
  elsif p_staff_strategy = 'any' then
    select s.id
    into v_staff_id
    from public.staff s
    where s.branch_id = p_branch_id
      and s.status = 'active'
      and exists (
        select 1
        from public.staff_availability sa
        where sa.staff_id = s.id
          and sa.is_active = true
          and sa.weekday = v_weekday
          and sa.start_time <= v_start_time
          and sa.end_time >= v_end_time
      )
      and not exists (
        select 1
        from public.appointment a
        where a.staff_id = s.id
          and a.status in ('scheduled', 'scheduled_deposit_pending', 'scheduled_deposit_verified', 'in_progress')
          and a.start_at < v_end_at
          and a.end_at > p_start_at
      )
    order by s.full_name nulls last, s.id
    limit 1;

    if v_staff_id is null then
      raise exception 'no_staff_available';
    end if;
  else
    raise exception 'invalid_staff_strategy';
  end if;

  -- validate availability for explicit staff
  select exists (
    select 1
    from public.staff_availability sa
    where sa.staff_id = v_staff_id
      and sa.is_active = true
      and sa.weekday = v_weekday
      and sa.start_time <= v_start_time
      and sa.end_time >= v_end_time
  ) into v_has_availability;

  if not v_has_availability then
    raise exception 'staff_not_available';
  end if;

  -- validate overlap for explicit staff
  select count(*) into v_overlap_count
  from public.appointment a
  where a.staff_id = v_staff_id
    and a.status in ('scheduled', 'scheduled_deposit_pending', 'scheduled_deposit_verified', 'in_progress')
    and a.start_at < v_end_at
    and a.end_at > p_start_at;

  if v_overlap_count > 0 then
    raise exception 'staff_has_overlap';
  end if;

  v_org_id := v_branch.organization_id;

  -- upsert client by organization_id + phone
  select c.id into v_client_id
  from public.client c
  where c.organization_id = v_org_id
    and c.phone = p_phone;

  if v_client_id is null then
    insert into public.client (
      organization_id,
      home_branch_id,
      full_name,
      phone,
      email
    ) values (
      v_org_id,
      p_branch_id,
      p_full_name,
      p_phone,
      p_email
    )
    returning id into v_client_id;
  else
    update public.client
    set
      full_name = coalesce(p_full_name, full_name),
      email = coalesce(p_email, email),
      home_branch_id = coalesce(home_branch_id, p_branch_id),
      updated_at = now()
    where id = v_client_id;
  end if;

  insert into public.appointment (
    branch_id,
    staff_id,
    service_id,
    client_id,
    start_at,
    end_at,
    status,
    notes
  ) values (
    p_branch_id,
    v_staff_id,
    p_service_id,
    v_client_id,
    p_start_at,
    v_end_at,
    'scheduled',
    p_notes
  )
  returning id into v_appointment_id;

  return v_appointment_id;
end;
$$;

-- RPC: update appointment status
create or replace function public.rpc_update_appointment_status(
  p_appointment_id uuid,
  p_branch_id uuid,
  p_new_status public.appointment_status
)
returns void
language plpgsql
as $$
declare
  v_current_status public.appointment_status;
begin
  if not public.has_permission(p_branch_id, 'agenda') then
    raise exception 'permission_denied';
  end if;

  select status into v_current_status
  from public.appointment
  where id = p_appointment_id
    and branch_id = p_branch_id;

  if v_current_status is null then
    raise exception 'appointment_not_found';
  end if;

  if v_current_status in ('scheduled', 'scheduled_deposit_pending', 'scheduled_deposit_verified') then
    if p_new_status not in ('in_progress', 'completed', 'cancelled', 'no_show') then
      raise exception 'invalid_transition';
    end if;
  elsif v_current_status = 'in_progress' then
    if p_new_status not in ('completed', 'cancelled', 'no_show') then
      raise exception 'invalid_transition';
    end if;
  elsif v_current_status in ('completed', 'cancelled', 'no_show') then
    raise exception 'invalid_transition';
  else
    raise exception 'invalid_transition';
  end if;

  update public.appointment
  set status = p_new_status,
      updated_at = now()
  where id = p_appointment_id
    and branch_id = p_branch_id;
end;
$$;

-- RPC: create or update deposit (staff only)
create or replace function public.rpc_create_or_update_deposit(
  p_appointment_id uuid,
  p_branch_id uuid,
  p_amount numeric,
  p_proof_url text default null
)
returns uuid
language plpgsql
as $$
declare
  v_deposit_id uuid;
begin
  if not public.has_permission(p_branch_id, 'payments') then
    raise exception 'permission_denied';
  end if;

  perform 1
  from public.appointment a
  where a.id = p_appointment_id
    and a.branch_id = p_branch_id;

  if not found then
    raise exception 'appointment_not_found';
  end if;

  select d.id into v_deposit_id
  from public.deposit d
  where d.appointment_id = p_appointment_id;

  if v_deposit_id is null then
    insert into public.deposit (
      appointment_id,
      amount,
      proof_url,
      status,
      verified_at
    ) values (
      p_appointment_id,
      p_amount,
      p_proof_url,
      'pending',
      null
    )
    returning id into v_deposit_id;
  else
    update public.deposit
    set amount = p_amount,
        proof_url = p_proof_url,
        status = 'pending',
        verified_at = null,
        updated_at = now()
    where id = v_deposit_id;
  end if;

  return v_deposit_id;
end;
$$;

-- RPC: verify deposit (staff only)
create or replace function public.rpc_verify_deposit(
  p_deposit_id uuid,
  p_branch_id uuid,
  p_status public.deposit_status
)
returns void
language plpgsql
as $$
declare
  v_appointment_id uuid;
begin
  if not public.has_permission(p_branch_id, 'payments') then
    raise exception 'permission_denied';
  end if;

  select d.appointment_id into v_appointment_id
  from public.deposit d
  join public.appointment a on a.id = d.appointment_id
  where d.id = p_deposit_id
    and a.branch_id = p_branch_id;

  if v_appointment_id is null then
    raise exception 'deposit_not_found';
  end if;

  update public.deposit
  set status = p_status,
      verified_at = case when p_status = 'verified' then now() else null end,
      updated_at = now()
  where id = p_deposit_id;
end;
$$;

-- RPC: create payment for appointment (staff only)
create or replace function public.rpc_create_payment_for_appointment(
  p_branch_id uuid,
  p_appointment_id uuid,
  p_amount numeric,
  p_method public.payment_method,
  p_source public.payment_source_type,
  p_is_recurrent boolean,
  p_client_id uuid default null,
  p_paid_at timestamptz default now(),
  p_referred_by text default null
)
returns uuid
language plpgsql
as $$
declare
  v_payment_id uuid;
begin
  if not public.has_permission(p_branch_id, 'payments') then
    raise exception 'permission_denied';
  end if;

  perform 1
  from public.appointment a
  where a.id = p_appointment_id
    and a.branch_id = p_branch_id;

  if not found then
    raise exception 'appointment_not_found';
  end if;

  select p.id into v_payment_id
  from public.payment p
  where p.appointment_id = p_appointment_id;

  if v_payment_id is not null then
    return v_payment_id;
  end if;

  insert into public.payment (
    branch_id,
    appointment_id,
    client_id,
    amount,
    method,
    paid_at
  ) values (
    p_branch_id,
    p_appointment_id,
    p_client_id,
    p_amount,
    p_method,
    p_paid_at
  )
  returning id into v_payment_id;

  insert into public.receipt (payment_id)
  values (v_payment_id);

  insert into public.payment_source (
    payment_id,
    source,
    is_recurrent,
    referred_by
  ) values (
    v_payment_id,
    p_source,
    p_is_recurrent,
    p_referred_by
  );

  return v_payment_id;
end;
$$;

-- RPC: create walk-in payment (staff only)
create or replace function public.rpc_create_walkin_payment(
  p_branch_id uuid,
  p_amount numeric,
  p_method public.payment_method,
  p_source public.payment_source_type,
  p_is_recurrent boolean,
  p_paid_at timestamptz default now(),
  p_client_phone text default null,
  p_client_full_name text default null,
  p_client_email text default null,
  p_referred_by text default null,
  p_service_id uuid default null
)
returns uuid
language plpgsql
as $$
declare
  v_branch public.branch%rowtype;
  v_client_id uuid;
  v_payment_id uuid;
begin
  if not public.has_permission(p_branch_id, 'payments') then
    raise exception 'permission_denied';
  end if;

  select * into v_branch
  from public.branch
  where id = p_branch_id;

  if not found then
    raise exception 'branch_not_found';
  end if;

  if p_client_phone is not null then
    select c.id into v_client_id
    from public.client c
    where c.organization_id = v_branch.organization_id
      and c.phone = p_client_phone;

    if v_client_id is null then
      insert into public.client (
        organization_id,
        home_branch_id,
        full_name,
        phone,
        email
      ) values (
        v_branch.organization_id,
        p_branch_id,
        p_client_full_name,
        p_client_phone,
        p_client_email
      )
      returning id into v_client_id;
    else
      update public.client
      set
        full_name = coalesce(p_client_full_name, full_name),
        email = coalesce(p_client_email, email),
        home_branch_id = coalesce(home_branch_id, p_branch_id),
        updated_at = now()
      where id = v_client_id;
    end if;
  end if;

  insert into public.payment (
    branch_id,
    appointment_id,
    client_id,
    amount,
    method,
    paid_at
  ) values (
    p_branch_id,
    null,
    v_client_id,
    p_amount,
    p_method,
    p_paid_at
  )
  returning id into v_payment_id;

  insert into public.receipt (payment_id)
  values (v_payment_id);

  insert into public.payment_source (
    payment_id,
    source,
    is_recurrent,
    referred_by
  ) values (
    v_payment_id,
    p_source,
    p_is_recurrent,
    p_referred_by
  );

  return v_payment_id;
end;
$$;

-- RPC: create stock movement (staff only)
create or replace function public.rpc_create_stock_movement(
  p_branch_id uuid,
  p_product_id uuid,
  p_movement_type public.stock_movement_type,
  p_quantity numeric,
  p_reason text default null,
  p_appointment_id uuid default null,
  p_purchase_id uuid default null
)
returns uuid
language plpgsql
as $$
declare
  v_product_branch uuid;
  v_movement_id uuid;
begin
  if not public.has_permission(p_branch_id, 'stock') then
    raise exception 'permission_denied';
  end if;

  select branch_id into v_product_branch
  from public.product
  where id = p_product_id;

  if v_product_branch is null or v_product_branch <> p_branch_id then
    raise exception 'product_branch_mismatch';
  end if;

  if p_quantity <= 0 then
    raise exception 'invalid_quantity';
  end if;

  insert into public.stock_movement (
    branch_id,
    product_id,
    movement_type,
    quantity,
    reason,
    appointment_id,
    purchase_id
  ) values (
    p_branch_id,
    p_product_id,
    p_movement_type,
    p_quantity,
    p_reason,
    p_appointment_id,
    p_purchase_id
  )
  returning id into v_movement_id;

  return v_movement_id;
end;
$$;

-- RPC: create purchase with items (staff only)
create or replace function public.rpc_create_purchase(
  p_branch_id uuid,
  p_items jsonb,
  p_notes text default null
)
returns uuid
language plpgsql
as $$
declare
  v_purchase_id uuid;
  v_count int;
begin
  if not public.has_permission(p_branch_id, 'stock') then
    raise exception 'permission_denied';
  end if;

  insert into public.purchase (
    branch_id,
    status,
    notes
  ) values (
    p_branch_id,
    'pending',
    p_notes
  )
  returning id into v_purchase_id;

  -- validate and insert items
  select count(*) into v_count
  from jsonb_to_recordset(p_items) as x(product_id uuid, quantity_ordered numeric, unit_cost numeric)
  join public.product pr on pr.id = x.product_id
  where pr.branch_id = p_branch_id;

  if v_count <> jsonb_array_length(p_items) then
    raise exception 'invalid_products_in_items';
  end if;

  insert into public.purchase_item (
    purchase_id,
    product_id,
    quantity_ordered,
    unit_cost
  )
  select
    v_purchase_id,
    x.product_id,
    x.quantity_ordered,
    x.unit_cost
  from jsonb_to_recordset(p_items) as x(product_id uuid, quantity_ordered numeric, unit_cost numeric);

  return v_purchase_id;
end;
$$;

-- RPC: receive purchase (staff only)
create or replace function public.rpc_receive_purchase(
  p_branch_id uuid,
  p_purchase_id uuid,
  p_items jsonb
)
returns void
language plpgsql
as $$
declare
  v_count int;
begin
  if not public.has_permission(p_branch_id, 'stock') then
    raise exception 'permission_denied';
  end if;

  perform 1
  from public.purchase
  where id = p_purchase_id
    and branch_id = p_branch_id;

  if not found then
    raise exception 'purchase_not_found';
  end if;

  -- validate items belong to purchase
  select count(*) into v_count
  from jsonb_to_recordset(p_items) as x(product_id uuid, quantity_received numeric)
  join public.purchase_item pi
    on pi.purchase_id = p_purchase_id
   and pi.product_id = x.product_id;

  if v_count <> jsonb_array_length(p_items) then
    raise exception 'invalid_items_for_purchase';
  end if;

  update public.purchase_item pi
  set quantity_received = x.quantity_received,
      updated_at = now()
  from jsonb_to_recordset(p_items) as x(product_id uuid, quantity_received numeric)
  where pi.purchase_id = p_purchase_id
    and pi.product_id = x.product_id;

  update public.purchase
  set status = 'received',
      received_at = now(),
      updated_at = now()
  where id = p_purchase_id
    and branch_id = p_branch_id;
end;
$$;

-- Smoke checks (manual)
-- 1) Public reservation (anon): select public.rpc_public_create_reservation(...)
-- 2) Staff: select public.rpc_update_appointment_status(...)
-- 3) Staff: select public.rpc_create_or_update_deposit(...)
-- 4) Staff: select public.rpc_create_payment_for_appointment(...)
-- 5) Staff: select public.rpc_create_walkin_payment(...)
-- 6) Stock: select public.rpc_create_stock_movement(...)
-- 7) Stock: select public.rpc_create_purchase(...)
-- 8) Stock: select public.rpc_receive_purchase(...)
