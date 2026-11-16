// Smoke tests: routes, i18n parity, links, hreflang, calculator maths, lead API. Run: npm test
import { spawn } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { routes, langs, href } from '../src/lib/routes.mjs';
import he from '../src/content/he.mjs';
import en from '../src/content/en.mjs';
import { compute, validate } from '../public/js/calc.js';

let passed = 0;
const t = async (name, fn) => { try { await fn(); passed++; console.log('  ✓', name); } catch (e) { console.error('  ✗', name, '\n   ', e.message); process.exitCode = 1; } };

/* ---- content parity ---- */
const shape = (o, p = '') => Array.isArray(o) ? [`${p}[${o.length}]`, ...o.flatMap((x, i) => shape(x, `${p}[]`))] : o && typeof o === 'object' ? Object.keys(o).sort().flatMap((k) => shape(o[k], `${p}.${k}`)) : [p];
await t('he/en content have identical structure', () => {
  const a = new Set(shape(he)), b = new Set(shape(en));
  const diff = [...a].filter((x) => !b.has(x)).concat([...b].filter((x) => !a.has(x)));
  assert.deepEqual(diff, []);
});

/* ---- calculator ---- */
await t('calculator: defaults compute correctly', () => {
  const r = compute({ tasks: 400, minutes: 12, saved: 30, rate: '' });
  assert.equal(r.baseHours, 80); assert.equal(r.freedHours, 24); assert.equal(r.workdays, 3);
  assert.ok(Math.abs(r.extraTasks - 400 * 0.3 / 0.7) < 1e-9); assert.equal(r.value, null);
});
await t('calculator: optional cost gives a scenario value', () => assert.equal(compute({ tasks: 400, minutes: 12, saved: 30, rate: 100 }).value, 2400));
await t('calculator: invalid input is rejected', () => {
  for (const bad of [{ tasks: 0 }, { tasks: '' }, { minutes: -1 }, { saved: 95 }, { saved: 0 }, { rate: -5 }, { tasks: 'abc' }]) {
    const v = { tasks: 400, minutes: 12, saved: 30, rate: '', ...bad };
    assert.ok(Object.keys(validate(v)).length, JSON.stringify(bad)); assert.equal(compute(v), null);
  }
});

/* ---- server ---- */
const dataDir = await mkdtemp(join(tmpdir(), 'bee-co-leads-'));
const port = 3900 + Math.floor(Math.random() * 90);
const srv = spawn('node', ['server.mjs'], { env: { ...process.env, PORT: String(port), LEAD_DATA_DIR: dataDir, LEAD_ADAPTER: 'dev' }, stdio: 'pipe' });
await new Promise((r) => srv.stdout.on('data', (d) => /on http/.test(d) && r()));
const base = `http://localhost:${port}`;
const get = async (p) => { const r = await fetch(base + p); return { status: r.status, text: await r.text() }; };

