import { compute, validate, DEFAULTS } from './calc.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

/* ---------- consent-gated tracking ----------
   Nothing is sent anywhere until the visitor accepts analytics. Then Google Analytics 4 loads (if the build set an ID in
   <meta name="ga-id">), with advertising storage and ad personalization denied, and every event goes to it.
   If the build also set <meta name="ads-conversion"> (AW-…/label), a delivered lead is reported to Google Ads too, without ad cookies. */
const consent = () => store.get('bee-co-consent');
const GA_ID = document.querySelector('meta[name="ga-id"]')?.content || '';
const ADS = document.querySelector('meta[name="ads-conversion"]')?.content || '';
const ADS_ON = /^AW-\d{6,}\/[\w-]{6,}$/.test(ADS);
const META = document.querySelector('meta[name="meta-pixel"]')?.content || '';
let metaOn = false;
/* Meta pixel: loaded only after consent and only if the build set <meta name="meta-pixel">. Reports PageView and, for a delivered lead, Lead.
   Automatic advanced matching is off, so no name, email or message is ever sent. */
function loadMeta() {
  if (metaOn || !/^\d{10,20}$/.test(META)) return;
  metaOn = true;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', META, {}, { autoConfig: false });
  window.fbq('track', 'PageView');
}
let gaOn = false;
function loadGA() {
  if (gaOn || !/^G-[A-Z0-9]{4,}$/.test(GA_ID)) return;
  gaOn = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
  if (ADS_ON) window.gtag('config', ADS.split('/')[0], { send_page_view: false }); // Ads gets the lead conversion only, no page views
  const s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
  document.head.append(s);
}
export function track(name, props = {}) {
  if (consent() !== 'yes') return;
  const params = { lang: document.documentElement.lang, page_path: location.pathname, ...props };
  if (gaOn) window.gtag('event', name, { ...params, send_to: GA_ID }); // events go to GA only, never to Ads
  if (metaOn && name === 'generate_lead') window.fbq('track', 'Lead');
  if (gaOn && ADS_ON && name === 'generate_lead') window.gtag('event', 'conversion', { send_to: ADS });
  else (window.dataLayer = window.dataLayer || []).push({ event: name, ...params });
}
if (consent() === 'yes') { loadGA(); loadMeta(); }
(function initConsent() {
  const box = $('[data-consent]');
  if (!box) return;
  if (!consent()) box.hidden = false;
  const set = (v) => { store.set('bee-co-consent', v); box.hidden = true; if (v === 'yes') { loadGA(); loadMeta(); track('consent_granted'); } };
  $('[data-consent-yes]', box).addEventListener('click', () => set('yes'));
  $('[data-consent-no]', box).addEventListener('click', () => set('no'));
})();
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-track]'); if (a) track('cta_click', { id: a.dataset.track, industry: a.dataset.industry || '' });
  const b = e.target.closest('[data-booking]'); if (b) track('booking_link_click', { lead_source: b.dataset.booking || 'general' });
});

/* ---------- navigation ---------- */
(function nav() {
  const mb = $('[data-menu]'), mn = $('#mobile-nav');
  mb?.addEventListener('click', () => { const o = mn.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  const sb = $('[data-sub]'), wrap = sb?.closest('.has-sub');
  const close = () => { wrap?.classList.remove('open'); sb?.setAttribute('aria-expanded', 'false'); };
  sb?.addEventListener('click', () => { const o = wrap.classList.toggle('open'); sb.setAttribute('aria-expanded', o); });
  document.addEventListener('click', (e) => { if (wrap && !wrap.contains(e.target)) close(); });
  wrap?.addEventListener('focusout', (e) => { if (!wrap.contains(e.relatedTarget)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (wrap?.contains(document.activeElement)) sb.focus(); close(); if (mn?.classList.contains('open')) { mn.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); mb.focus(); } } });
})();

/* ---------- before/after explorer ---------- */
$$('[data-explorer]').forEach((ex) => {
  const tb = +ex.dataset.tb, ta = +ex.dataset.ta, unit = ex.dataset.unit;
  const total = $('[data-total]', ex), bar = $('[data-bar]', ex);
  const set = (mode) => {
    ex.dataset.mode = mode;
    $$('[data-mode-btn]', ex).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modeBtn === mode)));
    const v = mode === 'before' ? tb : ta;
    total.innerHTML = `<bdi>${v} ${unit}</bdi>`;
    if (bar) bar.style.width = Math.round((v / tb) * 100) + '%';
  };
  $$('[data-mode-btn]', ex).forEach((b) => b.addEventListener('click', () => { ex.dataset.touched = ''; set(b.dataset.modeBtn); track('tool_interaction', { tool: ex.dataset.trackId, mode: b.dataset.modeBtn }); }));
  set('before');
});

