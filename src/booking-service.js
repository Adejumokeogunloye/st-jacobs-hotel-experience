const config = () => ({
  url: (window.__SUPABASE_CONFIG__?.url || import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, ''),
  key: window.__SUPABASE_CONFIG__?.anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
});

export const bookingConfigured = () => Boolean(config().url && config().key);

export function normalizeGuestPhone(value) {
  const input = String(value ?? '').trim();
  if (!input || !/^[+()\d\s.-]+$/.test(input)) {
    throw new Error('Enter a valid phone number, for example 0803 123 4567 or +234 803 123 4567.');
  }

  let compact = input.replace(/[()\s.-]/g, '');
  if (compact.startsWith('+2340')) compact = `+234${compact.slice(5)}`;
  else if (/^0\d{10}$/.test(compact)) compact = `+234${compact.slice(1)}`;
  else if (/^[7-9]\d{9}$/.test(compact)) compact = `+234${compact}`;
  else if (/^234\d{10}$/.test(compact)) compact = `+${compact}`;
  else if (!compact.startsWith('+') && /^[1-9]\d{7,14}$/.test(compact)) compact = `+${compact}`;

  if (!/^\+[1-9]\d{7,14}$/.test(compact)) {
    throw new Error('Enter a valid phone number, for example 0803 123 4567 or +234 803 123 4567.');
  }
  return compact;
}

async function rpc(name, payload) {
  const { url, key } = config();
  if (!url || !key) throw new Error('Online booking is being connected. Please contact reservations by phone or email.');
  const headers = { apikey: key, 'Content-Type': 'application/json' };
  // Legacy anon keys are JWTs and may also be used as the bearer token. The
  // newer sb_publishable keys authenticate through the apikey header only.
  if (!key.startsWith('sb_publishable_')) headers.Authorization = `Bearer ${key}`;
  let response;
  try {
    response = await fetch(`${url}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('We could not reach reservations. Check your connection and try again.');
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || result.error || 'Reservations could not complete this request.');
  if (result == null) throw new Error('The booking reference or access code is incorrect.');
  return result;
}

export const createBooking = data => rpc('create_booking_request', {
  p_room_slug: data.room,
  p_check_in: data.checkIn,
  p_check_out: data.checkOut,
  p_adults: Number(data.adults),
  p_children: Number(data.children),
  p_guest_name: data.guestName.trim(),
  p_guest_email: data.guestEmail.trim(),
  p_guest_phone: normalizeGuestPhone(data.guestPhone),
  p_special_requests: data.specialRequests?.trim() || null,
});

export const getBooking = (reference, accessToken) => rpc('get_booking', {
  p_reference: reference,
  p_access_token: accessToken,
});

export const cancelBooking = (reference, accessToken) => rpc('cancel_booking_request', {
  p_reference: reference,
  p_access_token: accessToken,
});
