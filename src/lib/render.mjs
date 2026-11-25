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
// Header: how working together goes, who leads it, then the use cases. The footer lists every page, including results and FAQ.
const NAV = ['how', 'about', 'usecase'];
const FOOT_NAV = [...NAV, 'results', 'faq'];
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
    <div><h2>${f.cols.site}</h2><ul>${FOOT_NAV.map((k) => `<li><a href="${href(c.lang, k)}">${c.nav[k]}</a></li>`).join('')}<li><a href="${href(c.lang, 'contact')}">${f.contact}</a></li><li>${extLink(c.founder.linkedin, c.founder.linkedinLabel)}</li></ul></div>
    <div><h2>${f.cols.industries}</h2><ul>${routes.filter((r) => r.key.startsWith('lp-')).map((r) => `<li><a href="${href(c.lang, r.key)}">${f.industries[r.key.slice(3)]}</a></li>`).join('')}</ul></div>
    <div><h2>${f.cols.legal}</h2><ul><li><a href="${href(c.lang, 'privacy')}">${f.privacy}</a></li><li><a href="${href(c.lang, 'security')}">${f.security}</a></li></ul></div>
  </div>
  <div class="foot-base"><span>${f.rights}</span><span>${f.note}</span></div>
</div></footer>
<div class="consent" role="dialog" aria-label="Cookies" data-consent hidden><p>${c.consent.short} <a href="${href(c.lang, 'privacy')}">${c.consent.more}</a></p>
<div class="btn-row"><button class="btn" type="button" data-consent-yes>${c.consent.accept}</button><button class="btn" type="button" data-consent-no>${c.consent.decline}</button></div></div>`;
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
${ctx.vercelAnalytics ? '<script defer src="/_vercel/insights/script.js"></script>' : ''}
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
 data-ok-h="${esc(O.h)}" data-ok-p="${esc(O.p)}" data-dev-h="${esc(O.devH)}" data-dev="${esc(O.dev)}">
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

// Landing pages: a short form for cold ad traffic. Name and phone are required; business name and email are optional.
// The industry travels as `pain` and the ad as `source` (UTM tags), so no situation or message is asked for.
function shortForm(c, { id = 'lead', pain = '', companyL = '' } = {}) {
  const F = c.form, S = c.lp.form, E = F.errors;
  const req = `<span aria-hidden="true"> *</span><span class="sr-only"> (${E.required})</span>`;
  const input = (n, label, { type = 'text', required = false, auto = '', mode = '' } = {}) => `<div class="field"><label for="${id}-${n}">${label}${required ? req : ''}</label><input id="${id}-${n}" name="${n}" type="${type}" ${required ? 'required' : ''} ${auto ? `autocomplete="${auto}"` : ''} ${mode ? `inputmode="${mode}" dir="ltr"` : ''} aria-describedby="${id}-${n}-e"><span class="err" id="${id}-${n}-e" role="alert"></span></div>`;
  return `<form class="form-card form-card--short" data-lead-form id="${id}" novalidate method="post" action="/api/leads" data-lang="${c.lang}"
 data-m-required="${esc(E.required)}" data-m-email="${esc(E.email)}" data-m-phone="${esc(S.phoneErr)}" data-m-consent="${esc(E.consent)}" data-m-fix="${esc(c.ui.fixField)}" data-m-sending="${esc(c.ui.sending)}" data-m-fail="${esc(F.fail)}" data-m-net="${esc(F.failNet)}"
 data-ok-h="${esc(F.ok.h)}" data-ok-p="${esc(S.ok)}" data-dev-h="${esc(F.ok.devH)}" data-dev="${esc(F.ok.dev)}">