/* ---------- before/after pipeline ---------- */
$$('[data-pipeline]').forEach((root) => {
  const toggle = $('.seg', root), desc = $('desc', root), stat = $('[data-pl-stat]', root);
  const lineLabel = $('[data-pl-line-label]', root);
  const setStat = (value) => stat.replaceChildren(...value.split(/(\d[\d,.]*(?:[–-]\d[\d,.]*)?)/g).map((part, i) => {
    if (i % 2 === 0) return document.createTextNode(part);
    const number = document.createElement('bdi'); number.dir = 'ltr'; number.textContent = part; return number;
  }));
  toggle.hidden = false;
  const set = (mode) => {
    root.dataset.mode = mode;
    $$('[data-mode-btn]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modeBtn === mode)));
    $$('.pl-node', root).forEach((node) => {
      const [x, y] = node.dataset[mode].split(',');
      node.style.transform = `translate(${x}px, ${y}px)`;
      node.classList.remove('pl--person', 'pl--ai', 'pl--system');
      node.classList.add(`pl--${node.dataset[`${mode}Kind`]}`);
      $('.pl-title', node).textContent = node.dataset[`${mode}T`];
      $('.pl-sub', node).textContent = node.dataset[`${mode}S`];
      $('.pl-icon use', node).setAttribute('href', node.dataset[`${mode}Icon`]);
      node.style.opacity = mode === 'after' && 'afterHidden' in node.dataset ? '0' : '1';
    });
    $$('.pl-edges', root).forEach((edges) => {
      const incoming = edges.classList.contains(`pl-edges--${mode}`);
      edges.style.transitionDelay = incoming ? '.55s' : '0s';
      edges.style.opacity = incoming ? '1' : '0';
    });
    desc.textContent = root.dataset[`desc${mode[0].toUpperCase()}${mode.slice(1)}`];
    setStat(root.dataset[`stat${mode[0].toUpperCase()}${mode.slice(1)}`]);
    lineLabel.textContent = root.dataset[`line${mode[0].toUpperCase()}${mode.slice(1)}`];
  };
  $$('[data-mode-btn]', root).forEach((b) => b.addEventListener('click', () => {
    set(b.dataset.modeBtn);
    track('tool_interaction', { tool: 'pipeline', mode: b.dataset.modeBtn });
  }));
  set('before');
});

/* ---------- ladder tabs ---------- */
$$('[data-ladder]').forEach((root) => {
  const tabs = $$('[role=tab]', root);
  const vertical = root.matches('.pain-picker, [data-vertical]');
  const sel = (i, focus) => tabs.forEach((t, j) => {
    const on = i === j;
    t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
    $('#' + t.getAttribute('aria-controls')).hidden = !on;
    if (on && focus) t.focus();
  });
  // Panels are all visible in the HTML (works without JS); show one at a time once tabs are live.
  root.classList.add('is-tabs');
  // A link such as /business-use-case#s-2 opens that tab and scrolls to the picker.
  const fromHash = tabs.findIndex((t) => '#' + t.getAttribute('aria-controls') === location.hash);
  sel(fromHash >= 0 ? fromHash : Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')));
  if (fromHash >= 0) root.scrollIntoView({ block: 'start' });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { root.dataset.touched = ''; sel(i); track('tool_interaction', { tool: root.dataset.trackId || 'adoption_ladder', stage: i + 1 }); });
    t.addEventListener('keydown', (e) => {
      const rtl = document.documentElement.dir === 'rtl';
      const next = e.key === (vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight') || (vertical && e.key === (rtl ? 'ArrowLeft' : 'ArrowRight'));
      const prev = e.key === (vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft') || (vertical && e.key === (rtl ? 'ArrowRight' : 'ArrowLeft'));
      if (next || prev) { e.preventDefault(); root.dataset.touched = ''; sel((i + (next ? 1 : tabs.length - 1)) % tabs.length, true); }
      if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); root.dataset.touched = ''; sel(e.key === 'Home' ? 0 : tabs.length - 1, true); }
    });
  });
});

