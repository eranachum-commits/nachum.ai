import { href, routes } from './routes.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const arrow = ''; // buttons say what they do; no decorative arrows

/* ---------- primitives ---------- */
export const btn = (c, label, url, cls = 'btn--primary', attrs = '') => `<a class="btn ${cls}" href="${url}" ${attrs}>${label}${arrow}</a>`;
const bookUrl = (c, pain) => href(c.lang, 'contact') + (pain ? `?pain=${pain}` : '');
const ill = (c) => `<span class="chip chip--ill">${esc(c.ui.illustrative)}</span>`;
const head = (_eyebrow, title, intro, id) => `<div class="section-head"><h2${id ? ` id="${id}"` : ''}>${title}</h2>${intro ? `<p class="lede">${intro}</p>` : ''}</div>`;
const ticks = (arr) => `<ul class="ticks">${arr.map((x) => `<li>${x}</li>`).join('')}</ul>`;
const section = (inner, cls = '', id = '', labelledby = '') => `<section class="section ${cls}"${id ? ` id="${id}"` : ''}${labelledby ? ` aria-labelledby="${labelledby}"` : ''}><div class="container">${inner}</div></section>`;
// Prices and numbers inside RTL copy must not be reordered by the bidi algorithm.
const bdi = (s) => `<bdi>${s}</bdi>`;
const brandDescriptor = (c) => c.lang === 'he' ? 'AI יישומי · טרנספורמציה עסקית' : 'Applied AI · Business Transformation';
const founderLine = (c) => c.lang === 'he' ? 'נוסד על ידי ערן' : 'Founded by Eran';
const brandMark = () => `<svg class="brand-mark" viewBox="0 0 100 100" aria-hidden="true"><path class="mark-b" d="M28 13v62c0 8 6 14 14 14h20c15 0 27-12 27-27 0-14-11-25-25-26H44"/><path class="mark-cell" d="M45 36l13-8 13 8v16l-13 8-13-8z"/></svg>`;
const brandLockup = (c, full = false) => `<span class="brand-lockup">${brandMark()}<span class="logo-type"><span class="logo-name">bee &amp; co.</span><span class="logo-studio"><span>AI SOLUTIONS &amp;</span><span>TRANSFORMATION</span></span>${full ? `<span class="logo-descriptor"><i>${founderLine(c)}</i></span>` : ''}</span></span>`;
const founderPanel = (c) => `<div class="portrait" role="img" aria-label="Eran"><span class="portrait-mark">E</span><span class="portrait-role">${c.lang === 'he' ? 'מייסד · bee & co.' : 'Founder · bee & co.'}</span><span class="portrait-exp">${c.lang === 'he' ? 'יותר מ־20 שנות הנהגה טכנולוגית' : '20+ years of technology leadership'}</span></div>`;
const brandSignal = (c) => {
  const outcome = c.lang === 'he' ? 'תוצאה אחת<br>שהוכחה' : 'one proven<br>outcome';
  return `<div class="brand-signal" aria-hidden="true"><span></span><span></span><span></span><span>${outcome}</span></div>`;
};
const transformationFlow = (c) => {
  const rtl = c.dir === 'rtl';
  const steps = c.home.method.steps;
  const xs = rtl ? [1010, 810, 610, 410] : [20, 220, 420, 620];
  const gateX = rtl ? 250 : 940;
  const deployX = rtl ? 165 : 855;
  const scaleX = rtl ? 0 : 1030;
  const meta = rtl ? ['ראיות', 'ערך', 'תכנון', 'בדיקה', 'אימוץ', 'מדידה'] : ['Evidence', 'Value', 'Blueprint', 'Test', 'Adoption', 'Measure'];
  const gate = rtl ? 'הערך הוכח?' : 'Value proven?';
  const yes = rtl ? 'כן — ממשיכים' : 'Yes — continue';
  const refine = rtl ? 'לא — משפרים את התכנון' : 'No — refine the design';
  const title = rtl ? 'מפת התהליך: מגילוי ועד הרחבה' : 'Transformation flow: from discovery to scale';
  const swipe = rtl ? 'החליקו שמאלה כדי לעקוב אחר התהליך' : 'Swipe to follow the full process';
  const swipeArrow = rtl ? '←' : '→';
  const node = (i, x, y) => { const tx = rtl ? x + 142 : x + 18; const anchor = rtl ? 'end' : 'start'; return `<g class="mf-node"><rect x="${x}" y="${y}" width="160" height="88" rx="8"/><text x="${tx}" y="${y + 29}" text-anchor="${anchor}" class="mf-n">0${i + 1} · ${meta[i]}</text><text x="${tx}" y="${y + 58}" text-anchor="${anchor}" class="mf-title">${esc(steps[i].h)}</text></g>`; };
  const topEdges = xs.slice(0, 3).map((x, i) => rtl
    ? `<path d="M${x} 94H${xs[i + 1] + 170}"/>`
    : `<path d="M${x + 160} 94H${xs[i + 1] - 10}"/>`).join('');
  const proveToGate = rtl ? `M${xs[3]} 94H${gateX + 82}` : `M${xs[3] + 160} 94H${gateX - 82}`;
  const deployToScale = rtl ? `M${deployX} 302H${scaleX + 160}` : `M${deployX + 160} 302H${scaleX}`;
  const loop = rtl
    ? `M${gateX} 146V205H${xs[2] + 80}V148`
    : `M${gateX} 146V205H${xs[2] + 80}V148`;
  return `<figure class="method-flow"><div class="method-flow-scroll"><svg viewBox="0 0 1200 380" role="img" aria-labelledby="method-flow-title"><title id="method-flow-title">${title}</title><defs><marker id="mf-arrow-${c.lang}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z"/></marker></defs><g class="mf-edges" marker-end="url(#mf-arrow-${c.lang})">${topEdges}<path d="${proveToGate}"/><path d="M${gateX} 146V248"/><path d="${deployToScale}"/></g><path class="mf-loop" d="${loop}" marker-end="url(#mf-arrow-${c.lang})"/>${xs.map((x, i) => node(i, x, 50)).join('')}<g class="mf-gate"><path d="M${gateX} 42  ${gateX + 82} 94  ${gateX} 146  ${gateX - 82} 94Z"/><text x="${gateX}" y="91">${gate}</text><text x="${gateX}" y="108" class="mf-small">${yes}</text></g>${node(4, deployX, 258)}${node(5, scaleX, 258)}<text x="${xs[2] + 80}" y="225" text-anchor="middle" class="mf-refine">${refine}</text></svg></div><figcaption class="flow-swipe">${swipe} ${swipeArrow}</figcaption></figure>`;
};

