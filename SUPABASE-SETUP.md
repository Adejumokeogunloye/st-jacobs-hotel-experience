# Supabase booking setup

The website now contains a production reservation-request workflow. It checks confirmed room inventory, stores real guest requests in Supabase, generates a private booking reference/access code, supports status lookup, and lets guests cancel a request while it is still pending. A database trigger prevents staff from confirming more overlapping stays than the configured inventory.

## Connected production project

- Project: **St Jacobs Hotel**
- Public URL: `https://avcpoiuhiuxisdnznrhx.supabase.co`
- Region: West EU (Ireland)
- Migration installed: 29 October 2026
- Website configuration: `public/supabase-config.js`

The publishable browser key is intentionally present in the frontend. The secret key and database password must never be added to this repository.

## 1. Project ownership

The project currently lives in the Eleos Medical organization. Transfer the project or organization ownership to the hotel as part of the final commercial handover.

## 2. Database migration

Open **SQL Editor → New query** and run these files in order:

`supabase/migrations/202610290001_booking_system.sql`

`supabase/migrations/202610290002_phone_normalization.sql`

Both migrations have already been run on the connected production project. Keep them as the authoritative schema and run them in filename order on any replacement project. They create:

- `room_types`
- `bookings`
- private row-level security rules
- atomic inventory checks when requests are created and confirmed
- secure create, retrieve and cancel RPC functions
- Nigerian and international phone-number normalization before booking data is stored

## 3. Enter the real number of rooms

The migration deliberately seeds every category with an inventory of `1`, which prevents overbooking but may understate availability. Replace each value with the hotel's actual sellable room count:

Use `ROOM-INVENTORY-CONFIRMATION.md` to collect the eight confirmed figures from the hotel owner or reservations manager. Public hotel listings conflict and do not map all current Annex and Main Building categories, so they must not be copied into production without confirmation.

```sql
update public.room_types set inventory = 1 where slug = 'standard-deluxe-annex';
update public.room_types set inventory = 1 where slug = 'royal-deluxe-annex';
update public.room_types set inventory = 1 where slug = 'executive-suite-annex';
update public.room_types set inventory = 1 where slug = 'executive-deluxe';
update public.room_types set inventory = 1 where slug = 'royal-superior';
update public.room_types set inventory = 1 where slug = 'studio-room';
update public.room_types set inventory = 1 where slug = 'diplomatic-suite';
update public.room_types set inventory = 1 where slug = 'presidential-suite';
```

Change the numbers before running these statements.

## 4. Website connection

The static website is already connected through `public/supabase-config.js`. If the key is ever rotated, copy only:

- Project URL
- Public anon key

Do not send or place the service-role key in the website.

For a Git-connected Netlify/Vercel deployment, the checked-in publishable configuration works directly. Environment variables can instead override it during the build:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

The anon key is public by design. Access remains protected because tables have RLS enabled and visitors can only execute the limited RPC functions.

## 5. Staff operations

Hotel staff can review requests in **Table Editor → bookings**. New records use `pending_confirmation`. After the hotel verifies the request, staff should change `status` to `confirmed` or `declined`. Pending requests do not silently hold a room; the database rechecks inventory when staff confirms one and rejects an over-capacity confirmation.

The guest can view the current status with their reference and private access code. A pending request can be cancelled by the guest; confirmed bookings require direct contact with the hotel.

## 6. Live verification

Completed on 29 October 2026:

- Created, retrieved, cancelled and re-retrieved a reservation directly through the public RPC API.
- Submitted a second reservation through the actual browser booking page.
- Opened that reservation through its private reference/access code.
- Cancelled the synthetic request and verified the management page no longer offered cancellation.
- Confirmed anonymous visitors cannot query the private tables directly.
- Ran a transaction-only staff confirmation test in the production database: the first overlapping request was confirmed, the next confirmation beyond configured inventory was rejected, and the transaction was rolled back.
- Queried the production database after rollback and confirmed that zero audit bookings remained.

Still required before accepting hotel guests:

1. Confirm every room rate and inventory count.

## Current boundary

This is a real reservation-request system, not an instant-payment engine. It stores real guest data and checks inventory, but the hotel still confirms requests manually. Payment collection and transactional email/WhatsApp notifications require the hotel's chosen payment and messaging providers.
