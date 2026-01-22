\echo '=============================='
\echo ' SMOKE TEST MVP E2E — START'
\echo '=============================='
\set ON_ERROR_STOP on

-- =========================
-- 0) Variables (seed actual)
-- =========================
\set branch_id '22222222-2222-2222-2222-222222222222'
\set service_id '33333333-3333-3333-3333-333333333331'
\set admin_user_id '76731344-51c6-4077-9cf2-ba991bb87bc1'
\set product_id '66666666-6666-6666-6666-666666666661'

-- Día a testear (UTC)
\set slot_date '2026-01-23'

-- Expose psql vars inside DO blocks via custom GUCs
select set_config('smoke.branch_id', :'branch_id', false);
select set_config('smoke.service_id', :'service_id', false);
select set_config('smoke.admin_user_id', :'admin_user_id', false);
select set_config('smoke.product_id', :'product_id', false);
select set_config('smoke.slot_date', :'slot_date', false);

-- =========================
-- 1) Simular auth (JWT)
-- =========================
\echo '--- Set JWT context (admin) ---'
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', :'admin_user_id',
    'role', 'authenticated'
  )::text,
  false
);
select set_config('request.jwt.claim.sub', :'admin_user_id', false);
select set_config('request.jwt.claim.role', 'authenticated', false);

-- sanity
do $$
begin
  if auth.uid() is null then
    raise exception 'ASSERT FAIL: auth.uid() is null (JWT context not applied)';
  end if;
end $$;

-- =========================
-- 2) Público: servicios
-- =========================
\echo '--- Step 1: public services ---'
do $$
declare c int;
begin
  select count(*) into c
  from rpc_public_list_branch_services(current_setting('smoke.branch_id')::uuid);

  if c < 1 then
    raise exception 'ASSERT FAIL: no public services for branch %', current_setting('smoke.branch_id');
  end if;
end $$;

-- =========================
-- 3) Público: disponibilidad + elegir primer slot
-- =========================
\echo '--- Step 1: availability day ---'
do $$
declare c int;
begin
  select count(*) into c
  from rpc_public_availability_day(
    current_setting('smoke.branch_id')::uuid,
    current_setting('smoke.service_id')::uuid,
    current_setting('smoke.slot_date')::date
  );

  if c < 1 then
    raise exception 'ASSERT FAIL: no availability slots returned';
  end if;
end $$;

select start_at::text as start_at
  from rpc_public_availability_day(
  current_setting('smoke.branch_id')::uuid,
  current_setting('smoke.service_id')::uuid,
  current_setting('smoke.slot_date')::date
)
order by start_at
limit 1
\gset

select set_config('smoke.start_at', :'start_at', false);

do $$
begin
  if nullif(current_setting('smoke.start_at'), '') is null then
    raise exception 'ASSERT FAIL: could not pick start_at slot';
  end if;
end $$;

\echo 'picked start_at=' :start_at

-- =========================
-- 4) Crear reserva pública
-- =========================
\echo '--- Step 2: create reservation ---'
select rpc_public_create_reservation(
  p_branch_id      => :'branch_id'::uuid,
  p_service_id     => :'service_id'::uuid,
  p_start_at       => :'start_at'::timestamptz,
  p_full_name      => 'Cliente Smoke',
  p_phone          => '+54 11 5555 7777',
  p_email          => 'cliente@smoke.test',
  p_notes          => 'Smoke test E2E',
  p_staff_strategy => 'any'
)::text as appointment_id
\gset

\echo 'appointment_id=' :appointment_id

select set_config('smoke.appointment_id', :'appointment_id', false);

do $$
declare ok boolean;
begin
  select exists(
    select 1
    from v_app_agenda_day
    where appointment_id = current_setting('smoke.appointment_id')::uuid
      and status = 'scheduled'
  ) into ok;

  if not ok then
    raise exception 'ASSERT FAIL: appointment not in agenda as scheduled';
  end if;
end $$;

-- =========================
-- 5) Crear depósito (attach proof)
-- =========================
\echo '--- Step 3: attach deposit proof (creates deposit) ---'
select rpc_public_attach_deposit_proof(
  p_appointment_id => :'appointment_id'::uuid,
  p_amount         => 15000,
  p_proof_path     => format(
    'branch/%s/appointment/%s/proof/%s',
    :'branch_id',
    :'appointment_id',
    'smoke-demo.png'
  )
);

select d.id::text as deposit_id
from deposit d
where d.appointment_id = current_setting('smoke.appointment_id')::uuid
order by d.created_at desc nulls last
limit 1
\gset

\echo 'deposit_id=' :deposit_id

select set_config('smoke.deposit_id', :'deposit_id', false);