const pages = {};
await t('every route in both languages returns 200 with correct lang/dir/title/h1', async () => {
  for (const lang of langs) for (const r of routes) {
    const url = href(lang, r.key); const { status, text } = await get(url); pages[url] = text;
    assert.equal(status, 200, url);
    assert.match(text, new RegExp(`<html lang="${lang}" dir="${lang === 'he' ? 'rtl' : 'ltr'}">`), url);
    assert.match(text, /<title>[^<]{10,}<\/title>/, url);
    assert.equal((text.match(/<h1[\s>]/g) || []).length, 1, 'exactly one h1 on ' + url);
    assert.match(text, /<meta name="description" content="[^"]{40,}"/, url);
    assert.match(text, /rel="canonical"/); assert.match(text, /hreflang="x-default"/);
  }
});
await t('all internal links resolve (no dead ends)', async () => {
  const seen = new Set();
  for (const html of Object.values(pages)) for (const m of html.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) seen.add(m[1]);
  for (const l of seen) { if (/\.(css|svg|js)$/.test(l) || l.startsWith('/assets')) continue; assert.equal((await get(l)).status, 200, 'dead link ' + l); }
});
await t('language switch maps to the equivalent page', () => {
  for (const r of routes) {
    assert.ok(pages[href('he', r.key)].includes(`href="${href('en', r.key)}" hreflang="en"`), 'he→en ' + r.key);
    assert.ok(pages[href('en', r.key)].includes(`href="${href('he', r.key)}" hreflang="he"`), 'en→he ' + r.key);
  }
});
await t('generic use case replaces the solution pages', () => {
  for (const lang of langs) { const c = lang === 'he' ? he : en;
    const page = pages[href(lang, 'usecase')];
    assert.ok(page, 'use case page ' + lang);
    assert.equal((page.match(/role="tab"/g) || []).length, c.usecase.pains.items.length, 'one tab per pain ' + lang);
    assert.equal((page.match(/role="tabpanel"/g) || []).length, c.usecase.pains.items.length, 'one panel per pain ' + lang);
    assert.equal((page.match(/class="dp-gate"/g) || []).length, c.usecase.path.gates.length, 'a decision between stages ' + lang);
    assert.doesNotMatch(page, /class="why"/, 'comparison moved off the use case page ' + lang);
    const about = pages[href(lang, 'about')];
    assert.equal((about.match(/class="yb-bar /g) || []).length, c.about.why.rows.length * 3, 'comparison bars on about ' + lang);
    for (const k of ['home', 'how', 'usecase']) assert.doesNotMatch(pages[href(lang, k)], /data-pipeline/, 'no before/after diagram on ' + k + ' ' + lang);
    assert.ok(pages[href(lang, 'home')].includes(`href="${href(lang, 'usecase')}"`), 'home links to use case ' + lang);
  }
  for (const [u, html] of Object.entries(pages)) assert.doesNotMatch(html, /href="(\/en)?\/solutions\//, 'link to removed solution page on ' + u);
});
await t('results page shows the measurement flow and the measures with outcomes', () => {
  for (const lang of langs) { const c = lang === 'he' ? he : en, r = c.results, page = pages[href(lang, 'results')];
    assert.equal((page.match(/<li class="mf mf--/g) || []).length, r.flow.nodes.length, 'flow nodes ' + lang);
    assert.equal((page.match(/class="mf mf--gate"/g) || []).length, 2, 'two decisions ' + lang);
    assert.equal((page.match(/<li class="kpi /g) || []).length, r.measures.items.length, 'measure cards ' + lang);
    for (const x of r.measures.items) assert.ok(x.outcome && page.includes(x.outcome), 'outcome for ' + x.h);
  }
});
await t('about page: hero beside the portrait, experience ledger, comparison', () => {
  for (const lang of langs) { const c = lang === 'he' ? he : en, a = c.about, page = pages[href(lang, 'about')];
    assert.match(page, /class="about-hero"[\s\S]*class="portrait"/, 'portrait in hero ' + lang);
    assert.equal((page.match(/<p class="xp-from">/g) || []).length, a.map.rows.length, 'experience rows ' + lang);
    for (const x of a.map.rows) assert.ok(page.includes(x.to), 'what it means: ' + x.to);
    assert.ok(page.includes(a.why.title), 'comparison on about ' + lang);
  }
});
await t('illustrative content is labelled; no invented proof', () => {
  for (const [u, html] of Object.entries(pages)) { assert.doesNotMatch(html, /testimonial|עדות מלקוח\b(?!ות)/i, u); }
  assert.match(pages['/'], /להמחשה/); assert.match(pages['/en'], /illustrative/i);
});
await t('repositioning: named founder, no prices, no size limits, slim form', () => {
  for (const [u, html] of Object.entries(pages)) {
    for (const bad of [/30[–-]300/, /WalkMe|Resident\b|Agora|ClickDimensions|Sizmek|Amdocs/i, /₪\s?\d/, /\d+\s?אלף/, /free working session/i, /פגישת עבודה ללא עלות/, /unlock/i, /mid-market budget/i, /hotfix|85%|תיקוני חירום|eight months|שמונה חודשים/i, /20\+ years of senior/i]) assert.doesNotMatch(html.replace(/<script[\s\S]*?<\/script>/g, ''), bad, `${bad} on ${u}`);
  }
  for (const lang of langs) { const c = lang === 'he' ? he : en, home = pages[href(lang, 'home')], contact = pages[href(lang, 'contact')];
    assert.ok(home.includes(c.founder.name), 'founder full name on home ' + lang);
    assert.ok(home.includes(c.founder.linkedin), 'LinkedIn on home ' + lang);
    assert.equal((home.match(/<li class="way">/g) || []).length, 3, 'Decide / Build / Lead ' + lang);
    assert.equal((home.match(/class="memo-row memo-row--/g) || []).length, c.home.memo.items.length, 'decision memo in hero ' + lang);
    assert.doesNotMatch(home, /class="spine/, 'no career timeline on home ' + lang);
    for (const f of ['name', 'company', 'detail', 'email']) assert.match(contact, new RegExp(`name="${f}"[^>]*required`), 'required ' + f + ' ' + lang);
    for (const f of ['size', 'budget', 'urgency']) assert.doesNotMatch(contact, new RegExp(`name="${f}"`), 'no ' + f + ' field ' + lang);
  }
});
await t('founder photo is served, sized and described', async () => {
  for (const lang of langs) { const c = lang === 'he' ? he : en;
    const alt = c.founder.photoAlt.replace(/&/g, '&amp;');
    for (const k of ['home', 'about']) { const img = (pages[href(lang, k)].match(/<img src="\/img\/eran-nachum-806\.jpg"[^>]*>/) || [''])[0];
      assert.ok(img.includes('width="806" height="772"') && img.includes(`alt="${alt}"`), 'photo with size and alt on ' + k + ' ' + lang); }
    assert.doesNotMatch(pages[href(lang, 'contact')], /<img [^>]*\/img\//, 'no photo on contact ' + lang);
    assert.doesNotMatch(pages[href(lang, 'home')], /face-160|class="avatar"/, 'no small face photo on home ' + lang);
  }
  for (const f of ['eran-nachum-806.jpg', 'eran-nachum-420.jpg']) {
    const r = await fetch(base + '/img/' + f); assert.equal(r.status, 200, f); assert.equal(r.headers.get('content-type'), 'image/jpeg', f);
  }
});
await t('campaign landing pages: memo, three situations, form on the page, slim header', () => {
  for (const lang of langs) { const c = lang === 'he' ? he : en;
    for (const id of Object.keys(c.industries)) { const page = pages[href(lang, 'lp-' + id)], d = c.industries[id];
      assert.ok(page, 'landing page ' + id + ' ' + lang);
      assert.equal((page.match(/class="memo-row memo-row--/g) || []).length, 3, 'memo on ' + id);
      assert.ok(page.includes(d.memo.for), 'industry memo on ' + id);
      assert.equal((page.match(/<p class="voice-q">/g) || []).length, d.situations.items.length, 'situations on ' + id);
      assert.match(page, new RegExp(`<form[^>]*id="lead"`), 'form on the page ' + id);
      assert.match(page, new RegExp(`name="pain" value="${id}"`), 'lead tagged with industry ' + id);
      assert.match(page, /site-header--lp/, 'slim header on ' + id);
      assert.doesNotMatch(page, /class="mobile-nav"/, 'no site menu on ' + id);
      assert.equal((page.match(/name="topic"/g) || []).length, d.situations.items.length, 'situation chips on ' + id);
      assert.match(page, /data-or="topic"/, 'message optional when a situation is picked on ' + id);
      assert.match(page, /class="lp-proof"/, 'proof strip on ' + id);
      assert.match(page, /data-track="cta_lp_mid"/, 'mid-page call to action on ' + id);
      assert.doesNotMatch(page, /Decision Sprint<\/p>|לספרינט החלטה<\/p>/, 'no jargon in the memo intro on ' + id);
    }
  }
});
await t('sitemap and robots', async () => {
  const sm = (await get('/sitemap.xml')).text; assert.equal((sm.match(/<url>/g) || []).length, (routes.length - 1) * 2);
  assert.match((await get('/robots.txt')).text, /Sitemap:/);
});
await t('unknown route is a 404 in the right language', async () => {
  const a = await get('/nope'), b = await get('/en/nope'); assert.equal(a.status, 404); assert.equal(b.status, 404);
  assert.match(a.text, /lang="he"/); assert.match(b.text, /lang="en"/);
});

const post = (body) => fetch(base + '/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const good = { name: 'Test Owner', company: 'Example Ltd', email: 'owner@example.com', detail: 'We need to decide whether to rebuild our quoting system.', consent: true, pain: 'usecase', lang: 'en', volume: '50–200' };
await t('lead API rejects invalid input server-side', async () => {
  let r = await post({ ...good, email: 'not-an-email' }); assert.equal(r.status, 400); assert.equal((await r.json()).errors.email, 'email');
  r = await post({ ...good, consent: false }); assert.equal(r.status, 400);
  r = await post({ ...good, name: '' }); assert.equal(r.status, 400);
  r = await post({ ...good, detail: '' }); assert.equal(r.status, 400);
  r = await post({ ...good, detail: '', topic: 'Every new customer means more people retyping orders.', email: 'topic@example.com' }); assert.notEqual(r.status, 400, 'a picked situation stands in for the message');
  r = await post({ ...good, role: undefined, phone: undefined }); assert.notEqual(r.status, 400);
  r = await post('{bad json'); assert.equal(r.status, 400);
  r = await post({ ...good, detail: 'x'.repeat(30000) }); assert.equal(r.status, 413);
});
await t('lead API: honeypot stores nothing; valid lead reports dev mode honestly', async () => {
  let r = await post({ ...good, website: 'http://spam' }); assert.equal(r.status, 200);
  r = await post(good); const j = await r.json(); assert.equal(r.status, 200); assert.equal(j.ok, true); assert.equal(j.mode, 'dev');
  const lines = (await readFile(join(dataDir, 'leads.jsonl'), 'utf8')).trim().split('\n'); assert.equal(lines.length, 3, 'one lead without optional fields, one with a picked situation, one full lead; the honeypot stored nothing');
  assert.equal(JSON.parse(lines.at(-1)).extra.volume, '50–200');
});
await t('lead API: rate limit kicks in', async () => {
  let last; for (let i = 0; i < 8; i++) last = await post({ ...good, email: `x${i}@example.com` }); assert.equal(last.status, 429);
});
await t('lead API: email adapter sends a plain-text email with reply-to the sender', async () => {
  const { createServer } = await import('node:http');
  const got = [];
  const fake = createServer((req, res) => { let b = ''; req.on('data', (d) => (b += d)); req.on('end', () => { got.push({ auth: req.headers.authorization, body: JSON.parse(b) }); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"id":"test"}'); }); });
  await new Promise((r) => fake.listen(0, r));
  const ePort = 4000 + Math.floor(Math.random() * 90);
  const es = spawn('node', ['server.mjs'], { env: { ...process.env, PORT: String(ePort), LEAD_ADAPTER: 'email', RESEND_API_KEY: 'test-key', LEAD_EMAIL_TO: 'owner@example.com', RESEND_API_URL: `http://localhost:${fake.address().port}/emails` }, stdio: 'pipe' });
  await new Promise((r) => es.stdout.on('data', (d) => /on http/.test(d) && r()));
  try {
    const r = await fetch(`http://localhost:${ePort}/api/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...good, name: 'Dana <b>Test</b>' }) });
    const j = await r.json(); assert.equal(r.status, 200); assert.equal(j.mode, 'email');
    assert.equal(got.length, 1); const m = got[0].body;
    assert.equal(got[0].auth, 'Bearer test-key'); assert.deepEqual(m.to, ['owner@example.com']); assert.equal(m.reply_to, good.email);
    assert.ok(m.text.includes(good.detail) && m.text.includes('Example Ltd'), 'message and company in the email');
    assert.equal(m.html, undefined, 'plain text only');
  } finally { es.kill(); fake.close(); }
});
await t('security headers present', async () => { const r = await fetch(base + '/'); assert.ok(r.headers.get('content-security-policy')); assert.equal(r.headers.get('x-content-type-options'), 'nosniff'); });

srv.kill();
console.log(`\n${passed} checks passed${process.exitCode ? ' — WITH FAILURES' : ''}`);
