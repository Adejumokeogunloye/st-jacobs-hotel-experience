const headers = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
};

const reply = (status, data) => new Response(JSON.stringify(data), { status, headers });

export async function POST(request) {
  try {
    if (Number(request.headers.get('content-length') || 0) > 100000) return reply(413, { error: 'Request too large.' });
    const input = await request.json();
    if (!input.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email || '') || !input.message?.trim()) return reply(422, { error: 'Complete all fields with a valid email address.' });
    return reply(202, { message: 'Test enquiry validated. Email delivery is not connected.' });
  } catch {
    return reply(400, { error: 'Send a valid enquiry.' });
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: { allow: 'POST, OPTIONS' } });
}
