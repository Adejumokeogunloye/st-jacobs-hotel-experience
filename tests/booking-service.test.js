import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { bookingConfigured, createBooking, getBooking, cancelBooking, normalizeGuestPhone } from '../src/booking-service.js';

test('phone numbers are normalized for Nigerian and international guests', () => {
  assert.equal(normalizeGuestPhone('0803 123 4567'), '+2348031234567');
  assert.equal(normalizeGuestPhone('803-123-4567'), '+2348031234567');
  assert.equal(normalizeGuestPhone('234 803 123 4567'), '+2348031234567');
  assert.equal(normalizeGuestPhone('+234 (0) 803 123 4567'), '+2348031234567');
  assert.equal(normalizeGuestPhone('+44 20 7946 0958'), '+442079460958');
  assert.throws(() => normalizeGuestPhone('call me later'), /valid phone number/);
});

test('booking service sends production reservation data through Supabase RPC', async t => {
  global.window = { __SUPABASE_CONFIG__: { url: 'https://hotel.supabase.co', anonKey: 'public-key' } };
  const calls=[];
  global.fetch=async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify({reference:'SJH-20261029-ABC12345',status:'pending_confirmation'}),{status:200,headers:{'content-type':'application/json'}})};
  t.after(()=>{delete global.window;delete global.fetch});
  assert.equal(bookingConfigured(),true);
  await createBooking({room:'executive-deluxe',checkIn:'2027-01-10',checkOut:'2027-01-12',adults:'2',children:'0',guestName:'Ada Guest',guestEmail:'ada@example.com',guestPhone:'+2348012345678',specialRequests:'Late arrival'});
  assert.equal(calls[0].url,'https://hotel.supabase.co/rest/v1/rpc/create_booking_request');
  assert.equal(calls[0].options.headers.apikey,'public-key');
  assert.deepEqual(JSON.parse(calls[0].options.body),{p_room_slug:'executive-deluxe',p_check_in:'2027-01-10',p_check_out:'2027-01-12',p_adults:2,p_children:0,p_guest_name:'Ada Guest',p_guest_email:'ada@example.com',p_guest_phone:'+2348012345678',p_special_requests:'Late arrival'});
});

test('booking service retrieves and cancels with both private credentials', async t => {
  global.window = { __SUPABASE_CONFIG__: { url: 'https://hotel.supabase.co/', anonKey: 'public-key' } };
  const names=[];global.fetch=async url=>{names.push(url);return new Response(JSON.stringify({status:'cancelled'}),{status:200,headers:{'content-type':'application/json'}})};
  t.after(()=>{delete global.window;delete global.fetch});
  await getBooking('SJH-REF','private-token');await cancelBooking('SJH-REF','private-token');
  assert.match(names[0],/get_booking$/);assert.match(names[1],/cancel_booking_request$/);
});

test('publishable Supabase keys use the public apikey header without a JWT bearer token', async t => {
  global.window = { __SUPABASE_CONFIG__: { url: 'https://hotel.supabase.co', anonKey: 'sb_publishable_browser-key' } };
  let headers;global.fetch=async(_url,options)=>{headers=options.headers;return new Response(JSON.stringify({reference:'SJH-REF'}),{status:200,headers:{'content-type':'application/json'}})};
  t.after(()=>{delete global.window;delete global.fetch});
  await getBooking('SJH-REF','private-token');
  assert.equal(headers.apikey,'sb_publishable_browser-key');
  assert.equal(headers.Authorization,undefined);
});

test('Supabase migration enforces private tables, capacity and atomic confirmation checks', async () => {
  const sql=await readFile(new URL('../supabase/migrations/202610290001_booking_system.sql',import.meta.url),'utf8');
  for(const required of ['enable row level security','revoke all on public.bookings','pg_advisory_xact_lock','daterange(check_in, check_out','status = \'confirmed\'','enforce_booking_inventory_trigger','pending_confirmation','access_token_hash','grant execute on function public.create_booking_request','cancel_booking_request']) assert.ok(sql.includes(required),required);
});

test('the production browser configuration targets the dedicated hotel project', async () => {
  const config=await readFile(new URL('../public/supabase-config.js',import.meta.url),'utf8');
  assert.match(config,/https:\/\/avcpoiuhiuxisdnznrhx\.supabase\.co/);
  assert.match(config,/anonKey: 'sb_publishable_[A-Za-z0-9_-]+'/);
});