<h2 class="as-h3">${S.title}</h2>
<div class="form-grid">
${input('name', S.name, { required: true, auto: 'name' })}
${input('phone', S.phone, { type: 'tel', required: true, auto: 'tel', mode: 'tel' })}
${input('company', companyL || S.company, { auto: 'organization' })}
${input('email', S.email, { type: 'email', auto: 'email' })}
</div>
<div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
<input type="hidden" name="form" value="short"><input type="hidden" name="pain" value="${pain}"><input type="hidden" name="lang" value="${c.lang}"><input type="hidden" name="source" value=""><input type="hidden" name="ts" value="">
<div class="field"><div class="checkrow"><input id="${id}-consent" name="consent" type="checkbox" required aria-describedby="${id}-consent-e"><label for="${id}-consent">${S.consent.replace(/ראו מדיניות פרטיות|See the privacy policy/, (m) => `<a href="${href(c.lang, 'privacy')}">${m}</a>`)}</label></div><span class="err" id="${id}-consent-e" role="alert"></span></div>
<div class="form-status" role="status" aria-live="polite" tabindex="-1"></div>
<button class="btn btn--primary" type="submit" data-submit>${S.submit}</button>
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
const waysLine = (c, w) => `<ol class="ways">${w.items.map((x) => `<li class="way"><h3>${x.h}</h3><p>${x.p}</p><p class="way-get"><span>${w.getL}</span>${x.get}</p><p class="way-first">${x.first}</p></li>`).join('')}</ol>`;
const ctaBand = (c, title, p, pain, { how = true, label = c.ui.book } = {}) => section(`<div class="cta-band"><h2>${title}</h2><p class="lede">${p}</p><div class="btn-row">${btn(c, label, bookUrl(c, pain), 'btn--primary', 'data-track="cta_band"')}${how ? btn(c, c.ui.seeHow, href(c.lang, 'how'), '') : ''}</div><p class="cta-note">${c.home.hero.note}</p></div>`, 'section--dark');
const pageHero = (c, h1, lede) => `<section class="page-hero"><div class="container"><h1>${h1}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</div></section>`;

/* ---------- the journey and stage coverage (home services, how it works) ---------- */
// Five stages in reading direction (mirrored in Hebrew), each with what you get and the decision that stays yours.
const journeyMap = (c) => { const j = c.how.journey;
  return `<div class="journey"><ol class="jr-stages">${j.stages.map((x, i) => `<li class="jr-stage"><span class="jr-n" aria-hidden="true">${i + 1}</span><h3>${x.h}</h3><p class="jr-p">${x.p}</p><p class="jr-get"><span>${j.getL}</span>${x.get}</p>${x.gate ? `<p class="jr-gate"><span>${j.gateL}</span>${x.gate}</p>` : ''}</li>`).join('')}</ol><p class="jr-note">${j.note}</p></div>`; };
// Which of the five stages something covers: hexes for the eye, the stage names as text.
const stageCover = (c, st, label) => { const S = c.how.journey.stages;
  return `<p class="svc-cover"><span class="svc-hexes" aria-hidden="true">${S.map((x, i) => `<i${st.includes(i) ? ' class="on"' : ''}></i>`).join('')}</span><span class="svc-cover-t"><span class="svc-cover-l">${label}:</span> ${st.map((i) => S[i].h).join(', ')}</span></p>`; };


