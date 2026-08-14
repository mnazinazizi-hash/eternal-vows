-- Run once in the Supabase SQL Editor before enabling live payments.
-- This records the Daraja callback independently, then exposes confirmed
-- M-Pesa support payments through the existing admin contribution dashboard.

create table if not exists public.mpesa_payments (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  phone_number text not null,
  status text not null default 'pending'
    check (status in ('pending', 'received', 'failed')),
  merchant_request_id text not null unique,
  checkout_request_id text not null unique,
  mpesa_receipt_number text unique,
  result_code integer,
  result_description text,
  raw_callback jsonb,
  contribution_recorded boolean not null default false,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.mpesa_payments enable row level security;

create index if not exists mpesa_payments_wedding_status_idx
  on public.mpesa_payments (wedding_id, status, created_at desc);

alter table public.contributions
  add column if not exists mpesa_checkout_request_id text unique;

create or replace function public.get_admin_dashboard_contributions()
returns table (
  id uuid,
  guest_id uuid,
  contributor text,
  amount numeric,
  created_at timestamptz,
  status text
)
language sql
security definer
set search_path = public
as $$
  select
    c.id,
    c.guest_id,
    coalesce(c.contributor_name, 'Anonymous') as contributor,
    c.amount,
    c.created_at,
    case
      when lower(c.payment_status) = 'received' then 'Received'
      else 'Pending'
    end as status
  from public.contributions c
  where exists (
    select 1
    from public.wedding_members m
    where m.user_id = auth.uid()
      and m.role = 'admin'
      and m.wedding_id = c.wedding_id
  )
  order by c.created_at desc;
$$;

revoke all on function public.get_admin_dashboard_contributions() from public;
grant execute on function public.get_admin_dashboard_contributions() to authenticated;
