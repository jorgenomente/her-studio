-- Hardening: private deposit proofs + public attach RPC
insert into storage.buckets (id, name, public)
values ('deposit-proofs', 'deposit-proofs', false)
on conflict (id) do update set public = false;

-- Deprecate public-deposits bucket (no longer used)
update storage.buckets
set public = false
where id = 'public-deposits';

create or replace function public.rpc_public_attach_deposit_proof(
  p_appointment_id uuid,
  p_amount numeric,
  p_proof_path text
)
returns void
language plpgsql
security definer
set search_path = public, auth
set row_security = off
as $$
declare
  v_appointment public.appointment%rowtype;
  v_prefix text;
begin
  if p_appointment_id is null then
    raise exception 'appointment_id_required';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  if p_proof_path is null or length(trim(p_proof_path)) = 0 then
    raise exception 'invalid_proof_path';
  end if;

  select * into v_appointment
  from public.appointment a
  where a.id = p_appointment_id;

  if not found then
    raise exception 'appointment_not_found';
  end if;

  if v_appointment.status not in (
    'scheduled',
    'scheduled_deposit_pending',
    'scheduled_deposit_verified'
  ) then
    raise exception 'invalid_appointment_status';
  end if;

  v_prefix := format(
    'branch/%s/appointment/%s/',
    v_appointment.branch_id,
    v_appointment.id
  );

  if position(v_prefix in p_proof_path) <> 1 then
    raise exception 'invalid_proof_path_prefix';
  end if;

  insert into public.deposit (
    appointment_id,
    amount,
    proof_url,
    status
  ) values (
    v_appointment.id,
    p_amount,
    p_proof_path,
    'pending'
  )
  on conflict (appointment_id) do update
  set amount = excluded.amount,
      proof_url = excluded.proof_url,
      status = 'pending',
      updated_at = now();
end;
$$;
