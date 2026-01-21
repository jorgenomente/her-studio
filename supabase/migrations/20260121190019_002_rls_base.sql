-- Helper functions for role/branch access
create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = on
as $$
  select exists (
    select 1
    from public.user_branch_role ubr
    where ubr.user_id = auth.uid()
      and ubr.role = 'superadmin'
      and ubr.is_active = true
  );
$$;

create or replace function public.has_any_branch_access()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = on
as $$
  select exists (
    select 1
    from public.user_branch_role ubr
    where ubr.user_id = auth.uid()
      and ubr.is_active = true
  );
$$;

create or replace function public.has_branch_access(branch_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = on
as $$
  select public.is_superadmin()
    or exists (
      select 1
      from public.user_branch_role ubr
      where ubr.user_id = auth.uid()
        and ubr.branch_id = has_branch_access.branch_id
        and ubr.is_active = true
    );
$$;

create or replace function public.has_permission(branch_id uuid, permission_flag text)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = on
as $$
  select public.is_superadmin()
    or exists (
      select 1
      from public.user_branch_role ubr
      where ubr.user_id = auth.uid()
        and ubr.branch_id = has_permission.branch_id
        and ubr.is_active = true
        and (
          ubr.role = 'admin'
          or (
            ubr.role = 'seller'
            and (
              (permission_flag = 'agenda' and ubr.can_manage_agenda = true)
              or (permission_flag = 'payments' and ubr.can_manage_payments = true)
              or (permission_flag = 'stock' and ubr.can_manage_stock = true)
            )
          )
        )
    );
$$;

-- Enable RLS on all tables
alter table public.organization enable row level security;
alter table public.branch enable row level security;
alter table public.profiles enable row level security;
alter table public.user_branch_role enable row level security;
alter table public.staff enable row level security;
alter table public.staff_availability enable row level security;
alter table public.service enable row level security;
alter table public.branch_service enable row level security;
alter table public.client enable row level security;
alter table public.appointment enable row level security;
alter table public.deposit enable row level security;
alter table public.payment enable row level security;
alter table public.receipt enable row level security;

alter table public.product enable row level security;
alter table public.recipe enable row level security;
alter table public.recipe_item enable row level security;
alter table public.stock_movement enable row level security;
alter table public.purchase enable row level security;
alter table public.purchase_item enable row level security;

alter table public.payment_source enable row level security;

-- Organization (global)
create policy "organization_select" on public.organization
for select
using (public.has_any_branch_access());

create policy "organization_insert" on public.organization
for insert
with check (public.is_superadmin());

create policy "organization_update" on public.organization
for update
using (public.is_superadmin())
with check (public.is_superadmin());

create policy "organization_delete" on public.organization
for delete
using (public.is_superadmin());

-- Branch
create policy "branch_select" on public.branch
for select
using (public.has_branch_access(id));

create policy "branch_insert" on public.branch
for insert
with check (public.is_superadmin());

create policy "branch_update" on public.branch
for update
using (public.is_superadmin())
with check (public.is_superadmin());

create policy "branch_delete" on public.branch
for delete
using (public.is_superadmin());

-- Profiles
create policy "profiles_select" on public.profiles
for select
using (
  user_id = auth.uid()
  or public.is_superadmin()
  or exists (
    select 1
    from public.user_branch_role target
    where target.user_id = profiles.user_id
      and public.has_branch_access(target.branch_id)
  )
);

create policy "profiles_insert" on public.profiles
for insert
with check (user_id = auth.uid() or public.is_superadmin());

create policy "profiles_update" on public.profiles
for update
using (
  public.is_superadmin()
  or exists (
    select 1
    from public.user_branch_role target
    where target.user_id = profiles.user_id
      and public.has_permission(target.branch_id, 'admin')
  )
)
with check (
  public.is_superadmin()
  or exists (
    select 1
    from public.user_branch_role target
    where target.user_id = profiles.user_id
      and public.has_permission(target.branch_id, 'admin')
  )
);

create policy "profiles_delete" on public.profiles
for delete
using (public.is_superadmin());

-- User branch role
create policy "user_branch_role_select" on public.user_branch_role
for select
using (public.has_branch_access(branch_id));

create policy "user_branch_role_insert" on public.user_branch_role
for insert
with check (public.has_permission(branch_id, 'admin'));

create policy "user_branch_role_update" on public.user_branch_role
for update
using (public.has_permission(branch_id, 'admin'))
with check (public.has_permission(branch_id, 'admin'));

create policy "user_branch_role_delete" on public.user_branch_role
for delete
using (public.has_permission(branch_id, 'admin'));

-- Staff
create policy "staff_select" on public.staff
for select
using (public.has_branch_access(branch_id));

create policy "staff_insert" on public.staff
for insert
with check (public.has_permission(branch_id, 'admin'));

create policy "staff_update" on public.staff
for update
using (public.has_permission(branch_id, 'admin'))
with check (public.has_permission(branch_id, 'admin'));

create policy "staff_delete" on public.staff
for delete
using (public.has_permission(branch_id, 'admin'));

-- Staff availability
create policy "staff_availability_select" on public.staff_availability
for select
using (
  exists (
    select 1
    from public.staff s
    where s.id = staff_availability.staff_id
      and public.has_branch_access(s.branch_id)
  )
);

create policy "staff_availability_insert" on public.staff_availability
for insert
with check (
  exists (
    select 1
    from public.staff s
    where s.id = staff_availability.staff_id
      and public.has_permission(s.branch_id, 'admin')
  )
);

create policy "staff_availability_update" on public.staff_availability
for update
using (
  exists (
    select 1
    from public.staff s
    where s.id = staff_availability.staff_id
      and public.has_permission(s.branch_id, 'admin')
  )
)
with check (
  exists (
    select 1
    from public.staff s
    where s.id = staff_availability.staff_id
      and public.has_permission(s.branch_id, 'admin')
  )
);

create policy "staff_availability_delete" on public.staff_availability
for delete
using (
  exists (
    select 1
    from public.staff s
    where s.id = staff_availability.staff_id
      and public.has_permission(s.branch_id, 'admin')
  )
);

-- Service (global catalog)
create policy "service_select" on public.service
for select
using (public.has_any_branch_access());

create policy "service_insert" on public.service
for insert
with check (public.is_superadmin());

create policy "service_update" on public.service
for update
using (public.is_superadmin())
with check (public.is_superadmin());

create policy "service_delete" on public.service
for delete
using (public.is_superadmin());

-- Branch service
create policy "branch_service_select" on public.branch_service
for select
using (public.has_branch_access(branch_id));

create policy "branch_service_insert" on public.branch_service
for insert
with check (public.has_permission(branch_id, 'admin'));

create policy "branch_service_update" on public.branch_service
for update
using (public.has_permission(branch_id, 'admin'))
with check (public.has_permission(branch_id, 'admin'));

create policy "branch_service_delete" on public.branch_service
for delete
using (public.has_permission(branch_id, 'admin'));

-- Client
create policy "client_select" on public.client
for select
using (
  public.is_superadmin()
  or (home_branch_id is not null and public.has_branch_access(home_branch_id))
);

create policy "client_insert" on public.client
for insert
with check (
  home_branch_id is not null
  and (
    public.has_permission(home_branch_id, 'agenda')
    or public.has_permission(home_branch_id, 'payments')
  )
);

create policy "client_update" on public.client
for update
using (
  home_branch_id is not null
  and (
    public.has_permission(home_branch_id, 'agenda')
    or public.has_permission(home_branch_id, 'payments')
  )
)
with check (
  home_branch_id is not null
  and (
    public.has_permission(home_branch_id, 'agenda')
    or public.has_permission(home_branch_id, 'payments')
  )
);

create policy "client_delete" on public.client
for delete
using (public.is_superadmin());

-- Appointment
create policy "appointment_select" on public.appointment
for select
using (public.has_branch_access(branch_id));

create policy "appointment_insert" on public.appointment
for insert
with check (public.has_permission(branch_id, 'agenda'));

create policy "appointment_update" on public.appointment
for update
using (public.has_permission(branch_id, 'agenda'))
with check (public.has_permission(branch_id, 'agenda'));

create policy "appointment_delete" on public.appointment
for delete
using (public.has_permission(branch_id, 'agenda'));

-- Deposit
create policy "deposit_select" on public.deposit
for select
using (
  exists (
    select 1
    from public.appointment a
    where a.id = deposit.appointment_id
      and public.has_branch_access(a.branch_id)
  )
);

create policy "deposit_insert" on public.deposit
for insert
with check (
  exists (
    select 1
    from public.appointment a
    where a.id = deposit.appointment_id
      and (
        public.has_permission(a.branch_id, 'agenda')
        or public.has_permission(a.branch_id, 'payments')
      )
  )
);

create policy "deposit_update" on public.deposit
for update
using (
  exists (
    select 1
    from public.appointment a
    where a.id = deposit.appointment_id
      and (
        public.has_permission(a.branch_id, 'agenda')
        or public.has_permission(a.branch_id, 'payments')
      )
  )
)
with check (
  exists (
    select 1
    from public.appointment a
    where a.id = deposit.appointment_id
      and (
        public.has_permission(a.branch_id, 'agenda')
        or public.has_permission(a.branch_id, 'payments')
      )
  )
);

create policy "deposit_delete" on public.deposit
for delete
using (
  exists (
    select 1
    from public.appointment a
    where a.id = deposit.appointment_id
      and public.has_permission(a.branch_id, 'payments')
  )
);

-- Payment
create policy "payment_select" on public.payment
for select
using (public.has_branch_access(branch_id));

create policy "payment_insert" on public.payment
for insert
with check (public.has_permission(branch_id, 'payments'));

create policy "payment_update" on public.payment
for update
using (public.has_permission(branch_id, 'payments'))
with check (public.has_permission(branch_id, 'payments'));

create policy "payment_delete" on public.payment
for delete
using (public.has_permission(branch_id, 'payments'));

-- Receipt
create policy "receipt_select" on public.receipt
for select
using (
  exists (
    select 1
    from public.payment p
    where p.id = receipt.payment_id
      and public.has_branch_access(p.branch_id)
  )
);

create policy "receipt_insert" on public.receipt
for insert
with check (
  exists (
    select 1
    from public.payment p
    where p.id = receipt.payment_id
      and public.has_permission(p.branch_id, 'payments')
  )
);

create policy "receipt_update" on public.receipt
for update
using (
  exists (
    select 1
    from public.payment p
    where p.id = receipt.payment_id
      and public.has_permission(p.branch_id, 'payments')
  )
)
with check (
  exists (
    select 1
    from public.payment p
    where p.id = receipt.payment_id
      and public.has_permission(p.branch_id, 'payments')
  )
);

create policy "receipt_delete" on public.receipt
for delete
using (
  exists (
    select 1
    from public.payment p
    where p.id = receipt.payment_id
      and public.has_permission(p.branch_id, 'payments')
  )
);

-- Product
create policy "product_select" on public.product
for select
using (public.has_branch_access(branch_id));

create policy "product_insert" on public.product
for insert
with check (public.has_permission(branch_id, 'stock'));

create policy "product_update" on public.product
for update
using (public.has_permission(branch_id, 'stock'))
with check (public.has_permission(branch_id, 'stock'));

create policy "product_delete" on public.product
for delete
using (public.has_permission(branch_id, 'stock'));

-- Recipe
create policy "recipe_select" on public.recipe
for select
using (public.has_branch_access(branch_id));

create policy "recipe_insert" on public.recipe
for insert
with check (public.has_permission(branch_id, 'stock'));

create policy "recipe_update" on public.recipe
for update
using (public.has_permission(branch_id, 'stock'))
with check (public.has_permission(branch_id, 'stock'));

create policy "recipe_delete" on public.recipe
for delete
using (public.has_permission(branch_id, 'stock'));

-- Recipe item
create policy "recipe_item_select" on public.recipe_item
for select
using (
  exists (
    select 1
    from public.recipe r
    where r.id = recipe_item.recipe_id
      and public.has_branch_access(r.branch_id)
  )
);

create policy "recipe_item_insert" on public.recipe_item
for insert
with check (
  exists (
    select 1
    from public.recipe r
    where r.id = recipe_item.recipe_id
      and public.has_permission(r.branch_id, 'stock')
  )
);

create policy "recipe_item_update" on public.recipe_item
for update
using (
  exists (
    select 1
    from public.recipe r
    where r.id = recipe_item.recipe_id
      and public.has_permission(r.branch_id, 'stock')
  )
)
with check (
  exists (
    select 1
    from public.recipe r
    where r.id = recipe_item.recipe_id
      and public.has_permission(r.branch_id, 'stock')
  )
);

create policy "recipe_item_delete" on public.recipe_item
for delete
using (
  exists (
    select 1
    from public.recipe r
    where r.id = recipe_item.recipe_id
      and public.has_permission(r.branch_id, 'stock')
  )
);

-- Stock movement
create policy "stock_movement_select" on public.stock_movement
for select
using (public.has_branch_access(branch_id));

create policy "stock_movement_insert" on public.stock_movement
for insert
with check (public.has_permission(branch_id, 'stock'));

create policy "stock_movement_update" on public.stock_movement
for update
using (public.has_permission(branch_id, 'stock'))
with check (public.has_permission(branch_id, 'stock'));

create policy "stock_movement_delete" on public.stock_movement
for delete
using (public.has_permission(branch_id, 'stock'));

-- Purchase
create policy "purchase_select" on public.purchase
for select
using (public.has_branch_access(branch_id));

create policy "purchase_insert" on public.purchase
for insert
with check (public.has_permission(branch_id, 'stock'));

create policy "purchase_update" on public.purchase
for update
using (public.has_permission(branch_id, 'stock'))
with check (public.has_permission(branch_id, 'stock'));

create policy "purchase_delete" on public.purchase
for delete
using (public.has_permission(branch_id, 'stock'));

-- Purchase item
create policy "purchase_item_select" on public.purchase_item
for select
using (
  exists (
    select 1
    from public.purchase p
    where p.id = purchase_item.purchase_id
      and public.has_branch_access(p.branch_id)
  )
);

create policy "purchase_item_insert" on public.purchase_item
for insert
with check (
  exists (
    select 1
    from public.purchase p
    where p.id = purchase_item.purchase_id
      and public.has_permission(p.branch_id, 'stock')
  )
);

create policy "purchase_item_update" on public.purchase_item
for update
using (
  exists (
    select 1
    from public.purchase p
    where p.id = purchase_item.purchase_id
      and public.has_permission(p.branch_id, 'stock')
  )
)
with check (
  exists (
    select 1
    from public.purchase p
    where p.id = purchase_item.purchase_id
      and public.has_permission(p.branch_id, 'stock')
  )
);

create policy "purchase_item_delete" on public.purchase_item
for delete
using (
  exists (
    select 1
    from public.purchase p
    where p.id = purchase_item.purchase_id
      and public.has_permission(p.branch_id, 'stock')
  )
);

-- Payment source
create policy "payment_source_select" on public.payment_source
for select
using (
  exists (
    select 1
    from public.payment p
    where p.id = payment_source.payment_id
      and public.has_branch_access(p.branch_id)
  )
);

create policy "payment_source_insert" on public.payment_source
for insert
with check (
  exists (
    select 1
    from public.payment p
    where p.id = payment_source.payment_id
      and public.has_permission(p.branch_id, 'payments')
  )
);

create policy "payment_source_update" on public.payment_source
for update
using (
  exists (
    select 1
    from public.payment p
    where p.id = payment_source.payment_id
      and public.has_permission(p.branch_id, 'payments')
  )
)
with check (
  exists (
    select 1
    from public.payment p
    where p.id = payment_source.payment_id
      and public.has_permission(p.branch_id, 'payments')
  )
);

create policy "payment_source_delete" on public.payment_source
for delete
using (
  exists (
    select 1
    from public.payment p
    where p.id = payment_source.payment_id
      and public.has_permission(p.branch_id, 'payments')
  )
);
