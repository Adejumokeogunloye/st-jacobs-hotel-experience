import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Vercel maps every public page root and nested room route to the internal shell', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const rewriteSources = new Set(config.rewrites.map(rule => rule.source));
  for (const route of ['rooms','annex','facilities','blaze-and-jacob','about','gallery','contact','booking','blog','manage-booking']) {
    assert.ok(rewriteSources.has(`/${route}`), `missing exact /${route} rewrite`);
    assert.ok(rewriteSources.has(`/${route}/:path*`), `missing nested /${route}/:path* rewrite`);
  }
  assert.equal(config.outputDirectory, 'dist');
  assert.equal(config.buildCommand, 'npm run build');
  assert.equal(config.trailingSlash, false);
});
