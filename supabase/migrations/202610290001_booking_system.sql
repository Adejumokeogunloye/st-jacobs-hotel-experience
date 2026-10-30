create extension if not exists pgcrypto;

create table if not exists public.room_types (
  slug text primary key,
  name text not null,
  property text not null check (property in ('main', 'annex')),
  nightly_rate integer not null check (nightly_rate > 0),
  max_adults smallint not null check (max_adults > 0),
  max_children smallint not null default 0 check (max_children >= 0),
  inventory smallint not null default 1 check (inventory > 0),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  access_token_hash text not null,
  room_slug text not null references public.room_types(slug),
  guest_name text not null check (char_length(guest_name) between 2 and 120),
  guest_email text not null check (char_length(guest_email) between 3 and 200),
  guest_phone text not null check (char_length(guest_phone) between 8 and 30),
  check_in date not null,
  check_out date not null,
  nights smallint not null check (nights > 0),
  adults smallint not null check (adults > 0),
  children smallint not null default 0 check (children >= 0),
  nightly_rate integer not null check (nightly_rate > 0),
  total_amount integer not null check (total_amount > 0),
  special_requests text check (special_requests is null or char_length(special_requests) <= 1000),
  status text not null default 'pending_confirmation' check (status in ('pending_confirmation', 'confirmed', 'cancelled', 'declined', 'completed', 'no_show')),
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  constraint booking_dates_valid check (check_out > check_in)
);

alter table public.bookings add column if not exists confirmed_at timestamptz;

create index if not exists bookings_room_dates_idx on public.bookings (room_slug, check_in, check_out);
create index if not exists bookings_status_idx on public.bookings (status);

create or replace function public.enforce_booking_inventory()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_inventory integer;
  v_confirmed integer;
begin
  new.updated_at := now();

  if new.status <> 'confirmed' then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtext(new.room_slug));
  select inventory into v_inventory
  from public.room_types
  where slug = new.room_slug
  for update;

  if v_inventory is null then
    raise exception 'This room category is unavailable.' using errcode = 'P0002';
  end if;

  select count(*) into v_confirmed
  from public.bookings
  where room_slug = new.room_slug
    and status = 'confirmed'
    and id <> new.id
    and daterange(check_in, check_out, '[)') && daterange(new.check_in, new.check_out, '[)');

  if v_confirmed >= v_inventory then
    raise exception 'No rooms in this category are available for those dates.' using errcode = 'P0001';
  end if;

  if tg_op = 'INSERT' or old.status is distinct from 'confirmed' then
    new.confirmed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_booking_inventory_trigger on public.bookings;
create trigger enforce_booking_inventory_trigger
before insert or update on public.bookings
for each row execute function public.enforce_booking_inventory();

alter table public.room_types enable row level security;
alter table public.bookings enable row level security;
revoke all on public.room_types from anon, authenticated;
revoke all on public.bookings from anon, authenticated;

insert into public.room_types (slug, name, property, nightly_rate, max_adults, max_children, inventory)
values
  ('standard-deluxe-annex', 'Standard Deluxe', 'annex', 50000, 2, 1, 1),
  ('royal-deluxe-annex', 'Royal Deluxe', 'annex', 60000, 2, 1, 1),
  ('executive-suite-annex', 'Executive Suite', 'annex', 70000, 3, 1, 1),
  ('executive-deluxe', 'Executive Deluxe', 'main', 100000, 2, 1, 1),
  ('royal-superior', 'Royal Superior', 'main', 120000, 2, 2, 1),
  ('studio-room', 'Studio Room', 'main', 150000, 2, 1, 1),
  ('diplomatic-suite', 'Diplomatic Suite', 'main', 200000, 3, 2, 1),
  ('presidential-suite', 'Presidential Suite', 'main', 500000, 4, 3, 1)
on conflict (slug) do update set
  name = excluded.name,
  property = excluded.property,
  nightly_rate = excluded.nightly_rate,
  max_adults = excluded.max_adults,
  max_children = excluded.max_children,
  updated_at = now();

