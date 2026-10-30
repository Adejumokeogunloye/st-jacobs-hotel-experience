import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Netlify Drop metadata preserves every pretty route and cache policy', async () => {
  const [redirects, headers] = await Promise.all([
    readFile(new URL('../public/_redirects', import.meta.url), 'utf8'),
    readFile(new URL('../public/_headers', import.meta.url), 'utf8'),
  ]);
  for (const route of ['rooms','annex','facilities','blaze-and-jacob','about','gallery','contact','booking','blog','manage-booking']) {
    assert.match(redirects, new RegExp(`/${route}/\\*\\s+/internal\\.html\\s+200`));
  }
  for (const path of ['/assets/*','/hero-frames/*','/images/*','/*.html','/*']) assert.ok(headers.includes(path));
  assert.match(headers, /X-Content-Type-Options: nosniff/);
});
