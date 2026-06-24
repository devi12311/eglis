insert into public.locations (
  slug,
  name,
  address,
  landmark,
  phone,
  timezone,
  opening_time,
  closing_time,
  slot_minutes,
  online_booking,
  season_months,
  active,
  sort_order
)
values
  ('saranda', 'Saranda Caravan', '[ADD Saranda address]', '[ADD Saranda landmark]', '+355 00 000 0000', 'Europe/Tirane', '10:00', '24:00', 30, true, '{6,7,8,9}', true, 1),
  ('elbasan', 'Elbasan Chair', '[ADD Elbasan address]', '[ADD Elbasan landmark]', '+355 00 000 0001', 'Europe/Tirane', '10:00', '24:00', 30, false, null, true, 2)
on conflict (slug) do update set
  name = excluded.name,
  address = excluded.address,
  landmark = excluded.landmark,
  phone = excluded.phone,
  online_booking = excluded.online_booking,
  season_months = excluded.season_months;

insert into public.services (
  slug,
  name,
  description,
  price_all,
  duration_min,
  bookable_online,
  active,
  sort_order
)
values
  ('fresh-cut', 'Fresh Cut', 'Clean fade, shape, and finish for the daily sharp look.', 1000, 30, true, true, 1),
  ('full-reset', 'Full Reset', 'Cut, beard detail, hot towel finish, and reset before the night starts.', 1500, 30, true, true, 2),
  ('summer-pass', 'Summer Pass', 'Seasonal package for regular trims through beach months.', 0, 30, false, true, 3),
  ('beach-to-night', 'Beach to Night', 'Group-ready polish before dinner, music, or a late walk by the sea.', 0, 30, false, true, 4),
  ('crew', 'Crew', 'Call ahead for friends, events, and coordinated cuts.', 0, 30, false, true, 5)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price_all = excluded.price_all,
  duration_min = excluded.duration_min,
  bookable_online = excluded.bookable_online,
  active = excluded.active,
  sort_order = excluded.sort_order;
