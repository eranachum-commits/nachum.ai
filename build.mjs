// Static build: renders every route in both languages into dist/. Zero dependencies.
import { rm, mkdir, writeFile, readFile, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { routes, langs, href } from './src/lib/routes.mjs';
import { renderPage, render404 } from './src/lib/render.mjs';
import he from './src/content/he.mjs';
import en from './src/content/en.mjs';

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : '';
const site = (process.env.SITE_URL || vercelUrl || 'http://localhost:3000').replace(/\/$/, '');
// Draft content (prices, legal, domain: docs/APPROVALS.md) stays out of search engines on Vercel until ALLOW_INDEXING=1.
const blockIndexing = Boolean(process.env.VERCEL) && process.env.ALLOW_INDEXING !== '1';
const content = { he, en };
const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 8);

await rm('dist', { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });
await cp('public', 'dist', { recursive: true });

const css = (await readFile('src/fonts.css', 'utf8')) + (await readFile('src/styles.css', 'utf8'));
await writeFile('dist/assets/site.css', css);
const jsSrc = (await readFile('public/js/app.js', 'utf8')) + (await readFile('public/js/calc.js', 'utf8'));
// Google Analytics 4: set GA_MEASUREMENT_ID (G-…) in Vercel. The tag loads only after the visitor accepts analytics (public/js/app.js).
const ga = /^G-[A-Z0-9]{4,}$/.test(process.env.GA_MEASUREMENT_ID || '') ? process.env.GA_MEASUREMENT_ID : '';
const ctx = { site, cssHash: hash(css), jsHash: hash(jsSrc), draftNoindex: true, ga };

let count = 0;
for (const lang of langs) {
  for (const r of routes) {
    const url = href(lang, r.key);
    const out = join('dist', url === '/' ? '' : url, 'index.html');
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, renderPage(content[lang], r.key, ctx));
    count++;
  }
  await writeFile(`dist/404.${lang}.html`, render404(content[lang], ctx));
}

const urls = routes.filter((r) => r.key !== 'privacy').flatMap((r) => langs.map((l) => ({ l, r })));
const alt = (r) => langs.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${site}${href(l, r.key)}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${site}${href('he', r.key)}"/>`;
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.map(({ l, r }) => `<url><loc>${site}${href(l, r.key)}</loc>${alt(r)}</url>`).join('\n')}\n</urlset>\n`);
await writeFile('dist/robots.txt', blockIndexing ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${site}/sitemap.xml\n`);
// Hosts that look for a single 404.html (Vercel) get the Hebrew default
await cp('dist/404.he.html', 'dist/404.html');
console.log(`Built ${count} pages (+404s, sitemap, robots) for ${site}`);