/* ---------- calculator ---------- */
$$('[data-calc]').forEach((root) => {
  const msgs = JSON.parse(root.dataset.errs), nf = new Intl.NumberFormat(root.dataset.lang, { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat(root.dataset.lang, { maximumFractionDigits: 1 });
  const inp = Object.fromEntries(['tasks', 'minutes', 'saved', 'rate'].map((n) => [n, $(`[name=${n}]`, root)]));
  const out = (n) => $(`[data-o=${n}]`, root);
  let touched = false;
  const run = () => {
    const v = Object.fromEntries(Object.entries(inp).map(([k, el]) => [k, el.value]));
    $('[data-saved-out]', root).textContent = v.saved + '%';
    const errs = validate(v);
    for (const k of Object.keys(inp)) {
      const bad = !!errs[k];
      inp[k].setAttribute('aria-invalid', bad);
      $(`#e-${k}`, root).textContent = bad ? msgs[k] : '';
    }
    const r = compute(v), box = $('[data-value-box]', root);
    const U = (n, u) => `<bdi>${nf1.format(n)}</bdi> ${root.dataset[u]}`;
    if (!r) { ['freed', 'base', 'days', 'extra'].forEach((k) => (out(k).textContent = '—')); box.hidden = true; return; }
    out('freed').innerHTML = U(r.freedHours, 'hours');
    out('base').innerHTML = U(r.baseHours, 'hours');
    out('days').innerHTML = U(r.workdays, 'days');
    out('extra').innerHTML = `<bdi>${nf.format(r.extraTasks)}</bdi> ${root.dataset.tasks}`;
    box.hidden = r.value == null;
    if (r.value != null) out('value').innerHTML = `<bdi>₪ ${nf.format(r.value)}</bdi>`;
    if (touched) track('tool_interaction', { tool: 'calculator' });
  };
  let t;
  Object.values(inp).forEach((el) => el.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { touched = true; run(); }, 300); if (el.type === 'range') { touched = true; run(); } }));
  $('[data-reset]', root).addEventListener('click', () => { Object.entries(DEFAULTS).forEach(([k, v]) => (inp[k].value = v)); touched = false; run(); });
  run();
});