/* ---------- layout ---------- */
function header(c, key) {
  const link = (k, label) => `<a href="${href(c.lang, k)}"${key === k ? ' aria-current="page"' : ''}>${label}</a>`;
  const other = c.lang === 'he' ? 'en' : 'he';
  return `<header class="site-header"><div class="container header-in">
  <a class="logo" href="${href(c.lang, 'home')}" aria-label="bee &amp; co. — ${esc(c.ui.home)}">${brandLockup(c)}</a>
  <nav class="nav" aria-label="${esc(c.ui.main)}">
    ${link('how', c.nav.how)}
    ${link('usecase', c.nav.usecase)}
    ${link('about', c.nav.about)}${link('results', c.nav.results)}${link('faq', c.nav.faq)}
    <a class="lang-switch" href="__ALT__" hreflang="${other}" lang="${other}" aria-label="${esc(c.switchAria)}">${c.switchLabel}</a>
  </nav>
  <a class="btn btn--primary btn--sm" href="${bookUrl(c)}" data-track="cta_header">${c.ui.book}</a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav" data-menu>${c.ui.menu}</button>
</div>
<nav class="mobile-nav" id="mobile-nav" aria-label="${esc(c.ui.main)}"><div class="container">
  <a href="${href(c.lang, 'how')}">${c.nav.how}</a>
  <a href="${href(c.lang, 'usecase')}">${c.nav.usecase}</a>
  <a href="${href(c.lang, 'about')}">${c.nav.about}</a><a href="${href(c.lang, 'results')}">${c.nav.results}</a><a href="${href(c.lang, 'faq')}">${c.nav.faq}</a>
  <a href="__ALT__" hreflang="${other}" lang="${other}">${c.switchLabel}</a>
  <a class="btn btn--primary" href="${bookUrl(c)}">${c.ui.book}</a>
</div></nav></header>`;
}

