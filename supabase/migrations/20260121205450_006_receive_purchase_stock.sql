-- Replace rpc_receive_purchase to create stock movements on receive
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
  v_received_count int;
  v_status public.purchase_status;
  v_item record;
begin
  if not public.has_permission(p_branch_id, 'stock') then
    raise exception 'permission_denied';
  end if;

  select status into v_status
  from public.purchase
  where id = p_purchase_id
    and branch_id = p_branch_id;

  if v_status is null then
    raise exception 'purchase_not_found';
  end if;

  if v_status = 'received' then
    raise exception 'purchase_already_received';
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

  select count(*) into v_received_count
  from jsonb_to_recordset(p_items) as x(product_id uuid, quantity_received numeric)
  where coalesce(x.quantity_received, 0) > 0;

  if v_received_count = 0 then
    raise exception 'no_items_received';
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

  -- create stock movements for received quantities
  for v_item in
    select x.product_id, x.quantity_received
    from jsonb_to_recordset(p_items) as x(product_id uuid, quantity_received numeric)
    where coalesce(x.quantity_received, 0) > 0
  loop
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
      v_item.product_id,
      'in',
      v_item.quantity_received,
      'purchase_received',
      null,
      p_purchase_id
    );
  end loop;
end;
$$;

-- Smoke checks (manual)
-- 1) Call rpc_receive_purchase with a valid purchase and quantities > 0 -> stock_movement rows created.
-- 2) Call rpc_receive_purchase again for same purchase -> should error purchase_already_received.
-- 3) Call rpc_receive_purchase with all quantities 0 -> should error no_items_received.
