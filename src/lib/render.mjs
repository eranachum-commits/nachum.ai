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
const NAV = ['how', 'about', 'results', 'faq'];
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
    <div><h2>${f.cols.legal}</h2><ul><li><a href="${href(c.lang, 'privacy')}">${f.privacy}</a></li><li><a href="${href(c.lang, 'security')}">${f.security}</a></li></ul></div>
  </div>
  <div class="foot-base"><span>${f.rights}</span><span>${f.note}</span></div>
</div></footer>
<div class="consent" role="dialog" aria-label="Cookies" data-consent hidden><p>${c.consent.text}</p>
<div class="btn-row"><button class="btn" type="button" data-consent-yes>${c.consent.accept}</button><button class="btn" type="button" data-consent-no>${c.consent.decline}</button></div>
<p class="small consent-more"><a href="${href(c.lang, 'privacy')}">${c.consent.more}</a></p></div>`;
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
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#dce4d8">
${ctx.noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${fontPre.map((f) => `<link rel="preload" href="/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`).join('\n')}
<link rel="stylesheet" href="/assets/site.css?v=${ctx.cssHash}">
${ld ? `<script type="application/ld+json">${json(ld)}</script>` : ''}
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
const waysLine = (c, w) => `<ol class="ways">${w.items.map((x) => `<li class="way"><h3>${x.h}</h3><p>${x.p}</p><p class="way-first">${x.first}</p></li>`).join('')}</ol>`;
const ctaBand = (c, title, p, pain) => section(`<div class="cta-band"><h2>${title}</h2><p class="lede">${p}</p><div class="btn-row">${btn(c, c.ui.book, bookUrl(c, pain), 'btn--primary', 'data-track="cta_band"')}${btn(c, c.ui.seeHow, href(c.lang, 'how'), '')}</div><p class="cta-note">${c.home.hero.note}</p></div>`, 'section--dark');
const pageHero = (c, h1, lede) => `<section class="page-hero"><div class="container"><h1>${h1}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</div></section>`;

/* ---------- pages ---------- */
const pages = {};

pages.home = (c) => {
  const h = c.home, hr = h.hero, m = h.memo;
  // The one bold element: the decision memo (see memoBlock).
  const memo = memoBlock(c, m);
  const hero = `<section class="hero"><div class="container hero-grid">
<div class="hero-copy"><h1>${hr.h1}</h1><p class="lede">${hr.sub}</p>
<div class="btn-row">${btn(c, c.ui.book, bookUrl(c), 'btn--primary', 'data-track="cta_hero"')}${btn(c, hr.secondary, href(c.lang, 'how'), '')}</div>
<p class="hero-note">${hr.note}</p></div>
${memo}</div></section>`;

  const s = h.situations;
  const voices = `<ul class="voices">${s.items.map((x, i) => `<li><p class="voice-q">${x.q}</p><p class="voice-a">${x.a}</p><p class="voice-more"><a href="${href(c.lang, 'usecase')}#s-${i}">${s.more}</a></p></li>`).join('')}</ul>`;

  const w = h.ways;
  const b = h.belief;
  const belief = `<div class="belief"><figure class="belief-quote"><blockquote><p>${b.quote}</p></blockquote><figcaption>${b.by}</figcaption></figure>${ticks(b.items)}</div>`;

  const f = h.founder;
  const founder = `<div class="founder-grid">${founderPanel(c, { sizes: '(min-width: 900px) 340px, 80vw' })}<div><h2 id="founder-title">${f.title}</h2><p class="lede">${f.p}</p><p class="founder-co">${f.co}</p><div class="btn-row">${btn(c, f.link, href(c.lang, 'about'), '')}${extLink(c.founder.linkedin, c.founder.linkedinLabel, 'btn')}</div></div></div>`;

  const sf = h.safe;
  const safe = `${head(sf.title, '', 'safe-title')}<div class="grid g4 safe-grid">${sf.items.map((x) => `<article class="card"><h3>${x.h}</h3><p>${x.p}</p></article>`).join('')}</div><p class="safe-link"><a href="${href(c.lang, 'security')}">${sf.link}</a></p>`;

  const body = `${hero}
${section(`${head(s.title, '', 'voices-title')}${voices}`, 'home-voices', 'situations', 'voices-title')}
${section(`${head(w.title, w.intro, 'ways-title')}${waysLine(c, w)}<p class="ways-link"><a href="${href(c.lang, 'how')}">${w.link}</a></p>`, 'section--tint home-ways', 'ways', 'ways-title')}
${section(belief, 'section--dark home-belief', 'belief')}
${section(founder, 'home-founder', 'founder', 'founder-title')}
${section(safe, 'section--tint home-safe', 'safe', 'safe-title')}
${ctaBand(c, h.cta.title, h.cta.p)}`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'bee & co.', description: c.descriptor,
    founder: { '@type': 'Person', name: 'Eran Nachum', jobTitle: 'Founder', sameAs: [c.founder.linkedin] },
    areaServed: 'IL',
  };
  return { meta: h.meta, body, ld };
};