/* ---------- two-minute bottleneck check ---------- */
$$('[data-check]').forEach((root) => {
  const D = JSON.parse($('[data-check-json]', root).textContent);
  const ui = $('[data-check-ui]', root);
  let i = 0; const ans = [];
  const el = (h) => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };
  function question() {
    const q = D.qs[i];
    const node = el(`<div><div class="progress" aria-hidden="true"><i style="width:${(i / D.qs.length) * 100}%"></i></div>
<fieldset class="quiz-q"><legend><span class="muted small" style="display:block;font-family:var(--sans);font-weight:400">${i + 1} ${D.t.of} ${D.qs.length}</span>${q.q}</legend><div class="opts">${q.o.map((o, k) => `<label><input type="radio" name="q" value="${k}" ${ans[i] === k ? 'checked' : ''}><span>${o[0]}</span></label>`).join('')}</div></fieldset>
<div class="btn-row" style="margin-top:0">${i ? `<button class="btn" type="button" data-b>${D.t.back}</button>` : ''}<button class="btn btn--primary" type="button" data-n disabled>${i === D.qs.length - 1 ? D.t.see : D.t.next}</button></div></div>`);
    const next = $('[data-n]', node);
    if (ans[i] != null) next.disabled = false;
    $$('input', node).forEach((r) => r.addEventListener('change', () => { ans[i] = +r.value; next.disabled = false; }));
    next.addEventListener('click', () => { i++; i < D.qs.length ? question() : result(); });
    $('[data-b]', node)?.addEventListener('click', () => { i--; question(); });
    ui.replaceChildren(node);
    $('input', node).focus({ preventScroll: true });
  }
  function result() {
    const tally = { orders: 0, inbox: 0, docs: 0, none: 0 }; let ready = 0;
    D.qs.forEach((q, k) => { const v = q.o[ans[k]][1]; if (typeof v === 'number') ready += v; else tally[v]++; });
    let key = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
    // readiness: questions 3-8, max 12. Below 6, or no specific pain, means "not ready yet".
    if (key === 'none' || ready < 6) key = 'notready';
    const r = D.res[key];
    ui.replaceChildren(el(`<div role="status"><div class="progress"><i style="width:100%"></i></div><h3>${r.h}</h3><p class="lede">${r.p}</p>
<div class="btn-row"><a class="btn btn--primary" href="${r.href}">${r.cta}</a><button class="btn" type="button" data-again>${D.t.again}</button></div>
<p class="small muted" style="margin-top:22px">${D.t.optional} <a href="${D.book}">→</a></p></div>`));
    $('[data-again]', ui).addEventListener('click', () => { i = 0; ans.length = 0; question(); });
    $('h3', ui).setAttribute('tabindex', '-1'); $('h3', ui).focus();
    track('tool_interaction', { tool: 'bottleneck_check', result: key });
  }
  $('[data-check-start]', ui).addEventListener('click', () => { track('tool_interaction', { tool: 'bottleneck_check', step: 'start' }); question(); });
});

/* ---------- lead form: real submission, honest states ---------- */
$$('[data-lead-form]').forEach((form) => {
  const D = form.dataset, status = $('.form-status', form), btn = $('[data-submit]', form);
  const params = new URLSearchParams(location.search);
  const pain = $('[name=pain]', form);
  if (pain && /^[a-z-]{1,40}$/.test(params.get('pain') || '')) pain.value = params.get('pain');
  // A situation picked on the home page arrives as ?q=: start the message with it so the visitor only adds detail.
  const q = (params.get('q') || '').trim(), detail = $('[name=detail]', form);
  if (q && q.length <= 200 && detail && !detail.value) detail.value = q + '\n\n';
  $('[name=source]', form).value = location.pathname + location.search;
  $('[name=ts]', form).value = Date.now();
  let started = false;
  form.addEventListener('focusin', () => { if (!started) { started = true; track('booking_initiated', { form: form.id }); } });

  const setErr = (name, msg) => {
    const f = form.elements[name]; if (!f) return;
    f.setAttribute('aria-invalid', !!msg);
    const e = $(`#${f.id}-e`, form); if (e) e.textContent = msg || '';
  };
  const check = () => {
    let first = null;
    for (const f of form.elements) {
      if (!f.name || f.type === 'hidden' || f.type === 'radio' || f.name === 'website') continue;
      let msg = '';
      if (f.type === 'checkbox') { if (f.required && !f.checked) msg = D.mConsent; }
      else if (f.required && !f.value.trim()) msg = D.mRequired;
      // Landing pages: the message is optional when a situation was picked.
      else if (f.dataset.or && !f.value.trim() && !form.querySelector(`[name=${f.dataset.or}]:checked`)) msg = D.mRequired;
      else if (f.type === 'email' && f.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim())) msg = D.mEmail;
      setErr(f.name, msg);
      if (msg && !first) first = f;
    }
    return first;
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bad = check();
    if (bad) { status.className = 'form-status notice notice--err'; status.textContent = D.mFix; bad.focus(); return; }
    const data = Object.fromEntries(new FormData(form));
    data.consent = form.elements.consent.checked;
    btn.disabled = true; const label = btn.innerHTML; btn.textContent = D.mSending;
    status.className = 'form-status'; status.textContent = '';
    try {
      const res = await fetch(form.getAttribute('action'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const body = await res.json().catch(() => ({}));
      if (res.status === 400 && body.errors) {
        Object.entries(body.errors).forEach(([k, v]) => setErr(k, v === 'email' ? D.mEmail : k === 'consent' ? D.mConsent : D.mRequired));
        status.className = 'form-status notice notice--err'; status.textContent = D.mFix;
      } else if (res.ok && body.ok) {
        const dev = body.mode === 'dev';
        status.className = 'form-status notice ' + (dev ? '' : 'notice--ok');
        status.innerHTML = `<strong>${dev ? D.devH : D.okH}</strong><br>${dev ? D.dev : D.okP}`;
        if (body.bookingUrl) status.insertAdjacentHTML('beforeend', `<br><a class="btn btn--primary btn--sm" style="margin-top:12px" href="${body.bookingUrl}" rel="noopener" data-booking="${data.pain || ''}">${D.bookL}</a>`);
        // generate_lead is GA4's recommended event for a delivered lead: mark it as a key event in GA4.
        if (!dev) { track('booking_completed', { form: form.id, pain: data.pain }); track('generate_lead', { lead_source: data.pain || 'general', form: form.id }); }
        form.reset(); $('[name=source]', form).value = location.pathname + location.search;
        status.focus();
      } else {
        status.className = 'form-status notice notice--err'; status.textContent = D.mFail;
      }
    } catch {
      status.className = 'form-status notice notice--err'; status.textContent = D.mNet; // no connection: never claim success
    } finally { btn.disabled = false; btn.innerHTML = label; }
  });
});

