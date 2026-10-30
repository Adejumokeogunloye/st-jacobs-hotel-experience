import test from 'node:test';
import assert from 'node:assert/strict';
import { POST as postEnquiry } from '../api/test-enquiries.js';

const jsonRequest = (url, body) => new Request(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

test('Vercel enquiry function validates without claiming delivery', async () => {
  const response = await postEnquiry(jsonRequest('https://hotel.example/api/test-enquiries', {
    name: 'Test Guest',
    email: 'guest@example.com',
    message: 'Please send room information.',
  }));
  assert.equal(response.status, 202);
  assert.match((await response.json()).message, /not connected/i);
});