pages.usecase = (c) => {
  const p = c.usecase, pn = p.pains, path = p.path, ways = c.home.ways.items;
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

  // Decision path: the four engagement steps, with the leader's go/no-go between them. Durations only, never prices.
  const stages = c.offers.items.map((o, i) => `<li class="dp-stage${i === 0 ? ' dp-stage--free' : ''}"><span class="dp-n" aria-hidden="true">${i + 1}</span><div><p class="dp-name">${o.stage}</p><h3>${o.h}</h3><p class="dp-dur">${o.price ? `<span class="dp-free">${o.price}</span>` : ''}${o.unit}</p><p class="dp-get"><strong>${path.getL}</strong> ${path.get[i]}</p></div></li>${i < path.gates.length ? `<li class="dp-gate"><span class="dp-gate-mark" aria-hidden="true"></span><p><strong>${path.gateL}</strong> ${path.gates[i]}</p></li>` : ''}`).join('');

  const body = `${hero}
${section(`${head(pn.title, pn.intro, 'situations-title')}${picker}`, 'usecase-pains', 'situations', 'situations-title')}
${section(`${head(path.title, path.intro, 'path-title')}<ol class="decision-path">${stages}</ol>`, 'section--tint usecase-path', 'path', 'path-title')}
${ctaBand(c, p.cta.title, p.cta.p, 'usecase')}`;
  return { meta: p.meta, body };
};

pages.how = (c) => {
  const p = c.how, w = c.home.ways;
  const stages = `<ol class="stage-list">${p.stages.map((s, i) => `<li class="stage-row"><div class="stage-n" aria-hidden="true">${i + 1}</div><div><h3>${s.h}</h3><p class="who">${s.who}</p></div><div>${s.p.map((x) => `<p>${x}</p>`).join('')}<p class="out">${s.out}</p></div></li>`).join('')}</ol><p class="notice">${c.offers.note}</p>`;
  const body = `${pageHero(c, p.h1, p.lede)}
${section(`${head(p.waysTitle, '', 'ways-title')}${waysLine(c, w)}`, 'section--tint how-ways', 'ways', 'ways-title')}
${section(`${head(p.stagesTitle, '', 'stages-title')}${stages}`, 'how-stages', 'stages', 'stages-title')}
${section(`<div class="split split--even"><div><h2>${p.needTitle}</h2>${ticks(p.need)}</div><div class="how-book">${btn(c, p.cta, bookUrl(c), 'btn--primary')}<p class="cta-note">${c.home.hero.note}</p></div></div>`, 'section--tint')}`;
  return { meta: p.meta, body };
};

