-- Do not run this combined script on a partially configured project.
-- Run ../inspect-schema.sql first, then use a tailored incremental migration.
-- This file is retained only as a reference for a brand-new, empty project.

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(trim(first_name)) > 0),
  last_name text not null check (char_length(trim(last_name)) > 0),
  email text not null check (email = lower(trim(email))),
  attendance text not null check (attendance in ('accepted', 'declined')),
  invited_guests integer not null default 0 check (invited_guests >= 0),
  message text not null default '',
  created_at timestamptz not null default now(),
  constraint declined_rsvps_have_no_extra_guests check (
    attendance = 'accepted' or invited_guests = 0
  )
);

-- Existing projects may already have this table. Add the fields required by
-- the current application without removing or changing existing RSVP records.
alter table public.rsvps
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists email text,
  add column if not exists attendance text,
  add column if not exists invited_guests integer not null default 0,
  add column if not exists message text not null default '',
  add column if not exists created_at timestamptz not null default now();

create index if not exists rsvps_created_at_idx
  on public.rsvps (created_at desc);

create index if not exists rsvps_email_idx
  on public.rsvps (email);

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  rsvp_id uuid references public.rsvps(id) on delete set null,
  contributor text not null,
  amount numeric(12, 2) not null check (amount > 0),
  received_at date not null default current_date,
  status text not null default 'Pending' check (status in ('Received', 'Pending')),
  created_at timestamptz not null default now()
);

alter table public.contributions
  add column if not exists rsvp_id uuid references public.rsvps(id) on delete set null,
  add column if not exists contributor text,
  add column if not exists amount numeric(12, 2),
  add column if not exists received_at date not null default current_date,
  add column if not exists status text not null default 'Pending',
  add column if not exists created_at timestamptz not null default now();

create index if not exists contributions_rsvp_id_idx
  on public.contributions (rsvp_id);

-- This table assigns Supabase-authenticated users to the wedding admin role.
create table if not exists public.wedding_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;
alter table public.contributions enable row level security;
alter table public.wedding_members enable row level security;

create policy "Anyone can submit an RSVP"
  on public.rsvps for insert to anon, authenticated
  with check (
    attendance in ('accepted', 'declined')
    and invited_guests >= 0
    and (attendance = 'accepted' or invited_guests = 0)
  );

create policy "Admins can read RSVPs"
  on public.rsvps for select to authenticated
  using (
    exists (
      select 1 from public.wedding_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can read contributions"
  on public.contributions for select to authenticated
  using (
    exists (
      select 1 from public.wedding_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can read their own admin membership"
  on public.wedding_members for select to authenticated
  using (user_id = auth.uid());

-- After creating your admin user in Supabase Authentication, run this once.
-- Replace the email address before running it.
-- insert into public.wedding_members (user_id, role)
-- select id, 'admin' from auth.users where email = 'your-admin-email@example.com';