/* ---------- home workflow: one plain line, work comes in → AI does the repeated part → your team handles exceptions → result ---------- */
// An ordered list, so it reads in order without CSS. The AI step is the one highlighted mark; the line runs along the reading direction.
// Step icons, named by meaning. A step's `i` picks its icon (matching what the step says); otherwise its kind's default.
const FL_ICON = {
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="6" width="17" height="12" rx="2.2"/><path d="M3.8 8l8.2 6 8.2-6"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 13.5L6.6 6h10.8l2.6 7.5V19H4z"/><path d="M4 13.5h4.6l1.2 2.2h4.4l1.2-2.2H20"/></svg>',
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 6.5A2.5 2.5 0 0 1 7 4h10a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 17 16h-6l-4.5 4v-4H7a2.5 2.5 0 0 1-2.5-2.5z"/><path d="M10.1 8.4a1.9 1.9 0 1 1 2.6 1.8c-.5.2-.7.6-.7 1.1v.3"/><path d="M12 13.6h.01"/></svg>',
  receipt: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/></svg>',
  drawing: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 19.5v-15l15 15z"/><path d="M8.5 15.5v-3.2l3.2 3.2z"/><path d="M4.5 8h2M4.5 11.5h2"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M16.5 3.5l3 3-3 3"/><path d="M19.5 6.5H9a5 5 0 0 0-5 5"/><path d="M7.5 20.5l-3-3 3-3"/><path d="M4.5 17.5H15a5 5 0 0 0 5-5"/></svg>',
  docCheck: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.5 3.5h7.5l4 4v13h-11.5z"/><path d="M14 3.5v4h4"/><path d="M9.3 14.2l2 2 3.6-4"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/></svg>',
  draft: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14.5 5.5l4 4L9 19H5v-4z"/><path d="M12.5 7.5l4 4"/><path d="M13 19h6"/></svg>',
  personAlert: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="9.5" cy="8.5" r="3.4"/><path d="M3.5 19.5c.7-3.4 3.2-5.3 6-5.3s5.3 1.9 6 5.3"/><path d="M19 6.5v5"/><path d="M19 14.6h.01"/></svg>',
  flag: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.5 21V3.8"/><path d="M6.5 4.5h11l-2.6 4 2.6 4h-11"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.5 3.5L10 14"/><path d="M20.5 3.5l-6.7 17-3.8-6.5-6.5-3.8z"/></svg>',
  alert: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4l9 16H3z"/><path d="M12 10v4.2"/><path d="M12 17.2h.01"/></svg>',
  approve: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5"/><path d="M8.4 12.2l2.5 2.5 4.8-5.2"/></svg>',
  trend: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 17l5.5-5.5 3.5 3.5L20 8"/><path d="M14.5 8H20v5.5"/></svg>',
};
const FL_DEFAULT = { in: 'mail', ai: 'repeat', team: 'personAlert', result: 'trend' };
// Six spots around the AI mark (percent of the stage), clockwise from the top. The flow line runs through the centre, so no agent sits on it.
const STAR = [[50, 9], [82, 27], [82, 73], [50, 91], [18, 73], [18, 27]];
// One workflow line: an ordered list of steps (in, ai, team, result). Used on home and, without the agent star, on the use case page.
const wfList = (steps, star, cls = '', hl = 'h3') => `<ol class="wf${cls ? ' ' + cls : ''}">${steps.map((s) => `<li class="wf-step wf-step--${s.k}"><div class="wf-stage">${s.agents && star ? star(s) : ''}<span class="wf-mark">${FL_ICON[s.i || FL_DEFAULT[s.k]]}</span></div><div class="wf-t"><${hl}>${s.h}</${hl}>${s.p ? `<p>${s.p}</p>` : ''}${s.list ? `<ul class="wf-out">${s.list.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}</div></li>`).join('')}</ol>`;
// The example AI agents around the AI step, as on home; label names the list for screen readers.
const agentStar = (label) => (s) => `<svg class="wf-spokes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">${s.agents.map((_, i) => `<line x1="50" y1="50" x2="${STAR[i][0]}" y2="${STAR[i][1]}" vector-effect="non-scaling-stroke"/>`).join('')}</svg>
<ul class="wf-agents" aria-label="${esc(label)}">${s.agents.map((x, i) => `<li style="--x:${STAR[i][0]}%;--y:${STAR[i][1]}%;--i:${i}"><span>${x}</span></li>`).join('')}</ul>`;
// The use case page's "In numbers" panel: four illustrative figures.
const exCalc = (c, numbers) => `<div class="ex-calc"><h3>${c.usecase.numbersL}</h3><ul>${numbers.map((y) => `<li><span class="ex-n">${y.n}</span><span class="ex-l">${y.l}</span></li>`).join('')}</ul></div>`;
const flowLine = (c) => {
  const f = c.home.flow, star = agentStar(f.agentsL);
  return `${head(f.title, f.intro, 'flow-title')}${wfList(f.steps, star)}
<div class="wf-foot">${btn(c, f.cta, href(c.lang, 'contact'), 'btn--primary', 'data-track="cta_flow"')}</div>`;
};

/* ---------- "& co." note: founder-led, specialists as each project needs. Same text on home and about (about.co) ---------- */
const coNote = (c) => `<div class="co-note"><p class="co-mark" aria-hidden="true" dir="ltr">&amp; co.</p><div><h3>${c.about.co.h}</h3><p>${c.about.co.p}</p></div></div>`;

/* ---------- pages ---------- */
const pages = {};

pages.home = (c) => {
  const h = c.home, hr = h.hero, wy = h.why, wk = h.ways, ms = h.measure;
  // Five-second test: what we do (h1), why it matters (lede), why trust us (trust line), what next (two actions).
  // Directly below, one plain workflow carries the main message: work comes in, AI agents do the repeated part, people handle exceptions.
  const hero = `<section class="hero hero--home"><div class="container hero-grid">