pages.about = (c) => {
  const p = c.about, w = p.why, mp = p.map;
  // A CEO's questions in order: who is he → why his experience matters to me → why him over the alternatives → how he works → book.
  const hero = `<section class="about-hero"><div class="container about-hero-in">
<div class="about-hero-copy"><h1>${p.h1}</h1><p class="lede">${p.lede}</p>
<div class="btn-row">${btn(c, p.cta, bookUrl(c), 'btn--primary', 'data-track="cta_about_hero"')}${extLink(c.founder.linkedin, c.founder.linkedinLabel, 'btn')}</div>
<div class="about-facts"><h2 class="as-h3">${p.factsTitle}</h2>${ticks(p.facts)}</div></div>
<div class="about-hero-portrait">${founderPanel(c, { eager: true })}</div></div></section>`;

  const story = `<div class="about-story"><div class="about-prose">${p.story.map((x) => `<p>${x}</p>`).join('')}</div><aside class="about-co"><h2 class="as-h3">${p.co.h}</h2><p>${p.co.p}</p></aside></div>`;

  // Signature: each line of experience → what it means for the client's project, joined by an arrow.
  const ledger = `<ol class="xp-ledger">${mp.rows.map((x, i) => `<li><span class="xp-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><p class="xp-from"><span class="sr-only">${mp.fromL}: </span>${x.from}</p><p class="xp-to"><span class="sr-only">${mp.toL}: </span>${x.to}</p></li>`).join('')}</ol>`;

  const whyBars = `<div class="why-bars"><div class="yb-head" aria-hidden="true"><span></span>${w.cols.map((x) => `<span>${x}</span>`).join('')}</div><dl class="yb-list">${w.rows.map((r) => `<div class="yb-row"><dt>${r.h}</dt>${r.cells.map((x, i) => `<dd class="yb-bar ${i === 2 ? 'yb-us' : i === 1 ? 'yb-consult' : 'yb-tool'}" data-label="${esc(w.cols[i])}"><span class="sr-only">${w.cols[i]}: </span>${x}</dd>`).join('')}</div>`).join('')}</dl></div>`;

  const body = `${hero}
${section(story, 'about-story-sec')}
${section(`${head(mp.title, mp.intro, 'xp-title')}${ledger}`, 'section--tint about-xp', 'experience', 'xp-title')}
${section(`${head(w.title, w.intro, 'why-title')}${whyBars}`, 'about-why', 'why', 'why-title')}
${section(`<div class="about-how"><h2 id="how-title">${p.princTitle}</h2>${ticks(p.princ)}</div>`, 'section--tint about-how-sec', 'how-we-work', 'how-title')}
${ctaBand(c, p.cta, p.ctaP)}`;
  const ld = { '@context': 'https://schema.org', '@type': 'Person', name: 'Eran Nachum', jobTitle: 'Founder', worksFor: { '@type': 'Organization', name: 'bee & co.' }, sameAs: [c.founder.linkedin] };
  return { meta: p.meta, body, ld };
};

