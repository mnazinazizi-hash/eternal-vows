-- Run once in Supabase SQL Editor.
-- Deletes one guest and that guest's RSVP/payment records. Admins only.

create or replace function public.delete_wedding_guest(
  p_guest_id uuid,
  p_wedding_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.wedding_members
    where user_id = auth.uid()
      and role = 'admin'
      and wedding_id = p_wedding_id
  ) then
    raise exception 'Only wedding admins can delete guests';
  end if;

  if not exists (
    select 1 from public.guests
    where id = p_guest_id and wedding_id = p_wedding_id
  ) then
    raise exception 'Guest not found for this wedding';
  end if;

  delete from public.contributions where guest_id = p_guest_id;
  delete from public.rsvps where guest_id = p_guest_id;
  delete from public.guests where id = p_guest_id;
end;
$$;

revoke all on function public.delete_wedding_guest(uuid, uuid) from public;
grant execute on function public.delete_wedding_guest(uuid, uuid) to authenticated;