// Diagram connectors flow for a few cycles when they come into view, then rest (WCAG 2.2.2: under 5s).
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } }), { threshold: 0.35 });
  document.querySelectorAll('.work-order, .track:not(.track--offers)').forEach((el) => io.observe(el));
  // About: the why-me promises light up in turn. Armed only when motion is allowed; otherwise the final state shows.
  // Watches the promises list, not the whole card: on phones the card is taller than the screen.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.querySelectorAll('[data-why]').forEach((el) => {
    const list = el.querySelector('.why-points');
    el.classList.add('armed');
    const wo = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in-view'); wo.disconnect(); } }, { threshold: 0.5 });
    wo.observe(list);
  });
}

// The approval stamp lands when the work order is actually on screen (matters on phones).
{
  const st = document.querySelector('.hero .stamp');
  if (st && 'IntersectionObserver' in window) {
    st.classList.add('wait');
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { st.classList.remove('wait'); io.disconnect(); } }, { threshold: 0.9 });
    io.observe(st);
  }
}

/* ---------- decision memo: play the verdicts, and replay on request ---------- */
$$('[data-memo]').forEach((memo) => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const replay = $('[data-memo-replay]', memo);
  const play = () => { memo.removeAttribute('data-play'); void memo.offsetWidth; memo.setAttribute('data-play', ''); };
  play();
  if (replay) { replay.hidden = false; replay.addEventListener('click', () => { play(); track('tool_interaction', { tool: 'decision_memo', action: 'replay' }); }); }
});

/* ---------- landing pages: "That's us" picks the situation in the form; a sticky action on phones ---------- */
$$('[data-pick]').forEach((a) => a.addEventListener('click', (e) => {
  const r = document.getElementById('lead-t' + a.dataset.pick), form = document.getElementById('lead');
  if (!r || !form) return;
  e.preventDefault();
  r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true }));
  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  form.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  // Focus the first field only after the scroll ends: focusing mid-scroll cuts a smooth scroll short.
  const focus = () => { const n = form.elements.namedItem('name'); if (n) n.focus({ preventScroll: true }); };
  if (!smooth) focus();
  else if ('onscrollend' in window) window.addEventListener('scrollend', focus, { once: true });
  else setTimeout(focus, 1100);
}));
$$('[data-lp-sticky]').forEach((bar) => {
  if (!('IntersectionObserver' in window)) return;
  const hero = $('.hero--lp'), form = $('.lp-formsec');
  let pastHero = false, atForm = false;
  const show = () => { bar.hidden = !(pastHero && !atForm); };
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; show(); }).observe(hero);
  new IntersectionObserver(([e]) => { atForm = e.isIntersecting; show(); }).observe(form);
});
