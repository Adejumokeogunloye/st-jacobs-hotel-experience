import { writeFile } from 'node:fs/promises';

const fallback = 'https://saintjacobshotel.com';
const source = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : fallback);
const site = source.replace(/\/$/, '');
const routes = ['/', '/rooms/', '/annex/', '/facilities/', '/blaze-and-jacob/', '/about/', '/gallery/', '/contact/', '/booking/'];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url><loc>${site}${route}</loc></url>`).join('\n')}
</urlset>
`;
const robots = `User-agent: *
Allow: /
Disallow: /manage-booking/
Sitemap: ${site}/sitemap.xml
`;

await Promise.all([
  writeFile(new URL('../public/sitemap.xml', import.meta.url), sitemap),
  writeFile(new URL('../public/robots.txt', import.meta.url), robots),
]);
