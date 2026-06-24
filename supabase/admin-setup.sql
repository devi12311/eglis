-- Admin setup helper.
--
-- 1. First create the admin user in Supabase Dashboard:
--    Authentication -> Users -> Add user
--    Set the email and password there. Passwords live in Supabase Auth,
--    not in public.admins.
--
-- 2. Then run this file after replacing the email below.
--    It only allowlists an existing Auth user for the app admin area.

insert into public.admins (user_id, email)
select id, email
from auth.users
where lower(email) = lower('admin@gmail.com')
on conflict (user_id) do update set email = excluded.email;

-- Confirm that one row was inserted/updated.
select a.user_id, a.email, a.created_at
from public.admins a
where lower(a.email) = lower('admin@example.com');

-- If the select returns no rows, the Auth user does not exist yet or the
-- email above does not exactly match the user you created in Authentication.
