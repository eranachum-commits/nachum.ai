import { compute, validate, DEFAULTS } from './calc.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

/* ---------- consent-gated tracking ----------
   Events go to window.dataLayer ONLY after the visitor accepts. Connect GTM/GA/Plausible etc. at launch (docs/LAUNCH.md). */
const consent = () => store.get('nachum-consent');
export function track(name, props = {}) {
  if (consent() !== 'yes') return;
  (window.dataLayer = window.dataLayer || []).push({ event: name, lang: document.documentElement.lang, path: location.pathname, ...props });
}
(function initConsent() {
  const box = $('[data-consent]');
  if (!box) return;
  if (!consent()) box.hidden = false;
  const set = (v) => { store.set('nachum-consent', v); box.hidden = true; if (v === 'yes') track('consent_granted'); };
  $('[data-consent-yes]', box).addEventListener('click', () => set('yes'));
  $('[data-consent-no]', box).addEventListener('click', () => set('no'));
})();
document.addEventListener('click', (e) => { const a = e.target.closest('[data-track]'); if (a) track('cta_click', { id: a.dataset.track }); });

/* ---------- navigation ---------- */
(function nav() {
  const mb = $('[data-menu]'), mn = $('#mobile-nav');
  mb?.addEventListener('click', () => { const o = mn.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  const sb = $('[data-sub]'), wrap = sb?.closest('.has-sub');
  const close = () => { wrap?.classList.remove('open'); sb?.setAttribute('aria-expanded', 'false'); };
  sb?.addEventListener('click', () => { const o = wrap.classList.toggle('open'); sb.setAttribute('aria-expanded', o); });
  document.addEventListener('click', (e) => { if (wrap && !wrap.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); if (mn?.classList.contains('open')) { mn.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); mb.focus(); } } });
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
    bar.style.width = Math.round((v / tb) * 100) + '%';
  };
  $$('[data-mode-btn]', ex).forEach((b) => b.addEventListener('click', () => { set(b.dataset.modeBtn); track('tool_interaction', { tool: ex.dataset.trackId, mode: b.dataset.modeBtn }); }));
  set('before');
});

/* ---------- ladder tabs ---------- */
$$('[data-ladder]').forEach((root) => {
  const tabs = $$('[role=tab]', root);
  const sel = (i, focus) => tabs.forEach((t, j) => {
    const on = i === j;
    t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
    $('#' + t.getAttribute('aria-controls')).hidden = !on;
    if (on && focus) t.focus();
  });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { sel(i); track('tool_interaction', { tool: 'adoption_ladder', stage: i + 1 }); });
    t.addEventListener('keydown', (e) => {
      const rtl = document.documentElement.dir === 'rtl';
      const next = e.key === (rtl ? 'ArrowLeft' : 'ArrowRight'), prev = e.key === (rtl ? 'ArrowRight' : 'ArrowLeft');
      if (next) { e.preventDefault(); sel((i + 1) % tabs.length, true); }
      if (prev) { e.preventDefault(); sel((i - 1 + tabs.length) % tabs.length, true); }
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
  if (pain && params.get('pain') && pain.tagName === 'SELECT' && [...pain.options].some((o) => o.value === params.get('pain'))) pain.value = params.get('pain');
  $('[name=source]', form).value = location.pathname;
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
      if (!f.name || f.type === 'hidden' || f.name === 'website') continue;
      let msg = '';
      if (f.type === 'checkbox') { if (f.required && !f.checked) msg = D.mConsent; }
      else if (f.required && !f.value.trim()) msg = D.mRequired;
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
        const dev = body.mode !== 'webhook';
        status.className = 'form-status notice ' + (dev ? '' : 'notice--ok');
        status.innerHTML = `<strong>${dev ? D.devH : D.okH}</strong><br>${dev ? D.dev : D.okP}`;
        if (body.bookingUrl) status.insertAdjacentHTML('beforeend', `<br><a class="btn btn--primary btn--sm" style="margin-top:12px" href="${body.bookingUrl}" rel="noopener">${D.bookL}</a>`);
        if (!dev) track('booking_completed', { form: form.id, pain: data.pain });
        form.reset(); $('[name=source]', form).value = location.pathname;
        status.focus();
      } else {
        status.className = 'form-status notice notice--err'; status.textContent = D.mFail;
      }
    } catch {
      status.className = 'form-status notice notice--err'; status.textContent = D.mNet; // no connection: never claim success
    } finally { btn.disabled = false; btn.innerHTML = label; }
  });
});
