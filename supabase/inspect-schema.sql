-- Read-only: run this in Supabase SQL Editor and share the results.
-- It does not alter tables, data, policies, or authentication users.

select
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('rsvps', 'contributions', 'wedding_members')
order by table_name, ordinal_position;

select
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('rsvps', 'contributions', 'wedding_members')
order by tablename, policyname;
