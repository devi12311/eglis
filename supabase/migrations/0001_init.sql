create extension if not exists pgcrypto;

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug in ('saranda', 'elbasan')),
  name text not null,
  address text not null,
  landmark text not null,
  phone text not null,
  lat numeric null,
  lng numeric null,
  timezone text not null default 'Europe/Tirane',
  opening_time time not null default '10:00',
  closing_time time not null default '24:00',
  slot_minutes int not null default 30,
  online_booking boolean not null default true,
  season_months int[] null,
  active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  price_all int not null default 0,
  duration_min int not null default 30,
  bookable_online boolean not null default true,
  active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  public_ref text unique not null,
  cancel_token uuid not null default gen_random_uuid(),
  location_id uuid not null references public.locations(id),
  service_id uuid not null references public.services(id),
  customer_name text not null,
  phone text not null,
  res_date date not null,
  start_time time not null,
  end_time time not null,
  price_all int not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'done', 'no_show')),
  locale text not null default 'en' check (locale in ('en', 'sq', 'it')),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz null
);

create unique index if not exists reservations_active_slot_unique
  on public.reservations(location_id, res_date, start_time)
  where status = 'confirmed';

create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id),
  block_date date not null,
  full_day boolean not null default false,
  start_time time null,
  end_time time null,
  reason text null,
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id),
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.locations enable row level security;
alter table public.services enable row level security;
alter table public.reservations enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.admins enable row level security;

create policy "active locations are readable"
  on public.locations for select
  using (active = true);

create policy "active services are readable"
  on public.services for select
  using (active = true);

create policy "admins can read admin allowlist"
  on public.admins for select
  using (auth.uid() = user_id);

create policy "admins can manage locations"
  on public.locations for all
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));

create policy "admins can manage services"
  on public.services for all
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));

create policy "admins can manage reservations"
  on public.reservations for all
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));

create policy "admins can manage availability blocks"
  on public.availability_blocks for all
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));

create or replace function public.generate_public_ref()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := 'ECC-' || floor(1000 + random() * 9000)::int::text;
    exit when not exists (select 1 from public.reservations where public_ref = candidate);
  end loop;
  return candidate;
end;
$$;

create or replace function public.get_available_slots(
  location_slug text,
  service_slug text,
  target_date date
)
returns table(slot time)
language plpgsql
security definer
set search_path = public
as $$
declare
  loc public.locations%rowtype;
  svc public.services%rowtype;
  current_slot time;
  local_now timestamptz;
begin
  select * into loc from public.locations where slug = location_slug and active = true;
  select * into svc from public.services where slug = service_slug and active = true and bookable_online = true;

  if loc.id is null or svc.id is null or loc.online_booking = false then
    return;
  end if;

  if loc.season_months is not null and not (extract(month from target_date)::int = any(loc.season_months)) then
    return;
  end if;

  local_now := now() at time zone loc.timezone;

  current_slot := loc.opening_time;
  while current_slot <= (loc.closing_time - make_interval(mins => loc.slot_minutes)) loop
    if not exists (
      select 1 from public.reservations r
      where r.location_id = loc.id
        and r.res_date = target_date
        and r.start_time = current_slot
        and r.status = 'confirmed'
    )
    and not exists (
      select 1 from public.availability_blocks b
      where b.location_id = loc.id
        and b.block_date = target_date
        and (b.full_day = true or (current_slot, current_slot + make_interval(mins => loc.slot_minutes)) overlaps (b.start_time, b.end_time))
    )
    and not (
      target_date = (local_now at time zone loc.timezone)::date
      and current_slot < ((local_now at time zone loc.timezone)::time + interval '15 minutes')
    ) then
      slot := current_slot;
      return next;
    end if;

    current_slot := current_slot + make_interval(mins => loc.slot_minutes);
  end loop;
end;
$$;

create or replace function public.create_reservation(
  location_slug text,
  service_slug text,
  customer_name text,
  phone text,
  res_date date,
  start_time time,
  locale text default 'en'
)
returns table(public_ref text, cancel_token uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  loc public.locations%rowtype;
  svc public.services%rowtype;
  generated_ref text;
  generated_token uuid;
begin
  select * into loc from public.locations where slug = location_slug and active = true and online_booking = true;
  select * into svc from public.services where slug = service_slug and active = true and bookable_online = true;

  if loc.id is null or svc.id is null then
    raise exception 'Location or service is not bookable online';
  end if;

  if not exists (
    select 1 from public.get_available_slots(location_slug, service_slug, res_date) s where s.slot = start_time
  ) then
    raise exception 'That slot was just taken';
  end if;

  generated_ref := public.generate_public_ref();
  generated_token := gen_random_uuid();

  insert into public.reservations (
    public_ref,
    cancel_token,
    location_id,
    service_id,
    customer_name,
    phone,
    res_date,
    start_time,
    end_time,
    price_all,
    locale
  )
  values (
    generated_ref,
    generated_token,
    loc.id,
    svc.id,
    customer_name,
    phone,
    res_date,
    start_time,
    start_time + make_interval(mins => loc.slot_minutes),
    svc.price_all,
    locale
  );

  public_ref := generated_ref;
  cancel_token := generated_token;
  return next;
exception
  when unique_violation then
    raise exception 'That slot was just taken';
end;
$$;

create or replace function public.cancel_reservation(ref text, token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.reservations
  set status = 'cancelled',
      cancelled_at = coalesce(cancelled_at, now())
  where public_ref = ref
    and cancel_token = token
    and status <> 'cancelled';

  return exists (
    select 1 from public.reservations
    where public_ref = ref
      and cancel_token = token
  );
end;
$$;

grant execute on function public.get_available_slots(text, text, date) to anon, authenticated;
grant execute on function public.create_reservation(text, text, text, text, date, time, text) to anon, authenticated;
grant execute on function public.cancel_reservation(text, uuid) to anon, authenticated;
