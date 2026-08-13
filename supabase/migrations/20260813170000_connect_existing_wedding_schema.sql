-- Production setup for the existing Elena & Marcus wedding schema.
-- Run this once, in a single Supabase SQL Editor tab.
-- It adds no columns and deletes no RSVP, guest, or contribution records.

create or replace function public.submit_public_rsvp(
  p_wedding_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_attendance text,
  p_invited_guests integer,
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
    select 1 from public.weddings where id = p_wedding_id
  ) then
    raise exception 'Wedding not found';
  end if;

  if char_length(trim(p_first_name)) = 0 then
    raise exception 'First name is required';
  end if;

  if char_length(trim(p_email)) = 0
    or position('@' in trim(p_email)) <= 1
    or position('.' in split_part(trim(p_email), '@', 2)) = 0 then
    raise exception 'A valid email address is required';
  end if;

  if p_attendance not in ('attending', 'not_attending') then
    raise exception 'Attendance must be attending or not_attending';
  end if;

  if p_invited_guests < 0 then
    raise exception 'Guest count cannot be negative';
  end if;

  if p_attendance = 'not_attending' then
    p_invited_guests := 0;
  end if;

  -- Each email may submit only one RSVP for this wedding.
  select id into v_guest_id
  from public.guests
  where wedding_id = p_wedding_id
    and lower(email) = lower(trim(p_email))
  order by created_at desc
  limit 1;

  if v_guest_id is not null then
    raise exception 'This email address has already submitted an RSVP';
  end if;

  insert into public.guests (
    wedding_id, first_name, last_name, email, invited_guests, notes
  ) values (
    p_wedding_id, trim(p_first_name), nullif(trim(p_last_name), ''),
    lower(trim(p_email)), p_invited_guests, nullif(trim(p_message), '')
  ) returning id into v_guest_id;

  insert into public.rsvps (
    guest_id, attendance, number_of_guests, message
  ) values (
    v_guest_id, p_attendance, p_invited_guests,
    nullif(trim(p_message), '')
  ) returning id into v_rsvp_id;

  return v_rsvp_id;
end;
$$;

revoke all on function public.submit_public_rsvp(
  uuid, text, text, text, text, integer, text
) from public;

grant execute on function public.submit_public_rsvp(
  uuid, text, text, text, text, integer, text
) to anon, authenticated;

alter table public.rsvps enable row level security;
alter table public.contributions enable row level security;

create policy "Admins can view wedding RSVPs"
  on public.rsvps for select to authenticated
  using (
    exists (
      select 1 from public.wedding_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can view wedding contributions"
  on public.contributions for select to authenticated
  using (
    exists (
      select 1 from public.wedding_members
      where user_id = auth.uid() and role = 'admin'
    )
  );
