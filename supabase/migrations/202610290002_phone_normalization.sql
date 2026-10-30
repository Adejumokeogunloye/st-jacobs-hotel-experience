create or replace function public.normalize_guest_phone(p_phone text)
returns text
language plpgsql
immutable
strict
set search_path = public
as $$
declare
  v_phone text;
begin
  if p_phone !~ '^[+()0-9 .-]+$' then
    raise exception 'Enter a valid phone number, for example 0803 123 4567 or +234 803 123 4567.' using errcode = '22023';
  end if;

  v_phone := regexp_replace(trim(p_phone), '[() .-]', '', 'g');

  if v_phone ~ '^\+2340[0-9]{10}$' then
    v_phone := '+234' || substr(v_phone, 6);
  elsif v_phone ~ '^0[0-9]{10}$' then
    v_phone := '+234' || substr(v_phone, 2);
  elsif v_phone ~ '^[7-9][0-9]{9}$' then
    v_phone := '+234' || v_phone;
  elsif v_phone ~ '^234[0-9]{10}$' then
    v_phone := '+' || v_phone;
  elsif v_phone ~ '^[1-9][0-9]{7,14}$' then
    v_phone := '+' || v_phone;
  end if;

  if v_phone !~ '^\+[1-9][0-9]{7,14}$' then
    raise exception 'Enter a valid phone number, for example 0803 123 4567 or +234 803 123 4567.' using errcode = '22023';
  end if;

  return v_phone;
end;
$$;

create or replace function public.normalize_booking_phone()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.guest_phone := public.normalize_guest_phone(new.guest_phone);
  return new;
end;
$$;

create or replace trigger normalize_booking_phone_trigger
before insert or update of guest_phone on public.bookings
for each row execute function public.normalize_booking_phone();

revoke all on function public.normalize_guest_phone(text) from public;
revoke all on function public.normalize_guest_phone(text) from anon, authenticated;
revoke all on function public.normalize_booking_phone() from public;
revoke all on function public.normalize_booking_phone() from anon, authenticated;

comment on function public.normalize_guest_phone(text) is 'Normalizes Nigerian local and international guest phone numbers to E.164 before storage.';
