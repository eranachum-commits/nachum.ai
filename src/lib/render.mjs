import { href, routes } from './routes.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const arrow = ''; // buttons say what they do; no decorative arrows
const SOLUTION_KEYS = ['quotes', 'inbox', 'discovery', 'adoption'];

/* ---------- primitives ---------- */
export const btn = (c, label, url, cls = 'btn--primary', attrs = '') => `<a class="btn ${cls}" href="${url}" ${attrs}>${label}${arrow}</a>`;
const bookUrl = (c, pain) => href(c.lang, 'contact') + (pain ? `?pain=${pain}` : '');
const ill = (c) => `<span class="chip chip--ill">${esc(c.ui.illustrative)}</span>`;
const head = (_eyebrow, title, intro, id) => `<div class="section-head"><h2${id ? ` id="${id}"` : ''}>${title}</h2>${intro ? `<p class="lede">${intro}</p>` : ''}</div>`;
const ticks = (arr) => `<ul class="ticks">${arr.map((x) => `<li>${x}</li>`).join('')}</ul>`;
const section = (inner, cls = '', id = '', labelledby = '') => `<section class="section ${cls}"${id ? ` id="${id}"` : ''}${labelledby ? ` aria-labelledby="${labelledby}"` : ''}><div class="container">${inner}</div></section>`;
// Prices and numbers inside RTL copy must not be reordered by the bidi algorithm.
const bdi = (s) => `<bdi>${s}</bdi>`;

/* ---------- layout ---------- */
function header(c, key) {
  const link = (k, label) => `<a href="${href(c.lang, k)}"${key === k ? ' aria-current="page"' : ''}>${label}</a>`;
  const subs = SOLUTION_KEYS.map((k) => `<a href="${href(c.lang, k)}"${key === k ? ' aria-current="page"' : ''}>${c.sub[k].t}<small>${c.sub[k].d}</small></a>`).join('');
  const msubs = SOLUTION_KEYS.map((k) => `<a href="${href(c.lang, k)}">${c.sub[k].t}</a>`).join('');
  const other = c.lang === 'he' ? 'en' : 'he';
  return `<header class="site-header"><div class="container header-in">
  <a class="logo" href="${href(c.lang, 'home')}" aria-label="NACHUM.AI — ${esc(c.ui.home)}"><span class="logo-mark" aria-hidden="true"></span><span>NACHUM<span class="logo-ai">.AI</span></span></a>
  <nav class="nav" aria-label="${esc(c.ui.main)}">
    ${link('how', c.nav.how)}
    <div class="has-sub"><button class="nav-link" type="button" aria-expanded="false" aria-controls="sub-menu" data-sub>${c.nav.solutions}<svg class="caret" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button><div class="sub" id="sub-menu">${subs}</div></div>
    ${link('about', c.nav.about)}${link('results', c.nav.results)}${link('faq', c.nav.faq)}
    <a class="lang-switch" href="__ALT__" hreflang="${other}" lang="${other}" aria-label="${esc(c.switchAria)}">${c.switchLabel}</a>
  </nav>
  <a class="btn btn--primary btn--sm" href="${bookUrl(c)}" data-track="cta_header">${c.ui.book}</a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav" data-menu>${c.ui.menu}</button>
</div>
<nav class="mobile-nav" id="mobile-nav" aria-label="${esc(c.ui.main)}"><div class="container">
  <a href="${href(c.lang, 'how')}">${c.nav.how}</a>
  <span class="m-label">${c.nav.solutions}</span><div class="m-sub">${msubs}</div>
  <a href="${href(c.lang, 'about')}">${c.nav.about}</a><a href="${href(c.lang, 'results')}">${c.nav.results}</a><a href="${href(c.lang, 'faq')}">${c.nav.faq}</a>
  <a href="__ALT__" hreflang="${other}" lang="${other}">${c.switchLabel}</a>
  <a class="btn btn--primary" href="${bookUrl(c)}">${c.ui.book}</a>
</div></nav></header>`;
}

