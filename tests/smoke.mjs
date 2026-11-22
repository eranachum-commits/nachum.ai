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
    assert.doesNotMatch(page, /class="decision-path"/, 'no decision path on the use case page ' + lang);
    assert.doesNotMatch(page, /class="why"/, 'comparison moved off the use case page ' + lang);
    const about = pages[href(lang, 'about')];
    assert.equal((about.match(/<ol class="why-points">[\s\S]*?<\/ol>/)[0].match(/<li /g) || []).length, c.about.why.points.length, 'why-me card on about ' + lang);
    assert.match(about, /class="why-card"[\s\S]*data-track="cta_about_why"/, 'why-me card has a booking action ' + lang);
    for (const k of ['home', 'how', 'usecase']) assert.doesNotMatch(pages[href(lang, k)], /data-pipeline/, 'no before/after diagram on ' + k + ' ' + lang);
    assert.ok(pages[href(lang, 'home')].includes(`href="${href(lang, 'usecase')}"`), 'home links to use case ' + lang);
  }
  for (const [u, html] of Object.entries(pages)) assert.doesNotMatch(html, /href="(\/en)?\/solutions\//, 'link to removed solution page on ' + u);
});
await t('results page: goal-to-decision flow and rules', () => {
  for (const lang of langs) { const c = lang === 'he' ? he : en, r = c.results, page = pages[href(lang, 'results')];
    assert.equal((page.match(/<li class="mf mf--/g) || []).length, r.flow.nodes.length, 'flow nodes ' + lang);
    assert.equal((page.match(/class="mf mf--gate"/g) || []).length, 2, 'two decisions ' + lang);
    assert.doesNotMatch(page, /class="sa-/, 'no success agreement sheet ' + lang);
    assert.doesNotMatch(page, /class="kpi/, 'no process-only KPI board ' + lang);
  }
});
await t('about page: first-person hero with the portrait, career line, story, experience ledger, comparison', () => {
  for (const lang of langs) { const c = lang === 'he' ? he : en, a = c.about, page = pages[href(lang, 'about')];
    assert.match(page, /class="about-hero"[\s\S]*class="portrait"/, 'portrait in hero ' + lang);
    assert.equal((page.match(/<p class="xp-from">/g) || []).length, a.map.rows.length, 'experience rows ' + lang);
    for (const x of a.map.rows) assert.ok(page.includes(x.to), 'what it means: ' + x.to);
    assert.ok(page.includes(a.why.title), 'why-me card on about ' + lang);
    assert.equal((page.match(/<ol class="career"[\s\S]*?<\/ol>/)[0].match(/<li/g) || []).length, a.career.items.length, 'career line in the hero ' + lang);
    assert.match(page, /<li class="now">/, 'career line ends at bee & co. ' + lang);
    assert.ok(page.includes('id="story-title"') && page.includes('class="about-quote"'), 'first-person story with the founder quote ' + lang);
    assert.equal((page.match(/<ul class="hands-tags">[\s\S]*?<\/ul>/)[0].match(/<li[ >]/g) || []).length, a.hands.tags.length, 'hands-on tags ' + lang);
    assert.doesNotMatch(page, /class="about-facts"/, 'no duplicate facts list ' + lang);
  }
});
await t('illustrative content is labelled; no invented proof', () => {
  for (const [u, html] of Object.entries(pages)) { assert.doesNotMatch(html, /testimonial|עדות מלקוח\b(?!ות)/i, u); }
  assert.match(pages['/'], /להמחשה/); assert.match(pages['/en'], /illustrative/i);
});
await t('repositioning: named founder, no prices, no size limits, slim form', () => {
  for (const [u, html] of Object.entries(pages)) {
    // The only currency figure on the site is the labelled illustrative calculation inside #examples.
    const noEx = html.replace(/<section class="section home-examples"[\s\S]*?<\/section>/, '');
    for (const bad of [/30[–-]300/, /WalkMe|Resident\b|Agora|ClickDimensions|Sizmek|Amdocs/i, /₪\s?\d/, /\d+\s?אלף/, /free working session/i, /פגישת עבודה ללא עלות/, /unlock/i, /mid-market budget/i, /hotfix|85%|תיקוני חירום|eight months|שמונה חודשים/i, /20\+ years of senior/i]) assert.doesNotMatch(noEx.replace(/<script[\s\S]*?<\/script>/g, ''), bad, `${bad} on ${u}`);
  }
  for (const lang of langs) { const c = lang === 'he' ? he : en, home = pages[href(lang, 'home')], contact = pages[href(lang, 'contact')];
    assert.ok(home.includes(c.founder.name), 'founder full name on home ' + lang);
    assert.ok(home.includes(c.founder.linkedin), 'LinkedIn on home ' + lang);
    assert.doesNotMatch(home, /class="memo-row/, 'no decision memo on the redesigned home ' + lang);
    assert.doesNotMatch(home, /class="spine/, 'no career timeline on home ' + lang);
    for (const f of ['name', 'company', 'detail', 'email']) assert.match(contact, new RegExp(`name="${f}"[^>]*required`), 'required ' + f + ' ' + lang);
    for (const f of ['size', 'budget', 'urgency']) assert.doesNotMatch(contact, new RegExp(`name="${f}"`), 'no ' + f + ' field ' + lang);
  }
});
await t('home: business-first hero, problems, illustrative examples, how we work, three services, trust, measurement, one conversion section', () => {
  for (const lang of langs) { const c = lang === 'he' ? he : en, h = c.home, home = pages[href(lang, 'home')];
    assert.ok(home.includes(`<h1>${h.hero.h1}</h1>`), 'business-value headline ' + lang);
    assert.ok(home.includes(h.hero.support) && home.includes(h.hero.primary), 'supporting line and primary action ' + lang);
    assert.match(home, /class="hero hero--home"[\s\S]*data-track="cta_hero"[\s\S]*href="\/(en\/)?examples"/, 'two actions above the fold ' + lang);
    assert.doesNotMatch(home, /class="record"|class="handoff"/, 'no ownership ledger in the hero ' + lang);
    // One plain workflow right after the hero: four steps in order, the AI step marked and branching into example agents.
    assert.match(home, /class="hero hero--home"[\s\S]*?<section class="section section--dark home-flow" id="flow"/, 'workflow follows the hero ' + lang);
    assert.equal((home.match(/class="wf-step wf-step--/g) || []).length, 4, 'four steps ' + lang);
    assert.equal((home.match(/class="wf-agents"[\s\S]*?<\/ul>/)[0].match(/<li[ >]/g) || []).length, h.flow.steps[1].agents.length, 'AI step branches into its agents ' + lang);
    assert.match(home, /wf-step--in[\s\S]*wf-step--ai[\s\S]*wf-step--team[\s\S]*wf-step--result/, 'steps in order ' + lang);
    // Order of the buyer journey.
    const order = ['id="flow"', 'id="services"', 'id="why"', 'id="talk"'].map((k) => home.indexOf(k));
    assert.ok(order.every((n, i) => n > 0 && (i === 0 || n > order[i - 1])), 'sections follow the buyer journey ' + lang);
    assert.doesNotMatch(home, /class="problems"|class="outcomes/, 'problems and outcomes lists were cut from the home page ' + lang);
    assert.doesNotMatch(home, /class="ex"/, 'examples live on their own page ' + lang);
    assert.ok(home.includes(`href="${href(lang, 'examples')}"`), 'home links to the examples page ' + lang);
    assert.doesNotMatch(home, /class="hw-step"/, 'no four-step path on the home page ' + lang);
    assert.doesNotMatch(home, /class="jr-stage"|jr-lane|data-armed/, 'the five-stage journey lives on the how-it-works page ' + lang);
    assert.doesNotMatch(home, /id="founder"|class="portrait"/, 'no founder section on home ' + lang);
    assert.equal((home.match(/<ol class="ways">/g) || []).length, 1, 'service families ' + lang);
    assert.equal((home.match(/class="acc-(lead|spec|you)"/g) || []).length, 3, 'who-does-what: lead, specialists, owner on your side ' + lang);
    assert.equal((home.match(/<li class="way">/g) || []).length, h.ways.items.length, 'service items ' + lang);
    assert.equal(h.ways.items.length, 3, 'three service families ' + lang);
    assert.equal((home.match(/class="way-get"/g) || []).length, 3, 'each service says what you get ' + lang);
    assert.equal((home.match(/class="way-first"/g) || []).length, 3, 'each service says how it starts ' + lang);
    assert.doesNotMatch(home, /class="svc"/, 'no five-service list ' + lang);
    assert.doesNotMatch(home, /still writes the code|שעדיין כותב את הקוד|I build it myself|I personally build|אני בונה בעצמי/, 'no solo-coder line on home ' + lang);
    assert.equal((home.match(/<article class="pillar">/g) || []).length, 3, 'three pillars ' + lang);
    assert.ok(home.includes(`href="${href(lang, 'results')}"`), 'measurement link ' + lang);
    assert.match(home, /data-track="cta_band"/, 'closing conversation section ' + lang);
    assert.doesNotMatch(home.replace(/<script[\s\S]*?<\/script>/g, ''), /revolutioni[sz]e|cutting-edge|next-generation|power of AI|guaranteed|מובטח/i, 'no generic AI phrases or guarantees ' + lang);
    assert.doesNotMatch(home.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' '), /\d{2,3}\s?%/, 'no unsupported percentage claims ' + lang);
  }
});
await t('examples page: four illustrative before/after scenarios, one worked calculation, no invented clients', () => {
  for (const lang of langs) { const c = lang === 'he' ? he : en, h = c, home = pages[href(lang, 'examples')];
    // Examples: four, all labelled illustrative, the arithmetic shown once, no invented clients.
    assert.equal((home.match(/<article class="ex">/g) || []).length, 4, 'four examples ' + lang);
    assert.equal((home.match(/class="ex-chip"/g) || []).length, 4, 'every example labelled illustrative ' + lang);
    assert.equal((home.match(/class="ex-calc"/g) || []).length, 1, 'one worked calculation ' + lang);
    assert.ok(home.replace(/<\/?bdi[^>]*>/g, '').includes(c.examples.calc.note), 'calculation says it is not a client result ' + lang);
    assert.match(c.examples.calc.note, lang === 'he' ? /לא תוצאה של לקוח/ : /not a bee & co\. client result/, 'calc disclaimer wording ' + lang);
    assert.match(c.examples.calc.note, lang === 'he' ? /קיבולת ולא חיסכון/ : /capacity, not automatically cash savings/, 'capacity is not savings ' + lang);
  }
});
await t('examples page: the first example is an interactive flowchart with a volume slider', () => {
  for (const lang of langs) { const c = lang === 'he' ? he : en, page = pages[href(lang, 'examples')], f = c.examples.flow;
    assert.equal((page.match(/data-flow\b/g) || []).length, 1, 'one flowchart ' + lang);
    assert.equal((page.match(/class="fl-mode"/g) || []).length, 2, 'today and with-a-solution views ' + lang);
    assert.equal((page.match(/class="fl-node /g) || []).length, 2 * (f.modes[0].nodes.length + 1), 'five steps plus the extra step in each view ' + lang);
    assert.equal((page.match(/class="fl-node [^"]*fl-node--gate/g) || []).length, 2, 'a decision in each view ' + lang);
    assert.match(page, /type="range"[^>]*data-sc-orders/, 'volume slider ' + lang);
    assert.match(page, /data-fl-problem/, 'problem-order switch ' + lang);
    assert.ok(f.modes.every((m) => m.nodes.length === 5 && m.nodes.every((n) => n.t && n.s && Number.isInteger(n.m))), 'every step has a title, an explanation and minutes ' + lang);
  }
});
await t('results page: four kinds of value, no promised percentage', () => {
  for (const lang of langs) { const c = lang === 'he' ? he : en, page = pages[href(lang, 'results')];
    assert.equal((page.match(/<ul class="kinds">[\s\S]*?<\/ul>/)[0].match(/<li[ >]/g) || []).length, 4, 'four kinds ' + lang);
    assert.equal((page.match(/class="metric-groups"[\s\S]*?<\/div><\/div>\s*<p/)[0].match(/<h3>/g) || []).length, c.results.kinds.groups.length, 'metric groups ' + lang);
    assert.doesNotMatch(page.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' '), /\d{2,3}\s?%/, 'no percentage claims ' + lang);
  }
});
await t('founder-led model is consistent: no page says Eran builds everything himself', () => {
  for (const [u, html] of Object.entries(pages)) {
    if (/\/for\//.test(u)) continue;
    assert.doesNotMatch(html.replace(/<script[\s\S]*?<\/script>/g, ''), /does much of the hands-on work (himself|myself)|I build it myself|I still design and build|עושה בעצמו חלק גדול|אני בונה בעצמי|no handoff|בלי העברת מקל/i, 'solo-builder claim on ' + u);
  }
  for (const lang of langs) { const about = pages[href(lang, 'about')], c = lang === 'he' ? he : en;
    assert.match(about, /class="co-lists"/, 'founder leads / specialists lists ' + lang);
    assert.equal((about.match(/class="co-lists"[\s\S]*?<\/div><\/div>/)[0].match(/<li[ >]/g) || []).length, c.about.co.leads.length + c.about.co.spec.length, 'co lists ' + lang);
  }
});
await t('how it works: the journey and the engagement timeline with decisions', () => {
  for (const lang of langs) { const c = lang === 'he' ? he : en, p = c.how, page = pages[href(lang, 'how')];
    assert.equal((page.match(/<li class="jr-stage">/g) || []).length, p.journey.stages.length, 'journey stages ' + lang);
    assert.equal((page.match(/<li class="run-step">/g) || []).length, p.run.steps.length, 'engagement steps ' + lang);
    assert.equal((page.match(/<li class="run-gate">/g) || []).length, p.run.steps.length - 1, 'a decision between steps ' + lang);
    for (const x of p.run.steps) assert.ok(x.covers.length && x.covers.every((i) => i >= 0 && i < p.journey.stages.length), 'step maps to journey stages: ' + x.h);
    assert.doesNotMatch(page, /<li class="way">/, 'no "where you can start" section ' + lang);
    assert.match(page, /href="#runs"/, 'hero links to the timeline ' + lang);
    assert.doesNotMatch(page, new RegExp(`class="cta-band"[\\s\\S]*href="${href(lang, 'how')}"[\\s\\S]*</section>`), 'no link to itself in the closing band ' + lang);
  }
});
await t('privacy policy: summary first, every section, simple layout, no draft banner', () => {
  for (const lang of langs) { const c = lang === 'he' ? he : en, p = c.privacy, page = pages[href(lang, 'privacy')];
    assert.doesNotMatch(page, /draft-banner|DRAFT|טיוטה/, 'no draft banner ' + lang);
    assert.match(page, /class="pv-short"/, 'summary first ' + lang);
    for (const x of p.sections) assert.match(page, new RegExp(`<h2 id="${x.id}">`), 'section ' + x.id + ' ' + lang);
    assert.doesNotMatch(page, /<table|pv-toc/, 'no tables or side contents ' + lang);
    assert.ok(page.includes(`${href(lang, 'contact')}?pain=privacy`), 'privacy request goes to the contact form ' + lang);
    assert.match(page, /<meta name="robots" content="noindex">/, 'kept out of search until legal sign-off ' + lang);
  }
});
await t('founder photo is served, sized and described', async () => {
  for (const lang of langs) { const c = lang === 'he' ? he : en;
    const alt = c.founder.photoAlt.replace(/&/g, '&amp;');
    for (const k of ['about']) { const img = (pages[href(lang, k)].match(/<img src="\/img\/eran-nachum-806\.jpg"[^>]*>/) || [''])[0];
      assert.ok(img.includes('width="806" height="772"') && img.includes(`alt="${alt}"`), 'photo with size and alt on ' + k + ' ' + lang); }
    assert.doesNotMatch(pages[href(lang, 'contact')], /<img [^>]*\/img\//, 'no photo on contact ' + lang);
    assert.doesNotMatch(pages[href(lang, 'home')], /face-160|class="avatar"/, 'no small face photo on home ' + lang);
  }
  for (const f of ['eran-nachum-806.jpg', 'eran-nachum-420.jpg']) {
    const r = await fetch(base + '/img/' + f); assert.equal(r.status, 200, f); assert.equal(r.headers.get('content-type'), 'image/jpeg', f);
  }
});
await t('campaign landing pages: home language narrowed to one domain', () => {
  for (const lang of langs) { const c = lang === 'he' ? he : en;
    for (const id of Object.keys(c.industries)) { const page = pages[href(lang, 'lp-' + id)], d = c.industries[id], n = d.situations.length;
      assert.ok(page, 'landing page ' + id + ' ' + lang);
      // Hero: the domain question, the one-partner lede, the home trust line, and a situation picker like the home page.
      const plain = page.replace(/<\/?bdi[^>]*>/g, '');
      assert.ok(plain.includes(d.lede), 'one-partner lede on ' + id);
      assert.ok(plain.includes(c.home.hero.trust), 'home trust line on ' + id);
      assert.match(page, /class="hero-pick" data-ladder/, 'situation picker in the hero on ' + id);
      assert.equal((page.match(/role="tab" id="lp-t-/g) || []).length, n, 'one tab per situation on ' + id);
      assert.equal((page.match(/class="pick-measure"/g) || []).length, n, 'measure in every panel on ' + id);
      assert.equal((page.match(/data-pick="/g) || []).length, n, 'every panel fills the form on ' + id);
      assert.match(page, /href="#journey"/, 'secondary action to the journey on ' + id);
      // Signature: the five shared stages, each traced through this domain.
      assert.equal(d.journey.length, 5, 'five journey lines for ' + id);
      assert.equal((page.match(/class="lp-here"/g) || []).length, 5, 'domain journey on ' + id);
      for (const s of c.how.journey.stages) assert.ok(page.includes(`<h3>${s.h}</h3>`), 'stage ' + s.h + ' on ' + id);
      // Proof of judgment, why bee & co., founder, FAQ, form.
      assert.equal((page.match(/class="memo-row memo-row--/g) || []).length, 3, 'memo on ' + id);
      assert.ok(plain.includes(d.memo.for), 'domain memo on ' + id);
      assert.equal((page.match(/class="pillar"/g) || []).length, c.home.why.items.length, 'why bee & co. pillars on ' + id);
      assert.doesNotMatch(page, /class="lp-founder"/, 'no founder strip on ' + id);
      assert.match(page, new RegExp(`<form[^>]*id="lead"`), 'form on the page ' + id);
      assert.match(page, new RegExp(`name="pain" value="${id}"`), 'lead tagged with domain ' + id);
      assert.equal((page.match(/name="topic"/g) || []).length, n, 'situation chips on ' + id);
      assert.match(page, /data-or="topic"/, 'message optional when a situation is picked on ' + id);
      assert.match(page, /class="lp-steps"/, 'how it starts beside the form on ' + id);
      assert.match(page, /site-header--lp/, 'slim header on ' + id);
      assert.doesNotMatch(page, /class="mobile-nav"/, 'no site menu on ' + id);
      assert.match(page, /data-lp-sticky/, 'sticky phone action on ' + id);
      assert.match(page, /data-track="cta_lp_mid"/, 'mid-page call to action on ' + id);
      assert.doesNotMatch(d.memo.for, /Decision Sprint|ספרינט/, 'no jargon in the memo intro on ' + id);
      // Voice: bee & co. does the work ("we"); Eran is named as the person who leads it, not as the subject of every step.
      assert.doesNotMatch(JSON.stringify(d), /Eran (does|works|takes|builds|learns|finds)|ערן (עושה|עובד|נכנס|בונה|לומד|מאתר)/, 'first-person plural voice on ' + id);
    }
  }
});
await t('analytics: Google is never in the page HTML; the tag loads only after consent', async () => {
  for (const [url, html] of Object.entries(pages)) {
    assert.doesNotMatch(html, /googletagmanager|google-analytics/, 'no Google script in the HTML of ' + url);
    assert.doesNotMatch(html, /name="ga-id"/, 'no GA ID without GA_MEASUREMENT_ID: ' + url);
    assert.doesNotMatch(html, /name="ads-conversion"|AW-\d/, 'no Google Ads ID without GOOGLE_ADS_CONVERSION: ' + url);
    assert.doesNotMatch(html, /facebook\.net|fbevents|name="meta-pixel"/, 'no Meta code in the HTML without META_PIXEL_ID: ' + url);
  }
  // The Ads conversion only goes through the consent-gated gtag, and only for a delivered lead.
  const js = await readFile(new URL('../public/js/app.js', import.meta.url), 'utf8');
  assert.match(js, /if \(gaOn && ADS_ON && name === 'generate_lead'\) window\.gtag\('event', 'conversion'/, 'Ads conversion is gated');
  assert.match(js, /if \(consent\(\) === 'yes'\) \{ loadGA\(\); loadMeta\(\); \}/, 'Meta pixel loads only with consent');
  assert.match(js, /autoConfig: false/, 'Meta automatic configuration is off');
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