do $$
declare ok boolean;
begin
  select exists(
    select 1
    from v_app_appointment_detail
    where appointment_id = current_setting('smoke.appointment_id')::uuid
      and deposit_id = current_setting('smoke.deposit_id')::uuid
      and deposit_status = 'pending'
  ) into ok;

  if not ok then
    raise exception 'ASSERT FAIL: deposit not pending after attach';
  end if;
end $$;

do $$
declare ok boolean;
begin
  select exists(
    select 1
    from v_app_agenda_day
    where appointment_id = current_setting('smoke.appointment_id')::uuid
      and has_deposit = true
  ) into ok;

  if not ok then
    raise exception 'ASSERT FAIL: agenda has_deposit not true';
  end if;
end $$;

-- =========================
-- 6) Verificar depósito (payments)
-- =========================
\echo '--- Step 4: verify deposit ---'
do $$
declare ok boolean;
begin
  select public.has_permission(current_setting('smoke.branch_id')::uuid, 'payments') into ok;
  if not ok then
    raise exception 'ASSERT FAIL: user lacks payments permission';
  end if;
end $$;

select rpc_verify_deposit(
  p_deposit_id => :'deposit_id'::uuid,
  p_branch_id  => :'branch_id'::uuid,
  p_status     => 'verified'
);

do $$
declare ok boolean;
begin
  select exists(
    select 1
    from deposit
    where id = current_setting('smoke.deposit_id')::uuid
      and status = 'verified'
      and verified_at is not null
  ) into ok;

  if not ok then
    raise exception 'ASSERT FAIL: deposit not verified';
  end if;
end $$;

-- =========================
-- 7) Crear pago
-- =========================
\echo '--- Step 5: create payment ---'
select rpc_create_payment_for_appointment(
  p_branch_id      => :'branch_id'::uuid,
  p_appointment_id => :'appointment_id'::uuid,
  p_amount         => 30000::numeric,
  p_method         => 'cash'::public.payment_method,
  p_source         => 'walk_in'::public.payment_source_type,
  p_is_recurrent   => false,
  p_client_id      => null,
  p_paid_at        => now(),
  p_referred_by    => null
)::text as payment_id
\gset

\echo 'payment_id=' :payment_id

select r.id::text as receipt_id
from receipt r
where r.payment_id = (:'payment_id')::uuid
limit 1
\gset

\echo 'receipt_id=' :receipt_id

do $$
declare ok boolean;
begin
  select exists(
    select 1
    from v_app_agenda_day
    where appointment_id = current_setting('smoke.appointment_id')::uuid
      and has_payment = true
  ) into ok;

  if not ok then
    raise exception 'ASSERT FAIL: agenda has_payment not true';
  end if;
end $$;

do $$
declare c int;
begin
  select count(*) into c
  from payment
  where appointment_id = current_setting('smoke.appointment_id')::uuid;

  if c <> 1 then
    raise exception 'ASSERT FAIL: expected 1 payment, got %', c;
  end if;
end $$;

-- =========================
-- 8) Stock: egreso ligado a appointment
-- =========================
\echo '--- Step 6: stock movement OUT ---'
do $$
declare ok boolean;
begin
  select public.has_permission(current_setting('smoke.branch_id')::uuid, 'stock') into ok;
  if not ok then
    raise exception 'ASSERT FAIL: user lacks stock permission';
  end if;
end $$;

select rpc_create_stock_movement(
  p_branch_id      => :'branch_id'::uuid,
  p_product_id     => :'product_id'::uuid,
  p_movement_type  => 'out'::public.stock_movement_type,
  p_quantity       => 2::numeric,
  p_reason         => 'appointment_consume',
  p_appointment_id => :'appointment_id'::uuid
)::text as movement_id
\gset

\echo 'movement_id=' :movement_id

select set_config('smoke.movement_id', :'movement_id', false);

do $$
declare ok boolean;
begin
  select exists(
    select 1
    from stock_movement
    where id = current_setting('smoke.movement_id')::uuid
      and appointment_id = current_setting('smoke.appointment_id')::uuid
  ) into ok;

  if not ok then
    raise exception 'ASSERT FAIL: stock movement not linked to appointment';
  end if;
end $$;

-- =========================
-- 9) Cerrar turno
-- =========================
\echo '--- Step 7: close appointment ---'
select rpc_update_appointment_status(
  p_branch_id      => :'branch_id'::uuid,
  p_appointment_id => :'appointment_id'::uuid,
  p_new_status     => 'completed'::public.appointment_status
);

do $$
declare ok boolean;
begin
  select exists(
    select 1
    from appointment
    where id = current_setting('smoke.appointment_id')::uuid
      and status = 'completed'
  ) into ok;

  if not ok then
    raise exception 'ASSERT FAIL: appointment not completed';
  end if;
end $$;

-- =========================
-- Cleanup
-- =========================
select set_config('request.jwt.claims', null, true);

\echo '=============================='
\echo ' SMOKE TEST MVP E2E — PASS ✅'
\echo '=============================='