function footer(c) {
  const f = c.footer;
  return `<footer class="site-footer"><div class="container">
  <div class="foot-grid">
    <div><a class="logo logo--footer" href="${href(c.lang, 'home')}">${brandLockup(c, true)}</a><p>${f.tag}</p></div>
    <div><h2>${f.cols.site}</h2><ul><li><a href="${href(c.lang, 'how')}">${c.nav.how}</a></li><li><a href="${href(c.lang, 'about')}">${c.nav.about}</a></li><li><a href="${href(c.lang, 'results')}">${c.nav.results}</a></li><li><a href="${href(c.lang, 'faq')}">${c.nav.faq}</a></li><li><a href="${href(c.lang, 'contact')}">${f.contact}</a></li></ul></div>
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

// In RTL text, ranges like "18–28" or "4,120" can be reordered by the bidi algorithm.
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
    return tok.replace(/\d[\d,.]*(?:[–-]\d[\d,.]*)?/g, '<bdi dir="ltr">$&</bdi>');
  }).join('');
}

/* ---------- illustrative visuals ---------- */

/* ---------- interactive tools ---------- */

function pipeline(c, id) {
  const p = c.pipeline;
  const iconFor = {
    req: ['request', 'request'], inbox: ['inbox', 'inbox'], sort: ['sort', 'spark'], look: ['search', 'price'],
    draft: ['edit', 'spark'], erp: ['keyboard', 'sync'], appr: ['approve', 'approve'], reply: ['send', 'send'],
  };
  const icons = `<symbol id="${id}-i-request" viewBox="0 0 24 24"><path d="M7 3.5h7l3 3V20.5H7zM14 3.5v4h4M9.5 12h5M9.5 15.5h5"/></symbol>
<symbol id="${id}-i-inbox" viewBox="0 0 24 24"><path d="M5 5.5h14l2 9v4H3v-4zM3.5 14.5h5l1.5 2h4l1.5-2h5"/></symbol>
<symbol id="${id}-i-sort" viewBox="0 0 24 24"><path d="M6 6h12M8.5 11h7M11 16h2M4 19l2 2 2-2M6 21V4"/></symbol>
<symbol id="${id}-i-spark" viewBox="0 0 24 24"><path d="M12 2.8l1.3 5.1 4.2 2.8-4.2 2.7L12 18.6l-1.3-5.2-4.2-2.7 4.2-2.8zM18.5 16l.7 2.1 1.8.9-1.8 1-.7 2-.7-2-1.8-1 1.8-.9z"/></symbol>
<symbol id="${id}-i-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="5.5"/><path d="M14.5 14.5L20 20M8 9h5M8 12h3"/></symbol>
<symbol id="${id}-i-price" viewBox="0 0 24 24"><path d="M4 5h9l7 7-8 8-8-8z"/><circle cx="8" cy="9" r="1"/></symbol>
<symbol id="${id}-i-edit" viewBox="0 0 24 24"><path d="M5 19l1-4L16.5 4.5a2 2 0 012.8 2.8L8.8 17.8zM14.5 6.5l3 3M5 20h14"/></symbol>
<symbol id="${id}-i-keyboard" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M6 10h1M10 10h1M14 10h1M18 10h1M6 14h8M17 14h1"/></symbol>
<symbol id="${id}-i-sync" viewBox="0 0 24 24"><path d="M19 8a7 7 0 00-12-2L5 8M5 8V4M5 8h4M5 16a7 7 0 0012 2l2-2M19 16v4M19 16h-4"/></symbol>
<symbol id="${id}-i-approve" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0111 0M15.5 13.5l2 2 3.5-4"/></symbol>
<symbol id="${id}-i-send" viewBox="0 0 24 24"><path d="M3 11.5L21 4l-7.5 18-2.2-7.8zM11.3 14.2L21 4"/></symbol>`;
  const pos = {
    req: { before: [25, 30], after: [25, 120] }, inbox: { before: [185, 30], after: [185, 120] },
    sort: { before: [345, 30], after: [345, 120] }, look: { before: [505, 30], after: [185, 240] },
    draft: { before: [505, 170], after: [345, 120] }, erp: { before: [345, 170], after: [345, 240] },
    appr: { before: [185, 170], after: [505, 120] }, reply: { before: [25, 170], after: [505, 240] },
  };
  const mx = (x) => c.dir === 'rtl' ? 680 - x : x;
  const nodePos = ([x, y]) => [c.dir === 'rtl' ? 680 - x - 140 : x, y];
  const line = ([x1, y1, x2, y2], cls = '') => `<line${cls ? ` class="${cls}"` : ''} x1="${mx(x1)}" y1="${y1}" x2="${mx(x2)}" y2="${y2}" marker-end="url(#${id}-arrow)"/>`;
  const beforeLines = [[165, 58, 183, 58], [325, 58, 343, 58], [485, 58, 503, 58], [575, 86, 575, 168], [505, 198, 487, 198], [345, 198, 327, 198], [185, 198, 167, 198]].map((x) => line(x)).join('');
  const afterLines = [[165, 148, 183, 148], [325, 148, 343, 148], [485, 148, 503, 148], [575, 176, 575, 238]].map((x) => line(x)).join('');
  const nodes = p.nodes.map((n) => {
    const before = nodePos(pos[n.id].before), after = nodePos(pos[n.id].after);
    const [beforeIcon, afterIcon] = iconFor[n.id];
    const iconX = c.dir === 'rtl' ? 108 : 8;
    return `<g class="pl-node pl--${n.before.kind}" data-node="${n.id}" data-before="${before.join(',')}" data-after="${after.join(',')}" data-before-t="${esc(n.before.t)}" data-before-s="${esc(n.before.s)}" data-before-kind="${n.before.kind}" data-before-icon="#${id}-i-${beforeIcon}" data-after-t="${esc(n.after.t)}" data-after-s="${esc(n.after.s)}" data-after-kind="${n.after.kind}" data-after-icon="#${id}-i-${afterIcon}"${n.after.hidden ? ' data-after-hidden' : ''} style="transform:translate(${before[0]}px, ${before[1]}px)"><rect width="140" height="56" rx="12"/><g class="pl-icon" aria-hidden="true" transform="translate(${iconX} -10)"><circle cx="12" cy="12" r="11"/><use href="#${id}-i-${beforeIcon}" x="4" y="4" width="16" height="16"/></g><text class="pl-title" x="70" y="20" text-anchor="middle" dominant-baseline="central">${n.before.t}</text><text class="pl-sub" x="70" y="38" text-anchor="middle" dominant-baseline="central">${n.before.s}</text></g>`;
  }).join('');
  const rework = `M${mx(255)} 226 L${mx(255)} 262 L${mx(560)} 262 L${mx(560)} 228`;
  const price = `M${mx(375)} 178 L${mx(375)} 208 L${mx(255)} 208 L${mx(255)} 238`;
  return `<figure class="pipeline tool" data-pipeline data-mode="before" data-desc-before="${esc(p.desc.before)}" data-desc-after="${esc(p.desc.after)}" data-stat-before="${esc(p.stat.before)}" data-stat-after="${esc(p.stat.after)}" data-line-before="${esc(p.legend.rework)}" data-line-after="${esc(p.legend.live)}">
<div class="tool-head"><div class="seg" role="group" aria-label="${esc(p.toggleAria)}" hidden><button type="button" aria-pressed="true" data-mode-btn="before">${p.toggle.before}</button><button type="button" aria-pressed="false" data-mode-btn="after">${p.toggle.after}</button></div>${ill(c)}</div>
<svg viewBox="0 0 680 320" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${p.title}</title><desc id="${id}-desc">${p.desc.before}</desc>
<defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="context-stroke" stroke-linecap="round" stroke-linejoin="round"/></marker>${icons}</defs>
<g class="pl-edges pl-edges--before">${beforeLines}<path class="pl-rework" d="${rework}" marker-end="url(#${id}-arrow)"/></g>
<g class="pl-edges pl-edges--after" style="opacity:0">${afterLines}<line class="pl-live" x1="${mx(415)}" y1="178" x2="${mx(415)}" y2="238" marker-start="url(#${id}-arrow)" marker-end="url(#${id}-arrow)"/><path class="pl-live" d="${price}" marker-start="url(#${id}-arrow)" marker-end="url(#${id}-arrow)"/></g>
${nodes}</svg>
<ul class="pl-legend" aria-hidden="true"><li><i class="pl-key pl-key--person"></i>${p.legend.person}</li><li><i class="pl-key pl-key--ai"></i>${p.legend.ai}</li><li><i class="pl-key pl-key--system"></i>${p.legend.system}</li><li><i class="pl-key pl-key--line"></i><span data-pl-line-label>${p.legend.rework}</span></li></ul>
<p class="pl-stat" data-pl-stat aria-live="polite">${p.stat.before}</p>
<ol class="sr-only"><li>${p.desc.before}</li><li>${p.desc.after}</li></ol></figure>`;
}



function calculator(c) {
  const k = c.calc, f = k.fields;
  const fld = (n, extra = '') => `<div class="field"><label for="c-${n}">${f[n].l}</label><input id="c-${n}" name="${n}" inputmode="decimal" ${extra} aria-describedby="h-${n} e-${n}"><span class="hint" id="h-${n}">${f[n].h}</span><span class="err" id="e-${n}" role="alert"></span></div>`;
  return `<div class="calc" data-calc data-errs='${json(k.err)}' data-hours="${esc(k.hours)}" data-days="${esc(k.daysU)}" data-tasks="${esc(k.tasksU)}" data-lang="${c.lang === 'he' ? 'he-IL' : 'en-IL'}">
<form class="tool" novalidate onsubmit="return false"><div class="tool-head"><h3>${k.title}</h3>${ill(c)}</div>
${fld('tasks', 'value="400"')}${fld('minutes', 'value="12"')}
<div class="field"><label for="c-saved">${f.saved.l}: <b data-saved-out>30%</b></label><input id="c-saved" name="saved" type="range" min="1" max="80" value="30" aria-describedby="h-saved e-saved"><span class="hint" id="h-saved">${f.saved.h}</span><span class="err" id="e-saved" role="alert"></span></div>
${fld('rate')}
<button class="btn btn--sm" type="button" data-reset>${k.reset}</button></form>
<div><div class="results" aria-live="polite"><dl>
<div><dt>${k.out.freed}</dt><dd><span class="big" data-o="freed">—</span></dd></div>
<div><dt>${k.out.base}</dt><dd data-o="base">—</dd></div>
<div><dt>${k.out.days}</dt><dd data-o="days">—</dd></div>
<div><dt>${k.out.extra}</dt><dd data-o="extra">—</dd></div>
<div class="scen" data-value-box hidden><dt>${k.out.value}</dt><dd class="scen-val" data-o="value">—</dd></div></dl>
<p class="small scen-note">${k.scenarioNote}</p></div>
<div class="calc-explain"><h4>${k.explain.h}</h4>${ticks(k.explain.items)}</div>
<div class="btn-row"><a class="btn btn--primary" href="${bookUrl(c)}" data-track="cta_calc">${k.cta}${arrow}</a></div></div></div>`;
}

function check(c) {
  const k = c.check;
  const res = Object.fromEntries(Object.entries(k.res).map(([n, r]) => [n, { ...r, href: href(c.lang, r.href) }]));
  const data = { qs: k.qs, res, t: { next: k.next, back: k.back, see: k.see, again: k.again, of: k.of, optional: k.optional }, book: bookUrl(c) };
  return `<div class="tool" data-check><script type="application/json" data-check-json>${json(data)}</script>
<div data-check-ui><p>${k.intro}</p><button class="btn btn--primary" type="button" data-check-start>${k.start}</button></div></div>`;
}

const faqList = (items) => `<div class="faq">${items.map((i) => `<details><summary>${i.q}</summary><div class="ans"><p>${i.a}</p></div></details>`).join('')}</div>`;
const faqLd = (items) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })) });

/* ---------- lead form ---------- */
function leadForm(c, { pain = '', extras = [], full = false, id = 'lead', title = c.form.title } = {}) {
  const F = c.form, f = F.f;
  const req = `<span aria-hidden="true"> *</span><span class="sr-only"> (${F.errors.required})</span>`;
  const input = (n, label, { type = 'text', required = true, auto = '', cls = '', hint = '' } = {}) => `<div class="field ${cls}"><label for="${id}-${n}">${label}${required ? req : ''}</label><input id="${id}-${n}" name="${n}" type="${type}" ${required ? 'required' : ''} ${auto ? `autocomplete="${auto}"` : ''} aria-describedby="${id}-${n}-e${hint ? ` ${id}-${n}-h` : ''}">${hint ? `<span class="hint" id="${id}-${n}-h">${hint}</span>` : ''}<span class="err" id="${id}-${n}-e" role="alert"></span></div>`;
  const select = (n, label, opts, { required = true, cls = '' } = {}) => `<div class="field ${cls}"><label for="${id}-${n}">${label}${required ? req : ''}</label><select id="${id}-${n}" name="${n}" ${required ? 'required' : ''} aria-describedby="${id}-${n}-e"><option value="">${F.select}</option>${opts.map((o) => (Array.isArray(o) ? `<option value="${o[0]}">${o[1]}</option>` : `<option>${o}</option>`)).join('')}</select><span class="err" id="${id}-${n}-e" role="alert"></span></div>`;
  const E = F.errors, O = F.ok;
  return `<form class="form-card" data-lead-form id="${id}" novalidate method="post" action="/api/leads" data-lang="${c.lang}"
 data-m-required="${esc(E.required)}" data-m-email="${esc(E.email)}" data-m-consent="${esc(E.consent)}" data-m-fix="${esc(c.ui.fixField)}" data-m-sending="${esc(c.ui.sending)}" data-m-fail="${esc(F.fail)}" data-m-net="${esc(F.failNet)}"
 data-ok-h="${esc(O.h)}" data-ok-p="${esc(O.p)}" data-dev-h="${esc(O.devH)}" data-dev="${esc(O.dev)}" data-book-l="${esc(O.book)}">
${full ? `<h2>${title}</h2>` : `<h3>${title}</h3>`}
<div class="form-grid">
${input('name', f.name, { auto: 'name' })}
${select('role', f.role, F.roles)}
${input('company', f.company, { auto: 'organization' })}
${select('size', f.size, F.sizes, { required: false })}
${full ? select('pain', f.pain, F.pains, { cls: 'full' }) : `<input type="hidden" name="pain" value="${pain}">`}
${extras.map((x) => (x.t === 'select' ? select(x.n, x.l, x.o, { required: false }) : input(x.n, x.l, { required: false, hint: x.h || '' }))).join('')}
${full ? `<div class="field full"><label for="${id}-detail">${f.detail}</label><textarea id="${id}-detail" name="detail" maxlength="1500"></textarea></div>${select('urgency', f.urgency, F.urgencies, { required: false })}${select('budget', f.budget, F.budgets, { required: false })}` : ''}
${input('email', f.email, { type: 'email', auto: 'email' })}
${input('phone', f.phone, { type: 'tel', required: false, auto: 'tel' })}
</div>
<p class="notice small form-note">${c.contact.priceNote}</p>
<div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
<input type="hidden" name="lang" value="${c.lang}"><input type="hidden" name="source" value=""><input type="hidden" name="ts" value="">
<div class="field"><div class="checkrow"><input id="${id}-consent" name="consent" type="checkbox" required aria-describedby="${id}-consent-e"><label for="${id}-consent">${F.consent.replace(/ראו מדיניות פרטיות|See the privacy policy/, (m) => `<a href="${href(c.lang, 'privacy')}">${m}</a>`)}</label></div><span class="err" id="${id}-consent-e" role="alert"></span></div>
<div class="form-status" role="status" aria-live="polite" tabindex="-1"></div>
<button class="btn btn--primary" type="submit" data-submit>${c.ui.send}${arrow}</button>
</form>`;
}

/* ---------- shared blocks ---------- */
// The four stages as standing bars that rise with commitment. Stage 1 is free and carries the booking action;
// paid stages show their duration only (no prices here), with the price wording ("excl. VAT") dropped from the unit.
const duration = (u) => u.split(' · ').filter((part) => !/VAT|מע״מ/.test(part)).join(' · ');
function offerCards(c, ctaLabel = c.ui.book) {
  const o = c.offers;
  const [free, ...paid] = o.items;
  const freeBar = `<li class="stair stair--free"><span class="stage">${free.stage}</span><p class="free-mark">${free.price}</p><h3>${free.h}</h3><p class="dur">${duration(free.unit)}</p>${btn(c, ctaLabel, bookUrl(c), 'btn--primary', 'data-track="cta_offers_free"')}<p>${free.p}</p><p class="guard">${free.guard}</p></li>`;
  const bars = paid.map((x, i) => `<li class="stair" style="--step:${i + 1}"><span class="stage">${x.stage}</span><h3>${x.h}</h3><p class="dur">${duration(x.unit)}</p><p>${x.p}</p><p class="guard">${x.guard}</p></li>`).join('');
  return `<ol class="stairs">${freeBar}${bars}</ol>
<div class="notice"><strong>${o.guarantee.h}.</strong> ${o.guarantee.p}</div>`;
}
const ctaBand = (c, title, p, pain) => section(`<div class="cta-band"><h2>${title}</h2><p class="lede">${p}</p><div class="btn-row">${btn(c, c.ui.book, bookUrl(c, pain), 'btn--primary', 'data-track="cta_band"')}${btn(c, c.ui.seeHow, href(c.lang, 'how'), '')}</div></div>`, 'section--dark');
const pageHero = (c, h1, lede) => `<section class="page-hero"><div class="container"><p class="page-kicker"><span>${brandDescriptor(c)}</span><span>${founderLine(c)}</span></p><h1>${h1}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</div></section>`;

/* ---------- pages ---------- */
const pages = {};

pages.home = (c) => {
  const h = c.home, hr = h.hero;
  const outcomePicks = [h.outcomes.items[0], h.outcomes.items[3], h.outcomes.items[5]];
  const proofSignals = [h.founder.signals[0], h.founder.signals[2], h.founder.signals[5]];
  const body = `
<section class="hero"><div class="container hero-stage">
  <div class="hero-copy"><p class="brand-positioning"><span>${hr.eyebrow}</span><span>${founderLine(c)}</span></p><h1>${hr.h1}</h1>
  <p class="lede">${hr.sub}</p>
  <div class="btn-row">${btn(c, h.sales.cta, bookUrl(c), 'btn--primary', 'data-track="cta_hero"')}${btn(c, h.sales.secondary, '#deliver', '')}</div>
  <p class="trust-line"><strong>${hr.trust}</strong> ${hr.proof}</p></div>
</div></section>
${section(`<div class="delivery-layout"><div><span class="eyebrow">${h.delivery.eyebrow}</span><h2 id="delivery-title">${h.delivery.title}</h2><p class="lede">${h.delivery.intro}</p></div><ol class="delivery-list">${h.delivery.items.map((x, i) => `<li><span aria-hidden="true">0${i + 1}</span><p>${x}</p></li>`).join('')}</ol></div>`, 'home-delivery', 'deliver', 'delivery-title')}
${section(`${head(h.sales.eyebrow, h.sales.title, h.sales.intro, 'o')}${offerCards(c, h.sales.cta)}<div class="home-offer-link">${btn(c, c.nav.how, href(c.lang, 'how'), '')}</div>`, 'section--tint home-offers', 'offers', 'o')}
${section(`<div class="home-focus-grid"><div><span class="eyebrow">${h.outcomes.eyebrow}</span><h2 id="focus-title">${h.outcomes.title}</h2><p class="lede">${h.outcomes.intro}</p></div><div class="outcome-short">${outcomePicks.map((x) => `<article><h3>${x.h}</h3><p>${x.p}</p></article>`).join('')}</div></div>`, 'home-focus', 'work', 'focus-title')}
${section(`<div class="split split--even">${founderPanel(c)}<div><span class="eyebrow">${h.founder.eyebrow}</span><h2>${h.founder.title}</h2><p class="lede">${h.founder.p}</p>${ticks(proofSignals)}<div class="btn-row">${btn(c, h.founder.link, href(c.lang, 'about'), '')}${btn(c, h.safe.link, href(c.lang, 'security'), '')}</div></div></div>`, 'section--dark home-founder', 'founder')}
${ctaBand(c, h.cta.title, h.cta.p)}`;
  const ld = { '@context': 'https://schema.org', '@type': 'Organization', name: 'bee & co.', description: c.descriptor, founder: { '@type': 'Person', name: 'Eran' } };
  return { meta: h.meta, body, ld };
};

pages.usecase = (c) => {
  const p = c.usecase, s = p.savings;
  // One row per box a person used to fill in the diagram: before, with AI, what it saves.
  // Column labels sit in a header row on wide screens and inside each cell (visible) on phones.
  const cell = (cls, i, text) => `<p class="${cls}"><span class="sv-l">${s.cols[i]}</span>${text}</p>`;
  const rows = s.items.map((x) => `<li>${cell('sv-before', 0, x.before)}${cell('sv-after', 1, x.after)}${cell('sv-saves', 2, x.saves)}</li>`).join('');
  const body = `${pageHero(c, p.h1, p.lede)}
${section(`${head('', c.pipeline.title, c.pipeline.intro, 'pipeline-title')}${pipeline(c, 'pipeline-usecase')}`, 'section--tint usecase-diagram', 'pipeline-s', 'pipeline-title')}
${section(`${head('', s.title, s.intro, 'savings-title')}<div class="savings-head" aria-hidden="true">${s.cols.map((x) => `<span>${x}</span>`).join('')}</div><ol class="savings">${rows}</ol><p class="savings-total">${s.total}</p>`, '', 'savings', 'savings-title')}
${ctaBand(c, p.cta.title, p.cta.p, 'usecase')}`;
  return { meta: p.meta, body };
};

pages.how = (c) => {
  const p = c.how;
  const body = `${pageHero(c, p.h1, p.lede)}
${section(p.stages.map((s, i) => `<article class="stage-row"><div class="stage-n" aria-hidden="true">${i + 1}</div><div><h2>${s.h}</h2><p class="who">${s.who}</p></div><div>${s.p.map((x) => `<p>${x}</p>`).join('')}<p class="out">${s.out}</p></div></article>`).join(''))}
${section(`${head('', p.tableTitle, p.salesIntro, 'stages-title')}${offerCards(c)}`, 'section--tint sales-path', 'stages', 'stages-title')}
${section(`<div class="split split--even"><div><h2>${p.needTitle}</h2>${ticks(p.need)}</div><div>${btn(c, p.cta, bookUrl(c), 'btn--primary')}</div></div>`)}
${section(`${head('', c.pipeline.title, c.pipeline.intro, 'pipeline-title')}${pipeline(c, 'pipeline-how')}`, '', 'pipeline-s', 'pipeline-title')}`;
  return { meta: p.meta, body };
};

pages.about = (c) => {
  const p = c.about;
  const body = `${pageHero(c, p.h1, p.lede)}
${section(`<div class="split split--even">${founderPanel(c)}<div class="prose">${p.story.map((x) => `<p>${x}</p>`).join('')}</div></div>`)}
${section(`<h2>${p.sigTitle}</h2><div class="grid g4">${p.sigs.map((x) => `<article class="card"><h3>${x.h}</h3><p>${x.p}</p></article>`).join('')}</div>`, 'section--tint')}
${section(`<div class="split split--even"><div><h2>${p.princTitle}</h2>${ticks(p.princ)}</div><div>${btn(c, p.cta, bookUrl(c), 'btn--primary')}</div></div>`)}`;
  return { meta: p.meta, body };
};

pages.results = (c) => {
  const p = c.results;
  const cycle = `<ol class="measure-cycle">${p.cycle.map((x, i) => `<li><span class="cycle-n" aria-hidden="true">0${i + 1}</span><div><h3>${x.h}</h3><p>${x.p}</p></div></li>`).join('')}</ol>`;
  const metrics = `<div class="metric-grid">${p.rows.map((r, i) => `<article class="metric-card"><span class="metric-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${r[0]}</h3><dl><div><dt>${p.cols[1]}</dt><dd>${r[1]}</dd></div><div><dt>${p.cols[2]}</dt><dd>${r[2]}</dd></div></dl></article>`).join('')}</div>`;
  const body = `${pageHero(c, p.h1, p.lede)}
${section(`<div class="results-title"><span class="eyebrow">${p.cols[0]}</span><h2 id="score-title">${p.scoreTitle}</h2></div>${cycle}${metrics}`, 'results-score', 'scorecard', 'score-title')}
${section(`<div class="proof-layout"><article class="gate-panel"><span class="proof-label">01</span><h2>${p.gatesTitle}</h2>${ticks(p.gates)}</article><div class="evidence-stack"><article class="monthly-card"><span class="proof-label">02</span><h2 class="h-sm">${p.monthly.h}</h2><p>${p.monthly.p}</p></article><article class="evidence-note"><span class="proof-label">03</span><h2 class="h-sm">${p.honest.h}</h2><p>${p.honest.p}</p></article></div></div><div class="results-action">${btn(c, p.cta, bookUrl(c), 'btn--primary')}</div>`, 'results-proof section--tint')}`;
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
${section(`<div class="split split--top"><div>${leadForm(c, { full: true, id: 'lead' })}</div><aside class="aside-stack"><div class="card"><h3>${p.next.h}</h3><ol class="steps">${p.next.steps.map((x) => `<li>${x}</li>`).join('')}</ol></div><div class="card"><h3>${p.bring.h}</h3>${ticks(p.bring.items)}</div></aside></div>`)}`;
  return { meta: p.meta, body };
};

pages.privacy = (c) => {
  const p = c.privacy;
  const body = `${pageHero(c, p.h1, '')}${section(`<div class="draft-banner"><strong>${p.draft}</strong></div><div class="prose">${p.sections.map((s) => `<h2>${s.h}</h2><p>${s.p}</p>`).join('')}</div>`)}`;
  return { meta: p.meta, body };
};

export function render404(c, ctx) {
  const body = section(`<h1>${c.notFound.h}</h1><p class="lede">${c.notFound.p}</p>${btn(c, c.notFound.cta, href(c.lang, 'home'), 'btn--primary')}`);
  return layout({ c, key: 'home', meta: { title: c.notFound.h + ' — bee & co.', desc: c.notFound.p }, body, ctx: { ...ctx, noindex: true } });
}

export function renderPage(c, key, ctx) {
  const { meta, body, ld } = pages[key](c);
  return layout({ c, key, meta, body, ctx: { ...ctx, noindex: key === 'privacy' && ctx.draftNoindex }, ld });
}
export { routes };
