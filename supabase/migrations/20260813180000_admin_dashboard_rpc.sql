-- Run this once in a fresh Supabase SQL Editor tab.
-- These functions only read existing data and return it to authenticated admins.

create or replace function public.get_admin_dashboard_rsvps()
returns table (
  id uuid,
  guest_id uuid,
  first_name text,
  last_name text,
  email text,
  attendance text,
  number_of_guests integer,
  message text,
  submitted_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    r.id,
    r.guest_id,
    g.first_name,
    g.last_name,
    g.email,
    r.attendance,
    r.number_of_guests,
    r.message,
    r.submitted_at
  from public.rsvps r
  join public.guests g on g.id = r.guest_id
  where exists (
    select 1
    from public.wedding_members m
    where m.user_id = auth.uid()
      and m.role = 'admin'
      and m.wedding_id = g.wedding_id
  )
  order by r.submitted_at desc;
$$;

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
  join public.guests g on g.id = c.guest_id
  where exists (
    select 1
    from public.wedding_members m
    where m.user_id = auth.uid()
      and m.role = 'admin'
      and m.wedding_id = g.wedding_id
  )
  order by c.created_at desc;
$$;

revoke all on function public.get_admin_dashboard_rsvps() from public;
revoke all on function public.get_admin_dashboard_contributions() from public;

grant execute on function public.get_admin_dashboard_rsvps() to authenticated;
grant execute on function public.get_admin_dashboard_contributions() to authenticated;
