import { href, routes } from './routes.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

/* ---------- primitives ---------- */
export const btn = (c, label, url, cls = 'btn--primary', attrs = '') => `<a class="btn ${cls}" href="${url}" ${attrs}>${label}</a>`;
const bookUrl = (c, pain) => href(c.lang, 'contact') + (pain ? `?pain=${pain}` : '');
const head = (title, intro, id) => `<div class="section-head"><h2${id ? ` id="${id}"` : ''}>${title}</h2>${intro ? `<p class="lede">${intro}</p>` : ''}</div>`;
const ticks = (arr) => `<ul class="ticks">${arr.map((x) => `<li>${x}</li>`).join('')}</ul>`;
const section = (inner, cls = '', id = '', labelledby = '') => `<section class="section ${cls}"${id ? ` id="${id}"` : ''}${labelledby ? ` aria-labelledby="${labelledby}"` : ''}><div class="container">${inner}</div></section>`;
const extLink = (url, label, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${url}" rel="noopener" target="_blank">${label}</a>`;
const brandMark = () => `<svg class="brand-mark" viewBox="0 0 100 100" aria-hidden="true"><path class="mark-b" d="M28 13v62c0 8 6 14 14 14h20c15 0 27-12 27-27 0-14-11-25-25-26H44"/><path class="mark-cell" d="M45 36l13-8 13 8v16l-13 8-13-8z"/></svg>`;
const brandLockup = (c, full = false) => `<span class="brand-lockup">${brandMark()}<span class="logo-type"><span class="logo-name">bee &amp; co.</span><span class="logo-studio"><span>AI SOLUTIONS &amp;</span><span>TRANSFORMATION</span></span>${full ? `<span class="logo-descriptor"><i>${c.founder.by}</i></span>` : ''}</span></span>`;
// The founder's photo. Two widths via srcset; explicit size so nothing shifts while it loads.
const PHOTO = { src: '/img/eran-nachum-806.jpg', set: '/img/eran-nachum-420.jpg 420w, /img/eran-nachum-806.jpg 806w' };
const founderPanel = (c, { eager = false, sizes = '(min-width: 980px) 360px, 80vw' } = {}) => `<figure class="portrait"><span class="portrait-photo"><img src="${PHOTO.src}" srcset="${PHOTO.set}" sizes="${sizes}" width="806" height="772" alt="${esc(c.founder.photoAlt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></span><figcaption><span class="portrait-name">${c.founder.name}</span><span class="portrait-role">${c.founder.role}</span></figcaption></figure>`;

/* ---------- layout ---------- */
const NAV = ['examples', 'how', 'about', 'results', 'faq'];
function header(c, key) {
  // Campaign landing pages keep visitors on the page: logo, language and one action that scrolls to the form.
  if (key.startsWith('lp-')) {
    const other = c.lang === 'he' ? 'en' : 'he';
    return `<header class="site-header site-header--lp"><div class="container header-in">
  <a class="logo" href="${href(c.lang, 'home')}" aria-label="bee &amp; co. — ${esc(c.ui.home)}">${brandLockup(c)}</a>
  <nav class="nav nav--lp" aria-label="${esc(c.ui.main)}"><a class="lang-switch" href="__ALT__" hreflang="${other}" lang="${other}" aria-label="${esc(c.switchAria)}">${c.switchLabel}</a></nav>
  <a class="btn btn--primary btn--sm" href="#lead" data-track="cta_header">${c.lp.bookHere}</a>
</div></header>`;
  }
  const link = (k) => `<a href="${href(c.lang, k)}"${key === k ? ' aria-current="page"' : ''}>${c.nav[k]}</a>`;
  const other = c.lang === 'he' ? 'en' : 'he';
  return `<header class="site-header"><div class="container header-in">
  <a class="logo" href="${href(c.lang, 'home')}" aria-label="bee &amp; co. — ${esc(c.ui.home)}">${brandLockup(c)}</a>
  <nav class="nav" aria-label="${esc(c.ui.main)}">
    ${NAV.map(link).join('\n    ')}
    <a class="lang-switch" href="__ALT__" hreflang="${other}" lang="${other}" aria-label="${esc(c.switchAria)}">${c.switchLabel}</a>
  </nav>
  <a class="btn btn--primary btn--sm" href="${bookUrl(c)}" data-track="cta_header">${c.ui.book}</a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav" data-menu>${c.ui.menu}</button>
</div>
<nav class="mobile-nav" id="mobile-nav" aria-label="${esc(c.ui.main)}"><div class="container">
  ${NAV.map((k) => `<a href="${href(c.lang, k)}">${c.nav[k]}</a>`).join('\n  ')}
  <a href="__ALT__" hreflang="${other}" lang="${other}">${c.switchLabel}</a>
  <a class="btn btn--primary" href="${bookUrl(c)}">${c.ui.book}</a>
</div></nav></header>`;
}

function footer(c) {
  const f = c.footer;
  return `<footer class="site-footer"><div class="container">
  <div class="foot-grid">
    <div><a class="logo logo--footer" href="${href(c.lang, 'home')}">${brandLockup(c, true)}</a><p>${f.tag}</p></div>
    <div><h2>${f.cols.site}</h2><ul>${NAV.map((k) => `<li><a href="${href(c.lang, k)}">${c.nav[k]}</a></li>`).join('')}<li><a href="${href(c.lang, 'contact')}">${f.contact}</a></li><li>${extLink(c.founder.linkedin, c.founder.linkedinLabel)}</li></ul></div>
    <div><h2>${f.cols.example}</h2><ul><li><a href="${href(c.lang, 'usecase')}">${c.nav.usecase}</a></li></ul></div>
    <div><h2>${f.cols.industries}</h2><ul>${routes.filter((r) => r.key.startsWith('lp-')).map((r) => `<li><a href="${href(c.lang, r.key)}">${f.industries[r.key.slice(3)]}</a></li>`).join('')}</ul></div>
    <div><h2>${f.cols.legal}</h2><ul><li><a href="${href(c.lang, 'privacy')}">${f.privacy}</a></li><li><a href="${href(c.lang, 'security')}">${f.security}</a></li></ul></div>
  </div>
  <div class="foot-base"><span>${f.rights}</span><span>${f.note}</span></div>
</div></footer>
<div class="consent" role="dialog" aria-label="Cookies" data-consent hidden><p>${c.consent.text}</p>
<div class="btn-row"><button class="btn" type="button" data-consent-yes>${c.consent.accept}</button><button class="btn" type="button" data-consent-no>${c.consent.decline}</button></div>
<p class="small consent-more"><a href="${href(c.lang, 'privacy')}">${c.consent.more}</a></p></div>`;
}

// Every page carries the business and the website as one schema.org graph; a page's own nodes join it.
// Nodes refer to each other by '#org' / '#website' / '#founder', made absolute here.
function graph(c, ctx, ld) {
  const id = (s) => ctx.site + '/' + s;
  const abs = (v) => (typeof v === 'string' && /^#[a-z]+$/.test(v) ? id(v) : Array.isArray(v) ? v.map(abs) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, abs(x)])) : v);
  const base = [
    {
      '@type': 'ProfessionalService', '@id': '#org', name: 'bee & co.', alternateName: 'bee and co', url: ctx.site + '/',
      logo: { '@type': 'ImageObject', url: ctx.site + '/icon-512.png', width: 512, height: 512 },
      image: ctx.site + `/og/og-${c.lang}.png`, description: c.descriptor, areaServed: 'IL', knowsLanguage: ['he', 'en'],
      founder: { '@id': '#founder' },
    },
    { '@type': 'Person', '@id': '#founder', name: 'Eran Nachum', jobTitle: 'Founder', worksFor: { '@id': '#org' }, image: ctx.site + '/img/eran-nachum-806.jpg', sameAs: [c.founder.linkedin] },
    { '@type': 'WebSite', '@id': '#website', url: ctx.site + '/', name: 'bee & co.', inLanguage: ['he', 'en'], publisher: { '@id': '#org' } },
  ];
  const own = (ld ? [].concat(ld) : []).map(({ '@context': _, ...n }) => n);
  return abs({ '@context': 'https://schema.org', '@graph': [...base, ...own] });
}

export function layout({ c, key, meta, body, ctx, ld = '' }) {
  const other = c.lang === 'he' ? 'en' : 'he';
  const url = (l) => ctx.site + href(l, key);
  const fontPre = c.lang === 'he'
    ? ['IBMPlexSansHebrew-400-hebrew', 'IBMPlexSansHebrew-300-hebrew'] : ['IBMPlexSansHebrew-400-latin', 'IBMPlexSansHebrew-300-latin'];
  const html = `<!doctype html>
<html lang="${c.lang}" dir="${c.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.desc)}">
<link rel="canonical" href="${url(c.lang)}">
<link rel="alternate" hreflang="he" href="${url('he')}">
<link rel="alternate" hreflang="en" href="${url('en')}">
<link rel="alternate" hreflang="x-default" href="${url('he')}">
<meta property="og:type" content="website"><meta property="og:site_name" content="bee & co.">
<meta property="og:title" content="${esc(meta.title)}"><meta property="og:description" content="${esc(meta.desc)}">
<meta property="og:url" content="${url(c.lang)}"><meta property="og:locale" content="${c.ogLocale}"><meta property="og:locale:alternate" content="${other === 'he' ? 'he_IL' : 'en_US'}">
<meta property="og:image" content="${ctx.site}/og/og-${c.lang}.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(c.descriptor)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${ctx.site}/og/og-${c.lang}.png">
<meta name="theme-color" content="#dce4d8">
${ctx.ga ? `<meta name="ga-id" content="${ctx.ga}">` : ''}
${ctx.ga && ctx.adsConversion ? `<meta name="ads-conversion" content="${ctx.adsConversion}">` : ''}
${ctx.metaPixel ? `<meta name="meta-pixel" content="${ctx.metaPixel}">` : ''}
${ctx.noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${fontPre.map((f) => `<link rel="preload" href="/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`).join('\n')}
<link rel="stylesheet" href="/assets/site.css?v=${ctx.cssHash}">
<script type="application/ld+json">${json(graph(c, ctx, ld))}</script>
</head>
<body>
<a class="skip" href="#main">${esc(c.ui.skip)}</a>
${header(c, key)}
<main id="main">${body}</main>
${footer(c)}
<script type="module" src="/js/app.js?v=${ctx.jsHash}"></script>
</body></html>`;
  const out = html.replaceAll('__ALT__', href(other, key));
  return c.lang === 'he' ? isolateNumbers(out) : out;
}

// In RTL text, ranges like "15–30" or "2020" can be reordered by the bidi algorithm.
// Wrap each numeric run in an LTR isolate (text nodes only; never inside tags, <script>, <style>, <title>).
function isolateNumbers(html) {
  let skip = '';
  return html.split(/(<[^>]+>)/).map((tok) => {
    if (tok[0] === '<') {
      const m = /^<(\/?)(script|style|title)\b/i.exec(tok);
      if (m) skip = m[1] ? '' : m[2].toLowerCase();
      return tok;
    }
    if (skip) return tok;
    // The Latin brand name keeps its trailing period on the right side of the name inside Hebrew lines.
    return tok.replace(/\d[\d,.]*(?:[–-]\d[\d,.]*)?[+%]?/g, '<bdi dir="ltr">$&</bdi>').replace(/bee (?:&|&amp;) co\./g, '<bdi dir="ltr">$&</bdi>');
  }).join('');
}

const faqList = (items) => `<div class="faq">${items.map((i) => `<details><summary>${i.q}</summary><div class="ans"><p>${i.a}</p></div></details>`).join('')}</div>`;
const faqLd = (items) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })) });

/* ---------- lead form: four fields, the rest happens on the call ---------- */
function leadForm(c, { id = 'lead', pain = '', title = '', topics = [], topicL = '', detailHint = '' } = {}) {
  const F = c.form, f = F.f, E = F.errors, O = F.ok;
  const req = `<span aria-hidden="true"> *</span><span class="sr-only"> (${E.required})</span>`;
  const input = (n, label, { type = 'text', required = true, auto = '' } = {}) => `<div class="field"><label for="${id}-${n}">${label}${required ? req : ''}</label><input id="${id}-${n}" name="${n}" type="${type}" ${required ? 'required' : ''} ${auto ? `autocomplete="${auto}"` : ''} aria-describedby="${id}-${n}-e"><span class="err" id="${id}-${n}-e" role="alert"></span></div>`;
  return `<form class="form-card" data-lead-form id="${id}" novalidate method="post" action="/api/leads" data-lang="${c.lang}"
 data-m-required="${esc(E.required)}" data-m-email="${esc(E.email)}" data-m-consent="${esc(E.consent)}" data-m-fix="${esc(c.ui.fixField)}" data-m-sending="${esc(c.ui.sending)}" data-m-fail="${esc(F.fail)}" data-m-net="${esc(F.failNet)}"
 data-ok-h="${esc(O.h)}" data-ok-p="${esc(O.p)}" data-dev-h="${esc(O.devH)}" data-dev="${esc(O.dev)}" data-book-l="${esc(O.book)}">
<h2>${title || F.title}</h2>
<div class="form-grid">
${input('name', f.name, { auto: 'name' })}
${input('company', f.company, { auto: 'organization' })}
${topics.length ? `<fieldset class="field full topics"><legend>${topicL}</legend><div class="topic-opts">${topics.map((t, i) => `<label class="topic"><input type="radio" name="topic" value="${esc(t)}" id="${id}-t${i}"><span>${t}</span></label>`).join('')}</div></fieldset>` : ''}
<div class="field full"><label for="${id}-detail">${f.detail}${topics.length ? '' : req}</label><textarea id="${id}-detail" name="detail" maxlength="1500" ${topics.length ? 'data-or="topic"' : 'required'} aria-describedby="${id}-detail-h ${id}-detail-e"></textarea><span class="hint" id="${id}-detail-h">${detailHint || f.detailHint}</span><span class="err" id="${id}-detail-e" role="alert"></span></div>
${input('email', f.email, { type: 'email', auto: 'email' })}
${input('role', f.role, { required: false, auto: 'organization-title' })}
${input('phone', f.phone, { type: 'tel', required: false, auto: 'tel' })}
</div>
<div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
<input type="hidden" name="pain" value="${pain}"><input type="hidden" name="lang" value="${c.lang}"><input type="hidden" name="source" value=""><input type="hidden" name="ts" value="">
<div class="field"><div class="checkrow"><input id="${id}-consent" name="consent" type="checkbox" required aria-describedby="${id}-consent-e"><label for="${id}-consent">${F.consent.replace(/ראו מדיניות פרטיות|See the privacy policy/, (m) => `<a href="${href(c.lang, 'privacy')}">${m}</a>`)}</label></div><span class="err" id="${id}-consent-e" role="alert"></span></div>
<div class="form-status" role="status" aria-live="polite" tabindex="-1"></div>
<button class="btn btn--primary" type="submit" data-submit>${c.ui.send}</button>
</form>`;
}

/* ---------- decision memo (home hero and campaign landing pages) ---------- */
// An illustrative Decision Sprint memo: it shows the judgment itself — including what not to build —
// instead of describing it. Verdicts are always written out, never colour alone.
const VERDICT = { build: '<svg viewBox="0 0 24 21" aria-hidden="true"><path d="M6 0h12l6 10.5L18 21H6L0 10.5z"/></svg>', later: '<svg viewBox="0 0 24 21" aria-hidden="true"><path d="M6.6 1h10.8l5.4 9.5-5.4 9.5H6.6L1.2 10.5z"/></svg>', no: '<svg viewBox="0 0 24 21" aria-hidden="true"><path d="M6.6 1h10.8l5.4 9.5-5.4 9.5H6.6L1.2 10.5z"/><path d="M5 18 19 3"/></svg>' };
// The pending "?" cell is shown only while the verdicts are being revealed (data-play, set by app.js);
// without JS or with reduced motion the final verdicts simply show.
const PENDING = '<svg viewBox="0 0 24 21" aria-hidden="true"><path d="M6.6 1h10.8l5.4 9.5-5.4 9.5H6.6L1.2 10.5z"/><text x="12" y="14.6" text-anchor="middle">?</text></svg>';
function memoBlock(c, m) {
  const h = c.home.memo;
  return `<aside class="memo" aria-labelledby="memo-title" data-memo><div class="memo-head"><h2 id="memo-title">${h.title}</h2><span class="memo-chip">${h.chip}</span></div><p class="memo-for">${m.for}</p><ol class="memo-list">${m.items.map((x, i) => `<li class="memo-row memo-row--${x.k}" style="--d:${(0.9 + i * 1.1).toFixed(1)}s"><div><p class="memo-q">${x.q}</p><p class="memo-why">${x.why}</p></div><p class="memo-v"><span class="memo-pending" aria-hidden="true">${PENDING}</span><span class="memo-final">${VERDICT[x.k]}<span>${x.v}</span></span></p></li>`).join('')}</ol><p class="memo-foot">${m.foot}</p><div class="memo-by"><span>${h.by}</span><button class="memo-replay" type="button" data-memo-replay hidden>${h.replay}</button></div></aside>`;
}

// Who you'll be talking to, and what the call is: answers "what happens if I send this?" before the form.
const personCard = (c) => `<div class="person-card"><span class="person-mark" aria-hidden="true"></span><p class="person-l">${c.contact.person}</p><p class="person-n">${c.founder.name}</p><p class="person-r">${c.founder.role}</p><ul class="person-call">${c.contact.call.map((x) => `<li>${x}</li>`).join('')}</ul><p class="person-link">${extLink(c.founder.linkedin, c.founder.linkedinLabel)}</p></div>`;

/* ---------- shared blocks ---------- */
// Decide → Build → Lead is a real progression of responsibility, so it is drawn as one connected line.
// Service families add who it is for, what you receive and what you measure; "who does what" items stay short.
const waysLine = (c, w) => `<ol class="ways">${w.items.map((x) => `<li class="way"><h3>${x.h}</h3>${x.who ? `<p class="way-for"><span>${w.forL}</span>${x.who}</p>` : ''}<p>${x.p}</p>${x.get ? `<p class="way-get"><span>${w.getL}</span>${x.get}</p><p class="way-get"><span>${w.measureL}</span>${x.measure}</p>` : ''}<p class="way-first">${x.first}</p></li>`).join('')}</ol>`;
const ctaBand = (c, title, p, pain, { how = true, label = c.ui.book } = {}) => section(`<div class="cta-band"><h2>${title}</h2><p class="lede">${p}</p><div class="btn-row">${btn(c, label, bookUrl(c, pain), 'btn--primary', 'data-track="cta_band"')}${how ? btn(c, c.ui.seeHow, href(c.lang, 'how'), '') : ''}</div><p class="cta-note">${c.home.hero.note}</p></div>`, 'section--dark');
const pageHero = (c, h1, lede) => `<section class="page-hero"><div class="container"><h1>${h1}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</div></section>`;

/* ---------- the journey and stage coverage (home services, how it works) ---------- */
// Five stages in reading direction (mirrored in Hebrew), each with what you get and the decision that stays yours.
const journeyMap = (c) => { const j = c.how.journey;
  return `<div class="journey"><ol class="jr-stages">${j.stages.map((x, i) => `<li class="jr-stage"><span class="jr-n" aria-hidden="true">${i + 1}</span><h3>${x.h}</h3><p class="jr-p">${x.p}</p><p class="jr-get"><span>${j.getL}</span>${x.get}</p>${x.gate ? `<p class="jr-gate"><span>${j.gateL}</span>${x.gate}</p>` : ''}</li>`).join('')}</ol><p class="jr-note">${j.note}</p></div>`; };
// Which of the five stages something covers: hexes for the eye, the stage names as text.
const stageCover = (c, st, label) => { const S = c.how.journey.stages;
  return `<p class="svc-cover"><span class="svc-hexes" aria-hidden="true">${S.map((x, i) => `<i${st.includes(i) ? ' class="on"' : ''}></i>`).join('')}</span><span class="svc-cover-t"><span class="svc-cover-l">${label}:</span> ${st.map((i) => S[i].h).join(', ')}</span></p>`; };


/* ---------- pages ---------- */
const pages = {};

pages.home = (c) => {
  const h = c.home, hr = h.hero, pk = h.picker, wy = h.why, rl = h.roles, wk = h.ways, pr = h.problems, hw = h.how, ms = h.measure;
  // Five-second test: what we do (h1), why it matters (lede), why trust us (trust line), what next (two actions).
  // Beside it, the visitor finds themselves: four situations in an executive's own words. Picking one shows what is
  // usually going on and where we would start, and the action opens the contact form with that situation filled in.
  // Tabs reuse the situations-page script (data-ladder); panels after the first start hidden so nothing shifts on load.
  const pickTabs = pk.items.map((x, i) => `<button type="button" role="tab" id="hp-t-${i}" aria-controls="hp-p-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span class="pick-dot" aria-hidden="true"></span><span>${x.q}</span></button>`).join('');
  const pickPanels = pk.items.map((x, i) => `<div class="pick-panel" role="tabpanel" id="hp-p-${i}" aria-labelledby="hp-t-${i}" tabindex="0"${i ? ' hidden' : ''}><p class="pick-l">${pk.underL}</p><p class="pick-under">${x.under}</p><p class="pick-l">${pk.startL}</p><p class="pick-start">${x.start}</p>${btn(c, pk.cta, `${href(c.lang, 'contact')}?pain=${x.id}&amp;q=${encodeURIComponent(x.q)}`, 'btn--primary pick-cta', `data-track="cta_hero_pick" data-situation="${x.id}"`)}</div>`).join('');
  const picker = `<aside class="hero-pick" data-ladder data-vertical data-track-id="hero_situation" aria-labelledby="pick-title"><h2 id="pick-title">${pk.title}</h2><p class="pick-intro">${pk.intro}</p>
<div class="pick-tabs" role="tablist" aria-orientation="vertical" aria-labelledby="pick-title">${pickTabs}</div>
<div class="pick-panels">${pickPanels}</div><p class="pick-note">${pk.note}</p></aside>`;
  const hero = `<section class="hero hero--home"><div class="container hero-grid">
<div class="hero-copy"><p class="hero-line">${hr.line}</p><h1>${hr.h1}</h1><p class="hero-support">${hr.support}</p><p class="lede">${hr.sub}</p>
<div class="btn-row">${btn(c, hr.primary, bookUrl(c), 'btn--primary', 'data-track="cta_hero"')}${btn(c, hr.secondary, href(c.lang, 'examples'), '')}</div>
<p class="hero-trust">${hr.trust}</p></div>
${picker}</div></section>`;

  // Buyer journey after the hero: recognisable problems → what it looks like in practice → how we work and who does what
  // → the three service families → why trust us → how value is measured → talk.
  // One small line drawing per problem (ink strokes, one pollen accent): decorative, the text carries the meaning.
  const S = (inner) => `<svg class="prob-art" viewBox="0 0 120 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
  const HEX = (x, y, r = 7) => `<path class="pa-fill" d="M${x - r / 2} ${y - r * .87}h${r}l${r / 2} ${r * .87}-${r / 2} ${r * .87}h-${r}l-${r / 2}-${r * .87}z"/>`;
  const ART = [
    // manual work: email → typing into a grid, with a rework loop
    S(`<rect x="6" y="14" width="26" height="18" rx="3"/><path d="M6 17l13 9 13-9"/><path d="M38 23h20" stroke-dasharray="3 4"/><rect x="64" y="8" width="50" height="40" rx="3"/><path d="M64 20h50M64 32h50M82 8v40"/>${HEX(98, 26, 6)}<path d="M20 44c0 10 20 10 20 0" /><path d="M40 44l-3-4M40 44l-4 2"/>`),
    // costs grow with the business: rising bars, a person added with each
    S(`<path d="M8 56h104"/><rect x="14" y="40" width="16" height="16" rx="2"/><rect x="44" y="28" width="16" height="28" rx="2"/><rect x="74" y="14" width="16" height="42" rx="2"/><path d="M100 20l8-10 8 10M108 10v18"/>${HEX(22, 32, 5)}${HEX(52, 20, 5)}${HEX(82, 6, 5)}`),
    // customers wait: queue of people and a clock
    S(`<circle cx="22" cy="40" r="6"/><path d="M12 58c0-8 20-8 20 0"/><circle cx="50" cy="40" r="6"/><path d="M40 58c0-8 20-8 20 0"/><circle cx="78" cy="40" r="6"/><path d="M68 58c0-8 20-8 20 0"/><circle cx="102" cy="20" r="14"/><path d="M102 12v8l6 4"/>${HEX(102, 20, 3)}<path d="M22 22h20a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4h-6l-5 5v-5h-9a4 4 0 0 1-4-4v0a4 4 0 0 1 4-4z"/>`),
    // systems don't talk: two boxes with a broken link and hand-carried data
    S(`<rect x="6" y="14" width="34" height="34" rx="4"/><path d="M14 26h18M14 34h12"/><rect x="80" y="14" width="34" height="34" rx="4"/><path d="M88 26h18M88 34h12"/><path d="M40 31h12M68 31h12"/><path d="M54 24l5 14M62 24l-5 14" /><path d="M50 52c6 6 14 6 20 0" stroke-dasharray="3 4"/>${HEX(60, 31, 4)}`),
    // unclear where AI pays: signpost with a question mark
    S(`<path d="M60 8v52"/><path d="M60 14h36l8 7-8 7H60z"/><path d="M60 34H24l-8 7 8 7h36z"/>${HEX(78, 21, 4)}${HEX(42, 41, 4)}<path d="M104 46c0-5 8-5 8-10a6 6 0 0 0-12 0M106 56h.01"/>`),
  ];
  const problems = `${head(pr.title, pr.intro, 'problems-title')}<ul class="problems">${pr.items.map((x, i) => `<li>${ART[i]}<h3>${x.h}</h3><p>${x.p}</p><p class="prob-fix"><span>${pr.fixL}</span>${x.fix}</p></li>`).join('')}</ul><p class="ways-link"><a href="${href(c.lang, 'examples')}">${pr.more}</a></p>`;

  const how = `${head(hw.title, hw.intro, 'how-title')}<ol class="hw">${hw.steps.map((x, i) => `<li class="hw-step"><span class="hw-n" aria-hidden="true">${i + 1}</span><h3>${x.h}</h3><p>${x.p}</p></li>`).join('')}</ol>
<div class="hw-roles"><h3 class="as-h3" id="roles-title">${rl.title}</h3><p class="lede">${rl.intro}</p>${waysLine(c, rl)}</div>`;

  const services = `${head(wk.title, wk.intro, 'services-title')}${waysLine(c, wk)}<p class="ways-link"><a href="${href(c.lang, 'how')}">${wk.link}</a></p>`;

  const why = `${head(wy.title, wy.intro, 'why-title')}<div class="pillars">${wy.items.map((x) => `<article class="pillar"><h3>${x.h}</h3><p>${x.p}</p><p class="pillar-not"><span>${wy.notL}:</span> ${x.not}</p></article>`).join('')}</div>
<div class="trust-list"><h3>${wy.trustTitle}</h3>${ticks(wy.trust)}<p class="ways-link"><a href="${href(c.lang, 'security')}">${wy.trustLink}</a></p></div>`;

  const measure = `${head(ms.title, ms.intro, 'measure-title')}<ul class="outcomes outcomes--four">${ms.items.map((x) => `<li><h3>${x.h}</h3><p>${x.p}</p></li>`).join('')}</ul><p class="measure-note">${ms.note}</p><p class="ways-link"><a href="${href(c.lang, 'results')}">${ms.link}</a></p>`;

  const cta = section(`<div class="cta-band"><h2 id="cta-title">${h.cta.title}</h2><p class="lede">${h.cta.p}</p><div class="btn-row">${btn(c, h.cta.button, bookUrl(c), 'btn--primary', 'data-track="cta_band"')}${btn(c, c.ui.seeHow, href(c.lang, 'how'), '')}</div><p class="cta-note">${hr.note}</p></div>`, 'section--dark', 'talk', 'cta-title');

  const body = `${hero}
${section(services, 'home-services', 'services', 'services-title')}
${section(problems, 'section--tint home-problems', 'problems', 'problems-title')}
${section(how, 'home-how', 'how', 'how-title')}
${section(why, 'section--dark home-why', 'why', 'why-title')}
${section(measure, 'home-outcomes', 'measure', 'measure-title')}
${cta}`;
  const ld = {
    '@type': 'ProfessionalService', '@id': '#org',
    hasOfferCatalog: { '@type': 'OfferCatalog', name: wk.title, itemListElement: wk.items.map((x) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: x.h, description: x.p } })) },
  };
  return { meta: h.meta, body, ld };
};

pages.examples = (c) => {
  const ex = c.examples;
  // Illustrative scenarios only: labelled as such. The first one is a flowchart you can follow (public/js/app.js, data-flow)
  // with a calculator you can move; without JavaScript both views and the default numbers are simply shown.
  const fmt = (t, n) => t.replace('{n}', `<bdi dir="ltr">${n}</bdi>`);
  const fl = ex.flow;
  const node = (n, i, kind, extra = '') => `<li class="fl-node fl-node--${n.w}${kind ? ' fl-node--' + kind : ''}${extra}" data-min="${n.m}" data-step="${kind === 'branch' ? 'b' : i}">${kind === 'gate' ? `<span class="fl-tag fl-tag--no">${fl.no}</span>` : ''}${kind === 'branch' ? `<span class="fl-tag fl-tag--yes">${fl.yes}</span>` : ''}<button type="button" class="fl-btn" aria-pressed="false"><span class="fl-shape" aria-hidden="true">${kind === 'gate' ? '' : kind === 'branch' ? '' : i + 1}</span><span class="fl-t">${n.t}</span><span class="fl-m">${n.m ? `${n.m} ${fl.minU}` : ''}</span></button><p class="fl-s">${n.s}</p>${kind === 'branch' ? `<p class="fl-then">${n.then}</p>` : ''}</li>`;
  const chart = (md) => `<div class="fl-mode" id="fl-${md.id}" role="tabpanel" aria-labelledby="fl-tab-${md.id}"${md.id === 'solution' ? ' data-second' : ''}><p class="fl-total">${md.total}</p><ol class="fl-chart">${md.nodes.map((n, i) => node(n, i, i === 3 ? 'gate' : i === 4 ? 'end' : '')).join('').replace(/(<li class="fl-node[^>]*data-step="3"[\s\S]*?<\/li>)/, `$1${node(md.branch, 0, 'branch')}`)}</ol></div>`;
  const flow = `<div class="flow" data-flow data-min-u="${esc(fl.minU)}" data-l-step="${esc(fl.stepL)}" data-l-of="${esc(fl.ofL)}" data-l-elapsed="${esc(fl.elapsedL)}" data-l-done="${esc(fl.doneL)}" data-l-play="${esc(fl.play)}" data-l-pause="${esc(fl.pause)}" data-l-again="${esc(fl.again)}" data-l-idle="${esc(fl.idle)}">
<h4 class="fl-title">${fl.title}</h4><p class="fl-intro">${fl.intro}</p>
<div class="fl-bar"><div class="fl-tabs" role="tablist" aria-label="${esc(fl.tabsLabel)}">${fl.modes.map((md, i) => `<button type="button" role="tab" id="fl-tab-${md.id}" aria-controls="fl-${md.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${md.label}</button>`).join('')}</div>
<label class="fl-problem"><input type="checkbox" data-fl-problem> <span>${fl.problemL}</span></label>
<button type="button" class="btn btn--primary btn--sm fl-play" data-fl-play hidden>${fl.play}</button></div>
<p class="fl-legend"><span class="fl-lg fl-lg--human">${fl.legend.human}</span><span class="fl-lg fl-lg--auto">${fl.legend.auto}</span></p>
${fl.modes.map(chart).join('')}
<div class="fl-detail" data-fl-detail aria-live="polite" hidden><p class="fl-d-idle">${fl.idle}</p></div>
<p class="fl-note">${fl.note}</p></div>`;
  const cl = ex.calc, cv = { orders: 1200, hours: 100, value: 11000 };
  const calc = `<div class="ex-calc" data-scenario data-hours="${esc(cl.hoursFmt)}" data-value="${esc(cl.valueFmt)}" data-lang="${c.lang}"><h3>${cl.title}</h3>
<div class="ex-slider"><label for="calc-orders">${cl.sliderL}</label><input id="calc-orders" type="range" min="100" max="5000" step="50" value="${cv.orders}" data-sc-orders></div>
<ul><li><span class="ex-n" data-sc-out="orders">${cl.items[0].n}</span><span class="ex-l">${cl.items[0].l}</span></li><li><span class="ex-n">${cl.items[1].n}</span><span class="ex-l">${cl.items[1].l}</span></li><li><span class="ex-n" data-sc-out="hours">${cl.items[2].n}</span><span class="ex-l">${cl.items[2].l}</span></li><li><span class="ex-n" data-sc-out="value">${cl.items[3].n}</span><span class="ex-l">${cl.items[3].l}</span></li></ul><p class="ex-note">${cl.note}</p></div>`;
  const examples = `<div class="examples">${ex.items.map((x, i) => `<article class="ex"><header class="ex-head"><p class="ex-tag">${x.tag}</p><span class="ex-chip">${c.ui.illustrative}</span><h3>${x.h}</h3></header>${i === 0 ? flow : `<div class="ex-ba"><div class="ex-before"><p class="ex-l2">${ex.beforeL}</p><p>${x.before}</p></div><div class="ex-after"><p class="ex-l2">${ex.afterL}</p><p>${x.after}</p></div></div>`}<p class="ex-value"><span>${ex.valueL}</span>${x.value}</p><div class="ex-metrics"><span>${ex.metricsL}</span><ul>${x.metrics.map((m) => `<li>${m}</li>`).join('')}</ul></div>${i === 0 ? calc : ''}</article>`).join('')}</div>`;

  const body = `${pageHero(c, ex.title, ex.intro)}
${section(examples, 'home-examples', 'examples', '')}
${ctaBand(c, ex.cta.title, ex.cta.p, 'examples', { how: false })}`;
  return { meta: ex.meta, body };
};

pages.usecase = (c) => {
  const p = c.usecase, pn = p.pains, ways = c.home.ways.items;
  // A leader's line of thought: which situation is mine → what's really going on → where it sits (Decide / Build / Lead)
  // → what Eran does → the first step → how I'll know it worked. Then how it unfolds, with my call at each step.
  const hero = pageHero(c, p.h1, p.lede).replace('</div></section>',
    `<div class="btn-row">${btn(c, p.heroCta, '#situations', 'btn--primary')}${btn(c, c.ui.book, bookUrl(c, 'usecase'), '')}</div></div></section>`);

  // Decide → Build → Lead lane: the engagement types this situation usually needs are lit.
  // The lane is visual; screen readers get the same answer as a plain list of the lit engagement types.
  const lane = (hit) => `<ol class="lane lane--ways" aria-hidden="true">${ways.map((w, i) => `<li${hit.includes(i) ? ' class="hit"' : ''}><span class="lane-hex"></span><span class="lane-l">${w.h}</span></li>`).join('')}</ol><p class="sr-only">${hit.map((i) => ways[i].h).join(', ')}</p>`;
  const tabs = pn.items.map((x, i) => `<button type="button" role="tab" id="st-${i}" aria-controls="s-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${x.q}</button>`).join('');
  const panels = pn.items.map((x, i) => `<div class="pain-panel" role="tabpanel" id="s-${i}" aria-labelledby="st-${i}" tabindex="0">
<p class="pain-quote">${x.q}</p>
<div class="sit-under"><h3>${pn.underL}</h3><p>${x.under}</p></div>
<div class="sit-ways"><h3>${pn.waysL}</h3>${lane(x.ways)}</div>
<div class="sit-do"><h3>${pn.doL}</h3><p>${x.do}</p></div>
<div class="pain-fix"><div><h3>${pn.firstL}</h3><p>${x.first}</p></div><div class="pain-measure"><h3>${pn.measureL}</h3><p>${x.measure}</p></div></div></div>`).join('');
  const picker = `<div class="pain-picker" data-ladder data-track-id="situation_picker"><div class="pain-tabs" role="tablist" aria-orientation="vertical" aria-label="${esc(pn.tabsLabel)}">${tabs}</div><div class="pain-panels">${panels}</div></div>`;

  const body = `${hero}
${section(`${head(pn.title, pn.intro, 'situations-title')}${picker}`, 'usecase-pains', 'situations', 'situations-title')}
${ctaBand(c, p.cta.title, p.cta.p, 'usecase')}`;
  return { meta: p.meta, body };
};

pages.how = (c) => {
  const p = c.how, j = p.journey, r = p.run;
  // The journey first (what one partner covers), then how an engagement actually runs along it.
  const hero = pageHero(c, p.h1, p.lede).replace('</div></section>',
    `<div class="btn-row">${btn(c, c.ui.book, bookUrl(c), 'btn--primary', 'data-track="cta_how_hero"')}${btn(c, p.heroLink, '#runs', '')}</div></div></section>`);
  // Timeline: a pollen rail (bee & co. owns every step) with the duration set large, what happens beside it,
  // and the journey stages each step covers. Your decision sits on the rail between steps.
  const run = `<ol class="run">${r.steps.map((x, i) => `<li class="run-step"><span class="run-n" aria-hidden="true">${i + 1}</span><div class="run-when"><p class="run-dur">${x.dur}</p></div><div class="run-what"><h3>${x.h}</h3><p>${x.p}</p></div><div class="run-out"><p class="jr-get"><span>${r.getL}</span>${x.get}</p>${stageCover(c, x.covers, r.coversL)}</div></li>${x.gate ? `<li class="run-gate"><p><span>${r.gateL}</span>${x.gate}</p></li>` : ''}`).join('')}</ol><p class="notice">${c.offers.note}</p>`;
  const body = `${hero}
${section(`${head(j.title, j.intro, 'journey-title')}${journeyMap(c)}`, 'section--tint how-journey', 'journey', 'journey-title')}
${section(`${head(r.title, r.intro, 'runs-title')}${run}`, 'how-runs', 'runs', 'runs-title')}
${section(`<div class="how-need"><h2 id="need-title">${p.needTitle}</h2>${ticks(p.need)}</div>`, 'section--tint how-needsec', 'need', 'need-title')}
${ctaBand(c, p.ctaTitle, p.ctaP, '', { how: false })}`;
  return { meta: p.meta, body };
};

pages.about = (c) => {
  const p = c.about, w = p.why, mp = p.map, cr = p.career, st = p.story, hd = p.hands;
  // First person, in the order a CEO asks: who are you → how did you get here → why this company → what it means for me
  // → why you over the alternatives → how you work → talk.
  // Signature: the career line under the hero. One continuous rule in ink, turning pollen at "Today": the same person all the way.
  const career = `<div class="career-wrap"><h2 class="as-h3" id="career-title">${cr.title}</h2><ol class="career" aria-labelledby="career-title">${cr.items.map((x, i) => `<li${i === cr.items.length - 1 ? ' class="now"' : ''}><p class="cl-when">${x.when}</p><h3>${x.h}</h3><p class="cl-p">${x.p}</p></li>`).join('')}</ol></div>`;
  const hero = `<section class="about-hero"><div class="container"><div class="about-hero-in">
<div class="about-hero-copy"><h1>${p.h1}</h1><p class="lede">${p.lede}</p>
<div class="btn-row">${btn(c, p.cta, bookUrl(c), 'btn--primary', 'data-track="cta_about_hero"')}${extLink(c.founder.linkedin, c.founder.linkedinLabel, 'btn')}</div></div>
<div class="about-hero-portrait">${founderPanel(c, { eager: true })}</div></div>
${career}</div></section>`;

  const story = `<div class="about-story"><figure class="about-quote"><blockquote><p>${st.quote}</p></blockquote><figcaption>${c.founder.name}</figcaption></figure>
<div class="about-prose"><h2 id="story-title">${st.title}</h2>${st.paras.map((x) => `<p>${x}</p>`).join('')}
<aside class="hands"><h3>${hd.title}</h3><p>${hd.p}</p><ul class="hands-tags">${hd.tags.map((x) => `<li>${x}</li>`).join('')}</ul></aside></div></div>`;

  // Each line reads left to right as one sentence: what I've done → what you get. The column labels are shown
  // once above the rows on wide screens and inside each row on narrow ones.
  const ledger = `<div class="xp"><p class="xp-head" aria-hidden="true"><span>${mp.fromL}</span><span>${mp.toL}</span></p><ul class="xp-rows">${mp.rows.map((x) => `<li class="xp-row"><p class="xp-from"><span class="xp-l">${mp.fromL}</span>${x.from}</p><span class="xp-link" aria-hidden="true"></span><p class="xp-to"><span class="xp-l">${mp.toL}</span>${x.to}</p></li>`).join('')}</ul></div>`;

  // Why me, in my own words: a signed card with one action. The three promises are a real sequence
  // (decide → build → stay), drawn as a hex line that lights up once when the card scrolls into view.
  const whyCard = `<div class="why-card" data-why><div class="why-main"><h2 id="why-title">${w.title}</h2><p class="why-lead">${w.lead}</p><div class="why-act">${btn(c, p.cta, bookUrl(c), 'btn--primary', 'data-track="cta_about_why"')}<span class="why-sign">${c.founder.name}</span></div></div><ol class="why-points">${w.points.map((x, i) => `<li style="--i:${i}"><span class="why-hex" aria-hidden="true"></span><div><h3>${x.h}</h3><p>${x.p}</p></div></li>`).join('')}</ol></div>`;

  // What "& co." means sits right under the card whose promise mentions the specialists: the name set large as the visual.
  const co = `<div class="co-note"><p class="co-mark" aria-hidden="true" dir="ltr">&amp; co.</p><div><h3>${p.co.h}</h3><p>${p.co.p}</p></div></div>
<div class="co-lists"><div><h4>${p.co.leadsL}</h4>${ticks(p.co.leads)}</div><div><h4>${p.co.specL}</h4>${ticks(p.co.spec)}</div></div>`;

  const body = `${hero}
${section(story, 'about-story-sec', 'story', 'story-title')}
${section(`${head(mp.title, mp.intro, 'xp-title')}${ledger}`, 'section--tint about-xp', 'experience', 'xp-title')}
${section(whyCard + co, 'about-why', 'why', 'why-title')}
${ctaBand(c, p.ctaTitle, p.ctaP, '', { label: p.cta })}`;
  const ld = { '@type': 'ProfilePage', mainEntity: { '@id': '#founder' } };
  return { meta: p.meta, body, ld };
};

pages.results = (c) => {
  const p = c.results, f = p.flow, r = p.rules;
  // General for every kind of engagement: the path from goal to decision (flowchart) → rules → talk.
  let n = 0;
  const node = (x, i) => {
    const shape = x.kind === 'step' ? `<span class="mf-shape" aria-hidden="true">${++n}</span>` : `<span class="mf-shape" aria-hidden="true"></span>`;
    const decide = i === f.nodes.length - 2
      ? `<p class="mf-yes"><strong>${f.yes}</strong></p><div class="mf-branch"><p class="mf-no"><strong>${f.no}</strong></p><p class="mf-alt"><span class="mf-t">${f.noNode.t}</span><span class="mf-s">${f.noNode.s}</span></p></div>` : '';
    const loop = i === f.nodes.length - 1 ? `<p class="mf-loop"><span aria-hidden="true">↻</span> ${f.loop}</p>` : '';
    return `<li class="mf mf--${x.kind}">${shape}<p class="mf-text"><span class="mf-t">${x.t}</span><span class="mf-s">${x.s}</span></p>${decide}${loop}</li>`;
  };
  const flow = `<ol class="mflow">${f.nodes.map(node).join('')}</ol>`;
  // The rules are the commitments, so they are set large and read as statements; the two notes sit under them as footnotes.
  const rules = `<div class="rules"><h2 id="rules-title">${r.title}</h2><ul class="rules-list">${r.items.map((x) => `<li><span class="rules-hex" aria-hidden="true"></span>${x}</li>`).join('')}</ul><div class="rules-notes"><div><h3>${r.monthly.h}</h3><p>${r.monthly.p}</p></div><div><h3>${r.honest.h}</h3><p>${r.honest.p}</p></div></div></div>`;
  // Four kinds of value are never interchangeable; the metrics are grouped by what a leader asks about.
  const k = p.kinds;
  const kinds = `${head(k.title, k.intro, 'kinds-title')}<ul class="kinds">${k.items.map((x) => `<li><h3>${x.h}</h3><p>${x.p}</p></li>`).join('')}</ul><h3 class="as-h3 kinds-sub">${k.metricsTitle}</h3><div class="metric-groups">${k.groups.map((g) => `<div><h3>${g.h}</h3><ul>${g.items.map((x) => `<li>${x}</li>`).join('')}</ul></div>`).join('')}</div><p class="notice">${k.noClaim}</p>`;
  const body = `${pageHero(c, p.h1, p.lede)}
${section(kinds, 'results-kinds', 'kinds', 'kinds-title')}
${section(`${head(f.title, f.intro, 'flow-title')}${flow}`, 'section--tint results-flow', 'flow', 'flow-title')}
${section(rules, 'results-rules', 'rules', 'rules-title')}
${ctaBand(c, p.cta.title, p.cta.p)}`;
  return { meta: p.meta, body };
};

pages.faq = (c) => {
  const p = c.faqPage;
  const body = `${pageHero(c, p.h1, '')}${section(faqList(c.faq.items))}${ctaBand(c, p.cta, c.home.cta.p)}`;
  return { meta: p.meta, body, ld: faqLd(c.faq.items) };
};

pages.security = (c) => {
  const p = c.security;
  const body = `${pageHero(c, p.h1, p.lede)}${section(`<div class="draft-banner">${p.draftNote}</div><div class="grid g3">${p.items.map((x) => `<article class="card"><h2 class="as-h3">${x.h}</h2><p>${x.p}</p></article>`).join('')}</div><div class="btn-row">${btn(c, p.cta, bookUrl(c), 'btn--primary')}</div>`)}`;
  return { meta: p.meta, body };
};

pages.contact = (c) => {
  const p = c.contact;
  const body = `${pageHero(c, p.h1, p.lede)}
${section(`<div class="split split--top"><div>${personCard(c)}${leadForm(c)}</div><aside class="aside-stack"><div class="card"><h3>${p.next.h}</h3><ol class="steps">${p.next.steps.map((x) => `<li>${x}</li>`).join('')}</ol></div><div class="card"><h3>${p.bring.h}</h3>${ticks(p.bring.items)}</div></aside></div>`)}`;
  return { meta: p.meta, body };
};

pages.privacy = (c) => {
  const p = c.privacy;
  // Kept simple: one readable column, the four-line summary first, then short sections of plain text and lists.
  const block = (b) => b.p ? `<p>${b.p}</p>` : `<ul>${b.list.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  const contact = btn(c, p.contactCta, `${href(c.lang, 'contact')}?pain=privacy&amp;q=${encodeURIComponent(c.lang === 'he' ? 'בקשת פרטיות' : 'Privacy request')}`, 'btn--primary');
  const body = `${pageHero(c, p.h1, p.lede).replace('</div></section>', `<p class="pv-updated">${p.updatedL}: <time>${p.updated}</time></p></div></section>`)}
${section(`<div class="pv"><div class="pv-short"><h2>${p.shortTitle}</h2>${ticks(p.short)}</div>
${p.sections.map((x) => `<h2 id="${x.id}">${x.h}</h2>${x.blocks.map(block).join('')}${x.id === 'contact' ? contact : ''}`).join('\n')}</div>`)}`;
  return { meta: p.meta, body };
};


/* ---------- campaign landing pages: one template, one content entry per domain ---------- */
// Same language as the home page, narrowed to one domain. A cold visitor's path:
// is this my business (question headline) → which of these is me (picker, as on home; its action fills the form)
// → what "one partner, end to end" means here (the five journey stages traced through this domain: the page's signature)
// → proof of judgment (the memo, including what not to build) → why bee & co. (home pillars) → my questions → talk.
// On phones a sticky action follows from the hero to the form.
function landing(c, id) {
  const L = c.lp, d = c.industries[id], pk = L.picker, J = c.how.journey, track = (k) => `data-track="${k}" data-industry="${id}"`;
  const tabs = d.situations.map((x, i) => `<button type="button" role="tab" id="lp-t-${i}" aria-controls="lp-p-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span class="pick-dot" aria-hidden="true"></span><span>${x.q}</span></button>`).join('');
  const panels = d.situations.map((x, i) => `<div class="pick-panel" role="tabpanel" id="lp-p-${i}" aria-labelledby="lp-t-${i}" tabindex="0"${i ? ' hidden' : ''}><p class="pick-l">${pk.underL}</p><p class="pick-under">${x.under}</p><p class="pick-l">${pk.startL}</p><p class="pick-start">${x.start}</p><p class="pick-measure"><span>${pk.measureL}</span>${x.measure}</p><a class="btn btn--primary pick-cta" href="#lead" data-pick="${i}" ${track('cta_lp_pick')}>${pk.cta}</a></div>`).join('');
  const picker = `<aside class="hero-pick" data-ladder data-vertical data-track-id="lp_situation" aria-labelledby="pick-title"><h2 id="pick-title">${pk.title}</h2><p class="pick-intro">${pk.intro}</p>
<div class="pick-tabs" role="tablist" aria-orientation="vertical" aria-labelledby="pick-title">${tabs}</div>
<div class="pick-panels">${panels}</div><p class="pick-note">${pk.note}</p></aside>`;
  const hero = `<section class="hero hero--home hero--lp"><div class="container hero-grid">
<div class="hero-copy"><p class="lp-kicker">${d.kicker}</p><h1>${d.h1}</h1><p class="lede">${d.lede}</p>
<div class="btn-row">${btn(c, L.primary, '#lead', 'btn--primary', track('cta_lp_hero'))}${btn(c, L.secondary, '#journey', '')}</div>
<p class="hero-trust">${c.home.hero.trust}</p></div>
${picker}</div></section>`;

  // The signature: the same five stages as the home page and How it works, each carried through this domain.
  // Stage names and your decision stay shared; the sentence in between is this business.
  const journey = `${head(L.journey.title, L.journey.intro, 'journey-title')}<div class="journey lp-journey"><p class="lp-here-l">${d.here}</p><ol class="jr-stages">${J.stages.map((s, i) => `<li class="jr-stage"><span class="jr-n" aria-hidden="true">${i + 1}</span><h3>${s.h}</h3><p class="lp-here">${d.journey[i]}</p>${s.gate ? `<p class="jr-gate"><span>${J.gateL}</span>${s.gate}</p>` : ''}</li>`).join('')}</ol><p class="jr-note">${J.note}</p></div>`;

  const memo = `<div class="lp-memo"><div class="lp-memo-copy"><h2 id="memo-sec-title">${L.memo.title}</h2><p class="lede">${L.memo.p}</p>${btn(c, L.bookHere, '#lead', 'btn--primary', track('cta_lp_mid'))}</div>${memoBlock(c, d.memo)}</div>`;

  const wy = c.home.why;
  const why = `${head(wy.title, wy.intro, 'why-title')}<div class="pillars">${wy.items.map((x) => `<article class="pillar"><h3>${x.h}</h3><p>${x.p}</p><p class="pillar-not"><span>${wy.notL}:</span> ${x.not}</p></article>`).join('')}</div>`;

  const startList = `<div class="lp-steps"><h3>${L.start.title}</h3><ol>${L.start.steps.map((x) => `<li><p class="lp-steps-dur">${x.dur}</p><div><p class="lp-steps-h">${x.h}</p><p>${x.p}</p></div></li>`).join('')}</ol></div>`;
  const form = `<div class="split split--top"><div>${leadForm(c, { pain: id, title: L.form.title, topics: d.situations.map((x) => x.q), topicL: L.form.topicL, detailHint: L.form.detailHint })}</div><aside class="aside-stack"><p class="lede lp-form-p">${L.form.p}</p>${personCard(c)}${startList}</aside></div>`;

  const body = `${hero}
${section(journey, 'lp-journeysec', 'journey', 'journey-title')}
${section(memo, 'section--tint lp-memosec', 'memo-sec', 'memo-sec-title')}
${section(why, 'section--dark home-why lp-whysec', 'why', 'why-title')}
${section(`<div class="about-how"><h2 id="faq-title">${L.faqTitle}</h2>${faqList(d.faq)}</div>`, '', 'faq', 'faq-title')}
${section(form, 'section--tint lp-formsec', 'book', '')}
<a class="btn btn--primary lp-sticky" href="#lead" data-lp-sticky ${track('cta_lp_sticky')} hidden>${L.bookHere}</a>`;
  return { meta: d.meta, body, ld: faqLd(d.faq) };
}
// Every lp-* route renders from content.industries[id]; adding a domain = one route + one content entry per language.
for (const { key } of routes) if (key.startsWith('lp-')) { const id = key.slice(3); pages[key] = (c) => landing(c, id); }

export function render404(c, ctx) {
  const body = section(`<h1>${c.notFound.h}</h1><p class="lede">${c.notFound.p}</p>${btn(c, c.notFound.cta, href(c.lang, 'home'), 'btn--primary')}`);
  return layout({ c, key: 'home', meta: { title: c.notFound.h + ' — bee & co.', desc: c.notFound.p }, body, ctx: { ...ctx, noindex: true } });
}

export function renderPage(c, key, ctx) {
  const { meta, body, ld } = pages[key](c);
  return layout({ c, key, meta, body, ctx: { ...ctx, noindex: key === 'privacy' && ctx.draftNoindex }, ld });
}
export { routes };