pages.results = (c) => {
  const p = c.results, f = p.flow, m = p.measures, r = p.rules;
  // How do you measure (flowchart) → what exactly do you track and what it proves (measures with outcomes) → rules → book.
  let n = 0;
  const node = (x, i) => {
    const shape = x.kind === 'step' ? `<span class="mf-shape" aria-hidden="true">${++n}</span>` : `<span class="mf-shape" aria-hidden="true"></span>`;
    const decide = i === f.nodes.length - 2
      ? `<p class="mf-yes"><strong>${f.yes}</strong></p><div class="mf-branch"><p class="mf-no"><strong>${f.no}</strong></p><p class="mf-alt"><span class="mf-t">${f.noNode.t}</span><span class="mf-s">${f.noNode.s}</span></p></div>` : '';
    const loop = i === f.nodes.length - 1 ? `<p class="mf-loop"><span aria-hidden="true">↻</span> ${f.loop}</p>` : '';
    return `<li class="mf mf--${x.kind}">${shape}<p class="mf-text"><span class="mf-t">${x.t}</span><span class="mf-s">${x.s}</span></p>${decide}${loop}</li>`;
  };
  const flow = `<ol class="mflow">${f.nodes.map(node).join('')}</ol>`;
  const visuals = [
    '<span class="kv-clock"><i></i></span>',
    '<span class="kv-response"><i></i><i></i><i></i></span>',
    '<span class="kv-volume"><i></i><i></i><i></i><i></i></span>',
    '<span class="kv-quality"><i></i><i></i><i></i><i></i><i></i></span>',
    '<span class="kv-human"><i></i><i></i><i></i></span>',
    '<span class="kv-adoption"><i></i><i></i><i></i><i></i><i></i></span>',
    '<span class="kv-money"><i></i><b>×</b><i></i><b>=</b><i></i></span>',
  ];
  const board = `<ol class="kpi-board">${m.items.map((x, i) => `<li class="kpi kpi--${i + 1}"><div class="kpi-top"><span class="kpi-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${x.h}</h3></div><div class="kpi-visual" aria-hidden="true">${visuals[i]}</div><p class="kpi-outcome">${x.outcome}</p><details class="kpi-method"><summary>${m.cols[2]}</summary><div><p><span>${m.cols[2]}</span>${x.calc}</p><p><span>${m.cols[3]}</span>${x.src}</p></div></details></li>`).join('')}</ol>`;
  const rules = `<div class="rules-layout"><div><h2 id="rules-title">${r.title}</h2>${ticks(r.items)}</div><article class="rules-card rules-card--monthly"><h3>${r.monthly.h}</h3><p>${r.monthly.p}</p></article><article class="rules-card"><h3>${r.honest.h}</h3><p>${r.honest.p}</p></article></div>`;
  const body = `${pageHero(c, p.h1, p.lede)}
${section(`${head(f.title, f.intro, 'flow-title')}${flow}`, 'results-flow', 'flow', 'flow-title')}
${section(`${head(m.title, m.intro, 'measures-title')}${board}`, 'section--tint results-measures', 'measures', 'measures-title')}
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
  const body = `${pageHero(c, p.h1, '')}${section(`<div class="draft-banner"><strong>${p.draft}</strong></div><div class="prose">${p.sections.map((s) => `<h2>${s.h}</h2><p>${s.p}</p>`).join('')}</div>`)}`;
  return { meta: p.meta, body };
};


/* ---------- campaign landing pages: one template, one content entry per industry ---------- */
// Order follows a referred or clicked-through owner: is this about my world (hero + memo) → do they know my
// problems (three situations) → why him and not a vendor → how it starts → my questions → book, without leaving.
function landing(c, id) {
  const L = c.lp, d = c.industries[id], sl = L.situationsL;
  const hero = `<section class="hero hero--lp"><div class="container hero-grid">
<div class="hero-copy"><h1>${d.h1}</h1><p class="lede">${d.lede}</p>
<div class="btn-row">${btn(c, L.bookHere, '#lead', 'btn--primary', `data-track="cta_lp_hero" data-industry="${id}"`)}</div>
<p class="hero-note">${c.home.hero.note}</p>
<ul class="lp-proof">${L.proof.map((x) => `<li>${x}</li>`).join('')}</ul></div>
${memoBlock(c, d.memo)}</div></section>`;
  const sits = `<ul class="lp-sits">${d.situations.items.map((x) => `<li><p class="voice-q">${x.q}</p><h3>${sl.under}</h3><p>${x.under}</p><h3>${sl.do}</h3><p class="lp-do">${x.do}</p><p class="lp-measure"><span>${sl.measure}</span>${x.measure}</p></li>`).join('')}</ul>`;
  const why = `<div class="founder-grid">${founderPanel(c, { sizes: '(min-width: 900px) 340px, 80vw' })}<div><h2 id="why-title">${L.why.title}</h2><div class="lp-why">${L.why.items.map((x) => `<article><h3>${x.h}</h3><p>${x.p}</p></article>`).join('')}</div><p class="ways-link"><a href="${href(c.lang, 'about')}">${c.home.founder.link}</a></p></div></div>`;
  const start = `${head(L.start.title, L.start.intro, 'start-title')}<ol class="ways lp-start">${L.start.steps.map((x) => `<li class="way"><h3>${x.h}</h3><p>${x.p}</p></li>`).join('')}</ol>`;
  const form = `<div class="split split--top"><div>${leadForm(c, { pain: id, title: L.form.title, topics: d.situations.items.map((x) => x.q), topicL: L.form.topicL, detailHint: L.form.detailHint })}</div><aside class="aside-stack"><p class="lede lp-form-p">${L.form.p}</p>${personCard(c)}<div class="card"><h3>${c.contact.next.h}</h3><ol class="steps">${c.contact.next.steps.map((x) => `<li>${x}</li>`).join('')}</ol></div></aside></div>`;
  const body = `${hero}
${section(`${head(d.situations.title, '', 'sits-title')}${sits}`, 'lp-situations', 'situations', 'sits-title')}
${section(`${why}<div class="lp-mid"><p>${L.midCta}</p>${btn(c, L.bookHere, '#lead', 'btn--primary', `data-track="cta_lp_mid" data-industry="${id}"`)}</div>`, 'section--tint lp-whysec', 'why', 'why-title')}
${section(start, 'lp-startsec', 'start', 'start-title')}
${section(`<div class="about-how"><h2 id="faq-title">${L.faqTitle}</h2>${faqList(d.faq)}</div>`, 'section--tint', 'faq', 'faq-title')}
${section(form, 'lp-formsec', 'book', '')}`;
  return { meta: d.meta, body, ld: faqLd(d.faq) };
}
for (const id of ['distribution', 'manufacturing', 'ecommerce']) pages['lp-' + id] = (c) => landing(c, id);

export function render404(c, ctx) {
  const body = section(`<h1>${c.notFound.h}</h1><p class="lede">${c.notFound.p}</p>${btn(c, c.notFound.cta, href(c.lang, 'home'), 'btn--primary')}`);
  return layout({ c, key: 'home', meta: { title: c.notFound.h + ' — bee & co.', desc: c.notFound.p }, body, ctx: { ...ctx, noindex: true } });
}

export function renderPage(c, key, ctx) {
  const { meta, body, ld } = pages[key](c);
  return layout({ c, key, meta, body, ctx: { ...ctx, noindex: key === 'privacy' && ctx.draftNoindex }, ld });
}
export { routes };