function footer(c) {
  const f = c.footer;
  return `<footer class="site-footer"><div class="container">
  <div class="foot-grid">
    <div><a class="logo" href="${href(c.lang, 'home')}"><span class="logo-mark" aria-hidden="true"></span><span>NACHUM<span class="logo-ai">.AI</span></span></a><p>${f.tag}</p></div>
    <div><h2>${f.cols.site}</h2><ul><li><a href="${href(c.lang, 'how')}">${c.nav.how}</a></li><li><a href="${href(c.lang, 'about')}">${c.nav.about}</a></li><li><a href="${href(c.lang, 'results')}">${c.nav.results}</a></li><li><a href="${href(c.lang, 'faq')}">${c.nav.faq}</a></li><li><a href="${href(c.lang, 'contact')}">${f.contact}</a></li></ul></div>
    <div><h2>${f.cols.solutions}</h2><ul>${SOLUTION_KEYS.map((k) => `<li><a href="${href(c.lang, k)}">${c.sub[k].t}</a></li>`).join('')}</ul></div>
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
<meta property="og:type" content="website"><meta property="og:site_name" content="NACHUM.AI">
<meta property="og:title" content="${esc(meta.title)}"><meta property="og:description" content="${esc(meta.desc)}">
<meta property="og:url" content="${url(c.lang)}"><meta property="og:locale" content="${c.ogLocale}"><meta property="og:locale:alternate" content="${other === 'he' ? 'he_IL' : 'en_US'}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#e4ebfd">
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
function docStack(c) {
  const d = c.home.doc;
  return `<figure class="doc-stack work-order" aria-label="${esc(d.title)}"><div class="wo-head"><span>${d.title}</span>${ill(c)}</div>
${d.stages.map((s, i) => `<div class="doc-stage" data-n="${i + 1}"><p class="stage-h">${s.h} <span class="chip${s.human ? ' chip--human' : ''}">${s.chip}</span></p><div class="doc-body">${s.rows.map(([k, v]) => `<div class="row"><span>${k}</span><span>${bdi(v)}</span></div>`).join('')}</div>${s.human ? `<span class="stamp" aria-hidden="true"><span>${esc(c.ui.stamp)}</span></span>` : ''}</div>`).join('')}
<figcaption class="ill-note">${d.note}</figcaption></figure>`;
}

function landingVisual(c, k) {
  const s = c.solutions[k];
  if (s.visual === 'doc') return docStack(c);
  if (k === 'inbox') {
    return `<figure class="doc-stack"><div class="msgs">${s.visual.items.map((m) => `<div class="msg"><span><b>${m.who}</b> · ${m.text}</span><span class="chip ${m.tone === 'hot' ? 'chip--hot' : m.tone === 'human' ? 'chip--human' : ''}">${m.chip}</span><small>${m.note}</small></div>`).join('')}</div><figcaption class="ill-note">${ill(c)}</figcaption></figure>`;
  }
  if (k === 'discovery') {
    return `<figure class="doc-stack"><ol class="rank">${s.visual.items.map((it, i) => `<li${it.no ? ' class="no"' : ''}><span class="n">${it.no ? '×' : i + 1}</span><div>${it.t}${it.no ? ` <span class="chip">${it.no}</span>` : ''}<div class="meters"><span>${s.visual.impactL}<i style="--v:${it.impact}%"></i></span><span>${s.visual.feasL}<i style="--v:${it.feas}%"></i></span></div></div></li>`).join('')}</ol><figcaption class="ill-note">${ill(c)}</figcaption></figure>`;
  }
  return `<figure class="doc-stack"><div class="usage">${s.visual.items.map((u) => `<div class="u"><div><span>${u.name}</span><span>${bdi(u.pct + '%')}</span></div><div class="b"><i style="--v:${u.pct}%"></i></div></div>`).join('')}</div><figcaption class="ill-note">${ill(c)} ${s.visual.cap}</figcaption></figure>`;
}

/* ---------- interactive tools ---------- */
function explorer(c, id) {
  const e = c.explorer, d = e[id], L = e.labels, m = c.ui.minutes;
  const tb = d.steps.reduce((a, s) => a + s.tb, 0), ta = d.steps.reduce((a, s) => a + s.ta, 0);
  return `<div class="tool" data-explorer data-mode="before" data-tb="${tb}" data-ta="${ta}" data-unit="${esc(m)}" data-track-id="explorer_${id}">
<div class="tool-head"><h3>${d.title}</h3>
<div class="seg" role="group" aria-label="${esc(L.aria)}"><button type="button" aria-pressed="true" data-mode-btn="before">${e.toggle.before}</button><button type="button" aria-pressed="false" data-mode-btn="after">${e.toggle.after}</button></div>${ill(c)}</div>
<ol class="xsteps">${d.steps.map((s) => `<li class="xstep" data-human="${s.human ? 1 : 0}"><div><h4>${s.h}${s.human ? ` <span class="chip chip--human">${L.human}</span>` : ''}</h4><p class="before">${s.before}</p><p class="after">${s.after}</p></div><span class="t"><span class="before">${bdi(s.tb + ' ' + m)}</span><span class="after">${bdi(s.ta + ' ' + m)}</span></span></li>`).join('')}</ol>
<div class="totals"><div><span class="muted small">${L.total}</span><br><b data-total aria-live="polite">${bdi(tb + ' ' + m)}</b></div></div>
${timeline(c, d, tb, ta)}
<p class="ill-note">${L.disclaimer}</p></div>`;
}

function pipeline(c, id) {
  const p = c.pipeline;
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
    return `<g class="pl-node pl--${n.before.kind}" data-node="${n.id}" data-before="${before.join(',')}" data-after="${after.join(',')}" data-before-t="${esc(n.before.t)}" data-before-s="${esc(n.before.s)}" data-before-kind="${n.before.kind}" data-after-t="${esc(n.after.t)}" data-after-s="${esc(n.after.s)}" data-after-kind="${n.after.kind}"${n.after.hidden ? ' data-after-hidden' : ''} style="transform:translate(${before[0]}px, ${before[1]}px)"><rect width="140" height="56" rx="12"/><text class="pl-title" x="70" y="20" text-anchor="middle" dominant-baseline="central">${n.before.t}</text><text class="pl-sub" x="70" y="38" text-anchor="middle" dominant-baseline="central">${n.before.s}</text></g>`;
  }).join('');
  const rework = `M${mx(255)} 226 L${mx(255)} 262 L${mx(560)} 262 L${mx(560)} 228`;
  const price = `M${mx(375)} 178 L${mx(375)} 208 L${mx(255)} 208 L${mx(255)} 238`;
  return `<figure class="pipeline tool" data-pipeline data-mode="before" data-desc-before="${esc(p.desc.before)}" data-desc-after="${esc(p.desc.after)}" data-stat-before="${esc(p.stat.before)}" data-stat-after="${esc(p.stat.after)}" data-line-before="${esc(p.legend.rework)}" data-line-after="${esc(p.legend.live)}">
<div class="tool-head"><div class="seg" role="group" aria-label="${esc(p.toggleAria)}" hidden><button type="button" aria-pressed="true" data-mode-btn="before">${p.toggle.before}</button><button type="button" aria-pressed="false" data-mode-btn="after">${p.toggle.after}</button></div>${ill(c)}</div>
<svg viewBox="0 0 680 320" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${p.title}</title><desc id="${id}-desc">${p.desc.before}</desc>
<defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="context-stroke" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
<g class="pl-edges pl-edges--before">${beforeLines}<path class="pl-rework" d="${rework}" marker-end="url(#${id}-arrow)"/></g>
<g class="pl-edges pl-edges--after" style="opacity:0">${afterLines}<line class="pl-live" x1="${mx(415)}" y1="178" x2="${mx(415)}" y2="238" marker-start="url(#${id}-arrow)" marker-end="url(#${id}-arrow)"/><path class="pl-live" d="${price}" marker-start="url(#${id}-arrow)" marker-end="url(#${id}-arrow)"/></g>
${nodes}</svg>
<ul class="pl-legend" aria-hidden="true"><li><i class="pl-key pl-key--person"></i>${p.legend.person}</li><li><i class="pl-key pl-key--ai"></i>${p.legend.ai}</li><li><i class="pl-key pl-key--system"></i>${p.legend.system}</li><li><i class="pl-key pl-key--line"></i><span data-pl-line-label>${p.legend.rework}</span></li></ul>
<p class="pl-stat" data-pl-stat aria-live="polite">${p.stat.before}</p>
<ol class="sr-only"><li>${p.desc.before}</li><li>${p.desc.after}</li></ol></figure>`;
}

// Quadrant a dot sits in, using the same labels the chart shows: q = [high impact+feasible, high impact+hard, low impact+feasible, low impact+hard].
const quadrant = (p, i) => p.q[(i.y >= 50 ? 2 : 0) + (i.x >= 50 ? 0 : 1)];

// Before/after as one diagram: each step is a segment sized by its minutes.
// Grey = manual work, blue = AI-assisted, apricot = the human checkpoint.
function timeline(c, d, tb, ta) {
  const e = c.explorer, L = e.labels, m = c.ui.minutes;
  const seg = (s, i, t, kind) => `<span class="tl-seg tl-seg--${kind}" style="flex:${t}" title="${esc(s.h)}">${i + 1}</span>`;
  const row = (cls, label, total, pct, segs) => `<div class="tl-row tl-row--${cls}"><span class="tl-label">${label}</span><div class="tl-track"><div class="tl-bar" style="width:${pct}%">${segs}</div></div><span class="tl-total">${bdi(total + ' ' + m)}</span></div>`;
  const before = row('before', e.toggle.before, tb, 100, d.steps.map((s, i) => seg(s, i, s.tb, 'manual')).join(''));
  const after = row('after', e.toggle.after, ta, Math.max(18, Math.round((ta / tb) * 100)), d.steps.map((s, i) => seg(s, i, s.ta, s.human ? 'human' : 'ai')).join(''));
  return `<figure class="timeline" aria-label="${esc(L.timeline)}: ${esc(e.toggle.before)} ${tb} ${esc(m)}, ${esc(e.toggle.after)} ${ta} ${esc(m)}"><figcaption class="tl-cap">${L.timeline}</figcaption><div aria-hidden="true">${before}${after}</div>
<ul class="tl-legend" aria-hidden="true"><li><i class="tl-key tl-seg--manual"></i>${L.manual}</li><li><i class="tl-key tl-seg--ai"></i>${L.ai}</li><li><i class="tl-key tl-seg--human"></i>${L.human}</li></ul></figure>`;
}

function matrix(c, s) {
  const p = s.process;
  return `<div class="tool"><div class="tool-head"><h3>${p.title}</h3>${ill(c)}</div>
<div class="matrix" aria-hidden="true">
<span class="q" style="inset-block-start:0;inset-inline-end:0;text-align:end">${p.q[0]}</span><span class="q" style="inset-block-start:0;inset-inline-start:0">${p.q[1]}</span>
<span class="q" style="inset-block-end:0;inset-inline-end:0;text-align:end">${p.q[2]}</span><span class="q" style="inset-block-end:0;inset-inline-start:0">${p.q[3]}</span>
${p.items.map((i) => `<span class="dot${i.top ? ' top' : ''}${i.no ? ' no' : ''}" style="inset-inline-start:${i.x}%;top:${i.y}%">${i.no ? '×' : i.n}</span>`).join('')}</div>
<div class="axis" aria-hidden="true"><span>${p.xl} <span class="ax">→</span></span><span>${p.yl} ↑</span></div>
<ol class="sr-only">${p.items.map((i) => { const v = s.visual.items[i.n - 1]; return `<li>${v.t}: ${quadrant(p, i)}${v.no ? ` (${v.no})` : ''}</li>`; }).join('')}</ol>
<p class="ill-note">${c.explorer.labels.disclaimer}</p></div>`;
}

function ladder(c, s) {
  const p = s.process;
  return `<div class="tool" data-ladder><div class="tool-head"><h3>${p.title}</h3>${ill(c)}</div>
<div class="ladder-tabs" role="tablist" aria-label="${esc(p.title)}">${p.stages.map((st, i) => `<button type="button" role="tab" id="lt-${i}" aria-controls="lp-${i}" aria-selected="${i === 3 ? 'true' : 'false'}" tabindex="${i === 3 ? 0 : -1}">${i + 1}. ${st.l}</button>`).join('')}</div>
${p.stages.map((st, i) => `<div class="ladder-panel" role="tabpanel" id="lp-${i}" aria-labelledby="lt-${i}" ${i === 3 ? '' : 'hidden'}><div class="card"><h4>${p.blockL}</h4><p>${st.block}</p></div><div class="card"><h4>${p.fixL}</h4><p>${st.fix}</p></div><div class="card"><h4>${p.kpiL}</h4><p>${st.kpi}</p></div></div>`).join('')}
<p class="ill-note">${c.explorer.labels.disclaimer}</p></div>`;
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
function offerCards(c) {
  const o = c.offers;
  const [free, ...paid] = o.items;
  const freeBar = `<li class="stair stair--free"><span class="stage">${free.stage}</span><p class="free-mark">${free.price}</p><h3>${free.h}</h3><p class="dur">${duration(free.unit)}</p><p>${free.p}</p><p class="guard">${free.guard}</p>${btn(c, c.ui.book, bookUrl(c), 'btn--primary', 'data-track="cta_offers_free"')}</li>`;
  const bars = paid.map((x, i) => `<li class="stair" style="--step:${i + 1}"><span class="stage">${x.stage}</span><h3>${x.h}</h3><p class="dur">${duration(x.unit)}</p><p>${x.p}</p><p class="guard">${x.guard}</p></li>`).join('');
  return `<ol class="stairs">${freeBar}${bars}</ol>
<div class="notice"><strong>${o.guarantee.h}.</strong> ${o.guarantee.p}</div>`;
}
const ctaBand = (c, title, p, pain) => section(`<div class="cta-band"><h2>${title}</h2><p class="lede">${p}</p><div class="btn-row">${btn(c, c.ui.book, bookUrl(c, pain), 'btn--primary', 'data-track="cta_band"')}${btn(c, c.ui.seeHow, href(c.lang, 'how'), '')}</div></div>`, 'section--dark');
const pageHero = (c, h1, lede) => `<section class="page-hero"><div class="container"><h1>${h1}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</div></section>`;

/* ---------- pages ---------- */
const pages = {};

pages.home = (c) => {
  const h = c.home, hr = h.hero;
  const body = `
<section class="hero"><div class="container split">
  <div class="hero-copy"><p class="kicker">${hr.eyebrow}</p><h1>${hr.h1}</h1>
  <p class="lede">${hr.sub}</p><p class="hero-body">${hr.body}</p>
  <div class="btn-row">${btn(c, c.ui.book, bookUrl(c), 'btn--primary', 'data-track="cta_hero"')}${btn(c, c.ui.seeHow, '#how', '')}</div>
  <p class="trust-line"><strong>${hr.trust}</strong> ${hr.proof}</p></div>
  <div class="hero-visual">${docStack(c)}</div>
</div></section>
${section(`${head(h.outcomes.eyebrow, h.outcomes.title, h.outcomes.intro, 'outcomes')}<div class="ledger">${h.outcomes.items.map((x) => `<article><h3>${x.h}</h3><p>${x.p}</p></article>`).join('')}</div>`, 'section--tint', 'outcomes-s', 'outcomes')}
${section(`${head('', c.pipeline.title, c.pipeline.intro, 'pipeline-title')}${pipeline(c, 'pipeline-home')}`, '', 'pipeline-s', 'pipeline-title')}
${section(`${head(h.ba.eyebrow, h.ba.title, h.ba.intro, 'ba')}${explorer(c, 'quotes')}<div class="btn-row">${btn(c, c.sub.quotes.t, href(c.lang, 'quotes'), '')}${btn(c, c.sub.inbox.t, href(c.lang, 'inbox'), '')}</div>`, '', 'example', 'ba')}
${section(`<div class="split split--even"><div class="portrait" role="img" aria-label="Eran Nachum"><span>EN</span></div><div><h2>${h.founder.title}</h2><p class="lede">${h.founder.p}</p>${ticks(h.founder.signals)}${btn(c, h.founder.link, href(c.lang, 'about'), '')}</div></div>`, 'section--dark', 'founder')}
${section(`${head(h.method.eyebrow, h.method.title, h.method.intro, 'm')}<ol class="track">${h.method.steps.map((x) => `<li><h3>${x.h}</h3><p>${x.p}</p></li>`).join('')}</ol>`, '', 'how', 'm')}
${section(`${head(c.offers.eyebrow, c.offers.title, c.offers.intro, 'o')}${offerCards(c)}<div class="btn-row">${btn(c, c.nav.how, href(c.lang, 'how'), '')}</div>`, 'section--tint', 'offers', 'o')}
${section(`${head(c.calc.eyebrow, c.calc.title, c.calc.intro, 'calc')}${calculator(c)}`, '', 'calculator', 'calc')}
${section(`${head(h.safe.eyebrow, h.safe.title, '', 's')}<div class="ledger ledger--2">${h.safe.items.map((x) => `<article><h3>${x.h}</h3><p>${x.p}</p></article>`).join('')}</div><div class="btn-row">${btn(c, h.safe.link, href(c.lang, 'security'), '')}</div>`, 'section--tint', 'safe', 's')}
${section(`${head(c.check.eyebrow, c.check.title, '', 'chk')}${check(c)}`, '', 'check', 'chk')}
${section(`${head(c.faq.eyebrow, c.faq.title, '', 'f')}${faqList(c.faq.items.slice(0, 6))}<div class="btn-row">${btn(c, c.nav.faq, href(c.lang, 'faq'), '')}</div>`, 'section--tint', 'faq', 'f')}
${ctaBand(c, h.cta.title, h.cta.p)}`;
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', name: 'NACHUM.AI', description: c.descriptor, founder: { '@type': 'Person', name: 'Eran Nachum' } },
    faqLd(c.faq.items.slice(0, 6))] };
  return { meta: h.meta, body, ld };
};

function landing(k) {
  return (c) => {
    const s = c.solutions[k];
    const proc = k === 'quotes' || k === 'inbox' ? explorer(c, k) : k === 'discovery' ? matrix(c, s) : ladder(c, s);
    const others = SOLUTION_KEYS.filter((x) => x !== k);
    const body = `
<section class="hero hero--landing"><div class="container split">
  <div><nav class="crumbs" aria-label="Breadcrumb"><a href="${href(c.lang, 'home')}">${c.ui.backHome}</a> <span aria-hidden="true">/</span> ${s.eyebrow}</nav>
  <h1>${s.h1}</h1><p class="lede">${s.sub}</p>
  <div class="btn-row">${btn(c, s.cta, '#book', 'btn--primary', `data-track="cta_landing_${k}"`)}</div>
  <p class="trust-line"><strong>${c.home.hero.trust}</strong></p></div>
  <div class="hero-visual">${landingVisual(c, k)}</div>
</div></section>
${section(`<div class="split split--even"><div><h2 id="pb">${s.problem.title}</h2><p class="lede">${s.problem.p}</p></div><div class="card">${ticks(s.problem.list)}</div></div>`, 'section--tint', 'problem', 'pb')}
${section(`${head(s.process.eyebrow, s.process.title, s.process.intro, 'pr')}${proc}`, '', 'process', 'pr')}
${section(`<div class="grid g2"><div class="card"><h3>${s.bring.title}</h3>${ticks(s.bring.items)}</div><div class="card"><h3>${s.kpi.title}</h3>${ticks(s.kpi.items)}</div></div>`, 'section--dark')}
${section(`${head(c.faq.eyebrow, c.faq.title, '', 'f')}${faqList(s.faq)}`, '', 'faq', 'f')}
${section(`<div class="split split--even"><div><h2>${s.cta}</h2><p class="lede">${c.contact.lede}</p>${ticks(c.contact.next.steps)}</div>${leadForm(c, { pain: k, extras: s.form.fields, id: 'lead', title: s.form.title })}</div>`, 'section--tint', 'book')}
${section(`<h2 class="h-sm">${c.ui.otherSolutions}</h2><div class="grid g3 xnav">${others.map((o) => `<a class="card" href="${href(c.lang, o)}"><h3>${c.sub[o].t}</h3><p>${c.solutions[o].cardLine}</p><span class="go">${c.ui.learnMore}${arrow}</span></a>`).join('')}</div><div class="btn-row">${btn(c, c.ui.backHome, href(c.lang, 'home'), '')}</div>`)}`;
    return { meta: s.meta, body, ld: faqLd(s.faq) };
  };
}
SOLUTION_KEYS.forEach((k) => (pages[k] = landing(k)));

pages.how = (c) => {
  const p = c.how;
  const body = `${pageHero(c, p.h1, p.lede)}
${section(`${head('', c.pipeline.title, c.pipeline.intro, 'pipeline-title')}${pipeline(c, 'pipeline-how')}`, '', 'pipeline-s', 'pipeline-title')}
${section(p.stages.map((s, i) => `<article class="stage-row"><div class="stage-n" aria-hidden="true">${i + 1}</div><div><h2>${s.h}</h2><p class="who">${s.who}</p></div><div>${s.p.map((x) => `<p>${x}</p>`).join('')}<p class="out">${s.out}</p></div></article>`).join(''))}
${section(`<h2>${p.tableTitle}</h2><div class="table-wrap"><table class="t"><thead><tr>${p.cols.map((x) => `<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${c.offers.items.map((o, i) => `<tr><th scope="row">${o.stage}<br><strong>${o.h}</strong></th><td>${o.p}</td><td>${i === 0 ? `<strong>${o.price}</strong><br>` : ''}${duration(o.unit)}</td><td>${o.guard}</td></tr>`).join('')}</tbody></table></div><div class="notice"><strong>${c.offers.guarantee.h}.</strong> ${c.offers.guarantee.p}</div>`, 'section--tint')}
${section(`<div class="split split--even"><div><h2>${p.needTitle}</h2>${ticks(p.need)}</div><div>${btn(c, p.cta, bookUrl(c), 'btn--primary')}</div></div>`)}`;
  return { meta: p.meta, body };
};

pages.about = (c) => {
  const p = c.about;
  const body = `${pageHero(c, p.h1, p.lede)}
${section(`<div class="split split--even"><div class="portrait" role="img" aria-label="Eran Nachum"><span>EN</span></div><div class="prose">${p.story.map((x) => `<p>${x}</p>`).join('')}</div></div>`)}
${section(`<h2>${p.sigTitle}</h2><div class="grid g4">${p.sigs.map((x) => `<article class="card"><h3>${x.h}</h3><p>${x.p}</p></article>`).join('')}</div>`, 'section--tint')}
${section(`<div class="split split--even"><div><h2>${p.princTitle}</h2>${ticks(p.princ)}</div><div>${btn(c, p.cta, bookUrl(c), 'btn--primary')}</div></div>`)}`;
  return { meta: p.meta, body };
};

pages.results = (c) => {
  const p = c.results;
  const body = `${pageHero(c, p.h1, p.lede)}
${section(`<h2>${p.scoreTitle}</h2><div class="table-wrap"><table class="t"><thead><tr>${p.cols.map((x) => `<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${p.rows.map((r) => `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>`)}
${section(`<div class="grid g2"><div class="card"><h3>${p.gatesTitle}</h3>${ticks(p.gates)}</div><div><div class="card"><h3>${p.monthly.h}</h3><p>${p.monthly.p}</p></div><div class="notice"><strong>${p.honest.h}.</strong> ${p.honest.p}</div></div></div><div class="btn-row">${btn(c, p.cta, bookUrl(c), 'btn--primary')}</div>`, 'section--tint')}`;
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
  return layout({ c, key: 'home', meta: { title: c.notFound.h + ' — NACHUM.AI', desc: c.notFound.p }, body, ctx: { ...ctx, noindex: true } });
}

export function renderPage(c, key, ctx) {
  const { meta, body, ld } = pages[key](c);
  return layout({ c, key, meta, body, ctx: { ...ctx, noindex: key === 'privacy' && ctx.draftNoindex }, ld });
}
export { routes };