<div class="hero-copy"><p class="hero-line">${hr.line}</p><h1>${hr.h1}</h1><p class="hero-support">${hr.support}</p></div>
<div class="hero-body"><p class="lede">${hr.sub}</p>
<div class="btn-row">${btn(c, hr.primary, bookUrl(c), 'btn--primary', 'data-track="cta_hero"')}<a class="hero-link" href="${href(c.lang, 'usecase')}">${hr.secondary}</a></div>
<p class="hero-trust">${hr.trust}</p></div></div></section>`;

  // After the hero: is this my business (tree) → what we do (three ways) → who I work with (why, and who does what) → talk.
  // The five-problems list and the four kinds of value were cut for length: the tree already shows the problems by field,
  // and the measurement line now sits in the closing band (the full version is on the results page).
  const services = `${head(wk.title, wk.intro, 'services-title')}${waysLine(c, wk)}<p class="ways-link"><a href="${href(c.lang, 'how')}">${wk.link}</a></p>`;

  const why = `${head(wy.title, wy.intro, 'why-title')}<div class="pillars pillars--lite">${wy.items.map((x) => `<article class="pillar"><h3>${x.h}</h3><p>${x.p}</p></article>`).join('')}</div>
${coNote(c)}<p class="ways-link"><a href="${href(c.lang, 'security')}">${wy.trustLink}</a></p>`;

  const cta = section(`<div class="cta-band"><h2 id="cta-title">${h.cta.title}</h2><p class="lede">${h.cta.p}</p><div class="btn-row">${btn(c, h.cta.button, bookUrl(c), 'btn--primary', 'data-track="cta_band"')}${btn(c, c.ui.seeHow, href(c.lang, 'how'), '')}</div><p class="cta-note">${hr.note}</p><p class="cta-note cta-measure">${ms.note} <a href="${href(c.lang, 'results')}">${ms.link}</a></p></div>`, 'section--dark', 'talk', 'cta-title');

  const body = `${hero}
${section(flowLine(c), 'section--dark home-flow', 'flow', 'flow-title')}
${section(services, 'home-services', 'services', 'services-title')}
${section(why, 'home-why home-who', 'why', 'why-title')}
${cta}`;
  const ld = {
    '@type': 'ProfessionalService', '@id': '#org',
    hasOfferCatalog: { '@type': 'OfferCatalog', name: wk.title, itemListElement: wk.items.map((x) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: x.h, description: x.p } })) },
  };
  return { meta: h.meta, body, ld };
};

pages.usecase = (c) => {
  const ex = c.usecase;
  // Four illustrative processes: one headline, one "today" line, the home page's workflow line and the same four numbers each.
  // One shared note under all four says these are illustrations and that released hours are capacity, not savings.
  const calc = (x) => exCalc(c, x.numbers);
  const one = (x, i) => `<article class="exw" id="ex-${i + 1}"><header class="exw-head"><p class="exw-tag">${x.tag}<span class="ex-chip">${c.ui.illustrative}</span></p><h2>${x.h}</h2><p class="exw-today"><span>${ex.todayL}</span> ${x.today}</p></header>
${wfList([...x.steps, { k: 'result', h: ex.resultH, list: x.result }], null, 'wf--plain', 'h4')}${calc(x)}<p class="exw-measure"><span>${ex.measureL}</span> ${x.measure}</p></article>`;
  const body = `${pageHero(c, ex.title, ex.intro)}
${section(`<div class="exws">${ex.items.map(one).join('')}</div><p class="ex-note">${ex.note}</p>`, 'section--dark home-examples', 'examples', '')}
${ctaBand(c, ex.cta.title, ex.cta.p, 'usecase', { how: false })}`;
  return { meta: ex.meta, body };
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
  const co = coNote(c);

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
// is this my business (question headline, software strip) → what changes here (one workflow from this business, with illustrative numbers)
// → how it would run (the five stages traced through this domain) → why bee & co. (as on home) → talk (short form) → my questions.
// On phones a sticky action follows from the hero to the form.
function landing(c, id) {
  const L = c.lp, d = c.industries[id], J = c.how.journey, track = (k) => `data-track="${k}" data-industry="${id}"`;
  // The software strip answers the first question a firm asks ("does it work with what we run?") next to the action.
  const sys = d.systems ? `<p class="lp-systems"><span class="lp-systems-l">${d.systems.l}:</span> ${d.systems.items.map((x) => `<bdi>${x}</bdi>`).join(' · ')}<span class="lp-systems-n">${d.systems.note}</span></p>` : '';
  // The action comes first so it stays above the cookie banner on a phone's first screen.
  const actions = `<div class="btn-row">${btn(c, d.cta || L.primary, '#lead', 'btn--primary', track('cta_lp_hero'))}${btn(c, L.secondary, '#journey', '', track('cta_lp_how'))}</div>
