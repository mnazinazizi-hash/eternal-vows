-- Run once in Supabase SQL Editor. This preserves all existing RSVPs.
alter table public.rsvps
  add column if not exists source text not null default 'automatic';

create or replace function public.add_manual_rsvp(
  p_wedding_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text default null,
  p_phone text default null,
  p_attendance text default 'attending',
  p_invited_guests integer default 0,
  p_message text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest_id uuid;
  v_rsvp_id uuid;
begin
  if not exists (
    select 1 from public.wedding_members
    where user_id = auth.uid()
      and role = 'admin'
      and wedding_id = p_wedding_id
  ) then
    raise exception 'Only wedding admins can add manual RSVPs';
  end if;

  if char_length(trim(p_first_name)) = 0 then
    raise exception 'First name is required';
  end if;

  if p_attendance not in ('attending', 'not_attending', 'maybe') then
    raise exception 'Invalid attendance response';
  end if;

  if p_invited_guests < 0 then
    raise exception 'Guest count cannot be negative';
  end if;

  if p_attendance = 'not_attending' then
    p_invited_guests := 0;
  end if;

  if nullif(trim(coalesce(p_email, '')), '') is not null and exists (
    select 1 from public.guests
    where wedding_id = p_wedding_id
      and lower(email) = lower(trim(p_email))
  ) then
    raise exception 'This email address already has an RSVP';
  end if;

  insert into public.guests (
    wedding_id, first_name, last_name, email, phone, invited_guests, notes
  ) values (
    p_wedding_id,
    trim(p_first_name),
    nullif(trim(p_last_name), ''),
    nullif(lower(trim(p_email)), ''),
    nullif(trim(p_phone), ''),
    p_invited_guests,
    nullif(trim(p_message), '')
  ) returning id into v_guest_id;

  insert into public.rsvps (
    guest_id, attendance, number_of_guests, message, source
  ) values (
    v_guest_id, p_attendance, p_invited_guests,
    nullif(trim(p_message), ''), 'manual'
  ) returning id into v_rsvp_id;

  return v_rsvp_id;
end;
$$;

revoke all on function public.add_manual_rsvp(
  uuid, text, text, text, text, text, integer, text
) from public;

grant execute on function public.add_manual_rsvp(
  uuid, text, text, text, text, text, integer, text
) to authenticated;

create or replace function public.add_manual_contribution(
  p_wedding_id uuid,
  p_contributor_name text,
  p_amount numeric,
  p_payment_method text default 'M-Pesa',
  p_transaction_reference text default null,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contribution_id uuid;
begin
  if not exists (
    select 1 from public.wedding_members
    where user_id = auth.uid()
      and role = 'admin'
      and wedding_id = p_wedding_id
  ) then
    raise exception 'Only wedding admins can add contributions';
  end if;

  if char_length(trim(p_contributor_name)) = 0 then
    raise exception 'Contributor name is required';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Contribution amount must be greater than zero';
  end if;

  insert into public.contributions (
    wedding_id,
    contributor_name,
    amount,
    currency,
    payment_method,
    payment_status,
    transaction_reference,
    message
  ) values (
    p_wedding_id,
    trim(p_contributor_name),
    p_amount,
    'KES',
    coalesce(nullif(trim(p_payment_method), ''), 'M-Pesa'),
    'received',
    nullif(trim(p_transaction_reference), ''),
    nullif(trim(p_message), '')
  ) returning id into v_contribution_id;

  return v_contribution_id;
end;
$$;

revoke all on function public.add_manual_contribution(
  uuid, text, numeric, text, text, text
) from public;

grant execute on function public.add_manual_contribution(
  uuid, text, numeric, text, text, text
) to authenticated;

create or replace function public.get_admin_dashboard_rsvps_v2()
returns table (
  id uuid,
  guest_id uuid,
  first_name text,
  last_name text,
  email text,
  attendance text,
  number_of_guests integer,
  message text,
  submitted_at timestamptz,
  source text
)
language sql
security definer
set search_path = public
as $$
  select r.id, r.guest_id, g.first_name, g.last_name, g.email,
    r.attendance, r.number_of_guests, r.message, r.submitted_at,
    coalesce(r.source, 'automatic')
  from public.rsvps r
  join public.guests g on g.id = r.guest_id
  where exists (
    select 1 from public.wedding_members m
    where m.user_id = auth.uid()
      and m.role = 'admin'
      and m.wedding_id = g.wedding_id
  )
  order by r.submitted_at desc;
$$;

revoke all on function public.get_admin_dashboard_rsvps_v2() from public;
grant execute on function public.get_admin_dashboard_rsvps_v2() to authenticated;