create or replace function public.create_booking_request(
  p_room_slug text,
  p_check_in date,
  p_check_out date,
  p_adults smallint,
  p_children smallint,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_special_requests text default null
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_room public.room_types%rowtype;
  v_nights integer;
  v_reserved integer;
  v_reference text;
  v_token text;
  v_id uuid;
begin
  if p_check_in < current_date then raise exception 'Check-in cannot be in the past.' using errcode = '22023'; end if;
  if p_check_out <= p_check_in then raise exception 'Check-out must be after check-in.' using errcode = '22023'; end if;
  if length(trim(coalesce(p_guest_name, ''))) not between 2 and 120 then raise exception 'Enter a guest name between 2 and 120 characters.' using errcode = '22023'; end if;
  if coalesce(p_guest_email, '') !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Enter a valid email address.' using errcode = '22023'; end if;
  if length(trim(coalesce(p_guest_email, ''))) > 200 then raise exception 'Email address must be under 200 characters.' using errcode = '22023'; end if;
  if length(regexp_replace(coalesce(p_guest_phone, ''), '[^0-9+]', '', 'g')) < 8 then raise exception 'Enter a valid phone number.' using errcode = '22023'; end if;
  if length(trim(coalesce(p_guest_phone, ''))) > 30 then raise exception 'Phone number must be under 30 characters.' using errcode = '22023'; end if;
  if length(coalesce(p_special_requests, '')) > 1000 then raise exception 'Special requests must be under 1,000 characters.' using errcode = '22023'; end if;

  perform pg_advisory_xact_lock(hashtext(p_room_slug));
  select * into v_room from public.room_types where slug = p_room_slug and active = true for update;
  if not found then raise exception 'This room category is unavailable.' using errcode = 'P0002'; end if;
  if p_adults < 1 or p_adults > v_room.max_adults or p_children < 0 or p_children > v_room.max_children then
    raise exception '% supports up to % adults and % children.', v_room.name, v_room.max_adults, v_room.max_children using errcode = '22023';
  end if;

  -- A request does not silently hold inventory. Only staff-confirmed stays count
  -- as reserved; the confirmation trigger below prevents staff overbooking.
  select count(*) into v_reserved
  from public.bookings
  where room_slug = p_room_slug
    and status = 'confirmed'
    and daterange(check_in, check_out, '[)') && daterange(p_check_in, p_check_out, '[)');
  if v_reserved >= v_room.inventory then raise exception 'No rooms in this category are available for those dates.' using errcode = 'P0001'; end if;

  v_nights := p_check_out - p_check_in;
  v_reference := 'SJH-' || to_char(clock_timestamp(), 'YYYYMMDD') || '-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
  v_token := encode(gen_random_bytes(24), 'hex');
  insert into public.bookings (
    reference, access_token_hash, room_slug, guest_name, guest_email, guest_phone,
    check_in, check_out, nights, adults, children, nightly_rate, total_amount, special_requests
  ) values (
    v_reference, encode(digest(v_token, 'sha256'), 'hex'), p_room_slug, trim(p_guest_name), lower(trim(p_guest_email)), trim(p_guest_phone),
    p_check_in, p_check_out, v_nights, p_adults, p_children, v_room.nightly_rate, v_room.nightly_rate * v_nights, nullif(trim(p_special_requests), '')
  ) returning id into v_id;

  return jsonb_build_object(
    'id', v_id, 'reference', v_reference, 'access_token', v_token,
    'status', 'pending_confirmation', 'room_slug', v_room.slug, 'room_name', v_room.name,
    'check_in', p_check_in, 'check_out', p_check_out, 'nights', v_nights,
    'nightly_rate', v_room.nightly_rate, 'total_amount', v_room.nightly_rate * v_nights,
    'created_at', now()
  );
end;
$$;

create or replace function public.get_booking(p_reference text, p_access_token text)
returns jsonb
language sql
security definer
stable
set search_path = public, extensions
as $$
  select jsonb_build_object(
    'reference', b.reference, 'status', b.status, 'room_slug', b.room_slug, 'room_name', r.name,
    'guest_name', b.guest_name, 'check_in', b.check_in, 'check_out', b.check_out,
    'nights', b.nights, 'adults', b.adults, 'children', b.children,
    'nightly_rate', b.nightly_rate, 'total_amount', b.total_amount,
    'special_requests', b.special_requests, 'created_at', b.created_at
  )
  from public.bookings b join public.room_types r on r.slug = b.room_slug
  where b.reference = upper(trim(p_reference))
    and b.access_token_hash = encode(digest(p_access_token, 'sha256'), 'hex');
$$;

create or replace function public.cancel_booking_request(p_reference text, p_access_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_booking public.bookings%rowtype;
begin
  select * into v_booking from public.bookings
  where reference = upper(trim(p_reference))
    and access_token_hash = encode(digest(p_access_token, 'sha256'), 'hex')
  for update;
  if not found then raise exception 'Booking not found.' using errcode = 'P0002'; end if;
  if v_booking.status <> 'pending_confirmation' then raise exception 'Only pending booking requests can be cancelled online.' using errcode = 'P0001'; end if;
  update public.bookings set status = 'cancelled', cancelled_at = now(), updated_at = now() where id = v_booking.id;
  return jsonb_build_object('reference', v_booking.reference, 'status', 'cancelled');
end;
$$;

revoke all on function public.create_booking_request(text,date,date,smallint,smallint,text,text,text,text) from public;
revoke all on function public.get_booking(text,text) from public;
revoke all on function public.cancel_booking_request(text,text) from public;
grant execute on function public.create_booking_request(text,date,date,smallint,smallint,text,text,text,text) to anon, authenticated;
grant execute on function public.get_booking(text,text) to anon, authenticated;
grant execute on function public.cancel_booking_request(text,text) to anon, authenticated;

comment on column public.room_types.inventory is 'Set this to the actual number of sellable rooms in this category before launch.';
comment on table public.bookings is 'Real website reservation requests. Hotel staff confirm or decline requests in Supabase.';
comment on function public.enforce_booking_inventory() is 'Prevents staff from confirming more overlapping stays than configured room inventory.';