<p class="lp-callnote">${L.callNote}</p>${sys}
<p class="hero-trust">${c.home.hero.trust}</p>`;
  // Opens like home: the question beside the lede, then one workflow from this business in a dark band.
  const hero = `<section class="hero hero--home hero--lp"><div class="container hero-grid">
<div class="hero-copy"><p class="lp-kicker">${d.kicker}</p><h1>${d.h1}</h1></div>
<div class="hero-body"><p class="lede">${d.lede}</p>${actions}</div></div></section>`;
  // The domain workflow: the home page's line (with its agent star) and the use case page's today line and numbers.
  const f = d.flow, ex = c.usecase;
  const flow = `${head(f.title, f.intro, 'flow-title')}<p class="exw-today lp-flow-today"><span>${ex.todayL}</span> ${f.today}</p>
${wfList([...f.steps, { k: 'result', h: ex.resultH, list: f.result }], agentStar(f.agentsL))}
<div class="lp-flow-calc">${exCalc(c, f.numbers).replace('</h3>', ` <span class="ex-chip">${c.ui.illustrative}</span></h3>`)}<p class="exw-measure"><span>${ex.measureL}</span> ${f.measure}</p><p class="ex-note">${f.note}</p></div>
<div class="wf-foot">${btn(c, f.cta, '#lead', 'btn--primary', track('cta_lp_flow'))}</div>`;

  // The signature: the same five stages as the home page and How it works, each carried through this domain.
  // Stage names and your decision stay shared; the sentence in between is this business.
  const journey = `${head(L.journey.title, L.journey.intro, 'journey-title')}<div class="journey lp-journey"><p class="lp-here-l">${d.here}</p><ol class="jr-stages">${J.stages.map((s, i) => `<li class="jr-stage"><span class="jr-n" aria-hidden="true">${i + 1}</span><h3>${s.h}</h3><p class="lp-here">${d.journey[i]}</p>${s.gate ? `<p class="jr-gate"><span>${J.gateL}</span>${s.gate}</p>` : ''}</li>`).join('')}</ol></div>`;


  // Why bee & co. as on home: the three pillars (lite), the "& co." note and the security link. The intro says
  // "vendors", not "firms": on a law firm's page "many firms promise AI" reads as other law firms.
  const wy = c.home.why;
  const why = `${head(wy.title, L.whyIntro, 'why-title')}<div class="pillars pillars--lite">${wy.items.map((x) => `<article class="pillar"><h3>${x.h}</h3><p>${x.p}</p></article>`).join('')}</div>
${coNote(c)}<p class="ways-link"><a href="${href(c.lang, 'security')}">${wy.trustLink}</a></p>`;

  // The contact page's layout: heading and lede, Eran's card above the form, "what happens next" and "useful to mention" beside it.
  // The form keeps this domain's situations as topic chips, so a lead arrives tagged with the domain and the situation.
  const ct = c.contact;
  const nx = L.form.next;
  const form = `${head(ct.h1, L.form.lede, 'book-title')}<div class="split split--top"><div>${personCard(c)}${shortForm(c, { pain: id, companyL: d.companyL })}</div><aside class="aside-stack"><div class="card"><h3>${nx.h}</h3><ol class="steps">${nx.steps.map((x) => `<li>${x}</li>`).join('')}</ol></div></aside></div>`;

  const body = `${hero}
${section(flow, 'section--dark home-flow lp-flowsec', 'flow', 'flow-title')}
${section(journey, 'section--tint lp-journeysec', 'journey', 'journey-title')}
${section(why, 'home-why home-who lp-whysec', 'why', 'why-title')}
${section(form, 'section--tint lp-formsec', 'book', 'book-title')}
${section(`<div class="about-how"><h2 id="faq-title">${L.faqTitle}</h2>${faqList(d.faq)}</div>`, '', 'faq', 'faq-title')}
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
