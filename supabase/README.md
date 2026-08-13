# Supabase production setup

1. Open your Supabase project, then go to **SQL Editor**.
2. Close or cancel any other SQL Editor query before continuing. The earlier deadlock was caused by competing database locks.
3. In one fresh query, run `migrations/20260813170000_connect_existing_wedding_schema.sql` once. It creates the restricted public RSVP function.
4. In another fresh query, run `migrations/20260813180000_admin_dashboard_rpc.sql`. It creates read-only, admin-scoped dashboard functions that join the existing guest, RSVP, and payment tables.
5. Confirm that your dashboard login email has an account in **Authentication > Users**, then ensure it has a matching `public.wedding_members` row with `role = 'admin'` and the Elena & Marcus wedding ID.
6. Restart the Next.js server after pulling these app changes. The public RSVP form now targets the Elena & Marcus wedding ID by default. For deployment configuration, set `NEXT_PUBLIC_WEDDING_ID=07de8634-2918-4874-86a4-fd4a95491504`.

The resulting access model is:

- Anyone can create an RSVP.
- Only users listed as `admin` in `public.wedding_members` can read RSVPs and contributions.
- Payments are linked to an RSVP through `contributions.rsvp_id`; only `Received` payments count toward totals.
