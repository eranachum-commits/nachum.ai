// Static server + lead API. Zero dependencies. Run: node server.mjs (after `node build.mjs`).
import { createServer } from 'node:http';
import { readFile, appendFile, mkdir, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.env.PORT || 3000);
const ADAPTER = process.env.LEAD_ADAPTER || 'dev';
const WEBHOOK = process.env.LEAD_WEBHOOK_URL || '';
const SECRET = process.env.LEAD_WEBHOOK_SECRET || '';
// Email delivery (LEAD_ADAPTER=email): each lead is emailed through Resend (https://resend.com) — a plain HTTPS call, no SDK.
const EMAIL_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_TO = process.env.LEAD_EMAIL_TO || '';
const EMAIL_FROM = process.env.LEAD_EMAIL_FROM || 'bee & co. website <onboarding@resend.dev>';
const EMAIL_API = process.env.RESEND_API_URL || 'https://api.resend.com/emails';
const DATA_DIR = process.env.LEAD_DATA_DIR || (process.env.VERCEL ? '/tmp/bee-co-leads' : 'data');
const DIST = join(process.cwd(), 'dist');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };
const SEC = {
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com https://googleads.g.doubleclick.net https://www.google.com https://www.google.co.il https://www.facebook.com; style-src 'self' 'unsafe-inline'; script-src 'self' https://connect.facebook.net https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net; connect-src 'self' https://www.facebook.com https://connect.facebook.net https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://pagead2.googlesyndication.com; frame-src https://td.doubleclick.net https://www.googletagmanager.com; font-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'",
};

const MISCONFIGURED = (ADAPTER === 'webhook' && !WEBHOOK) || (ADAPTER === 'email' && (!EMAIL_KEY || !EMAIL_TO));

/* ---- lead validation (server-side, authoritative) ---- */
const ROLE_MAX = 120;
// An Israeli or international phone number: 9-15 digits once spaces, dashes, dots and brackets are removed.
export const isPhone = (v) => /^\+?\d{9,15}$/.test(String(v).replace(/[\s\-().]/g, ''));
const clean = (v, max = 300) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
export function validateLead(b) {
  const errors = {};
  const lead = {
    name: clean(b.name, 120), role: clean(b.role, ROLE_MAX), company: clean(b.company, 160), size: clean(b.size, 40), pain: clean(b.pain, 40),
    detail: clean(b.detail, 1500), topic: clean(b.topic, 200), urgency: clean(b.urgency, 60), budget: clean(b.budget, 120), email: clean(b.email, 200).toLowerCase(), phone: clean(b.phone, 40),
    lang: b.lang === 'en' ? 'en' : 'he', source: clean(b.source, 200),
    extra: {},
  };
  for (const k of ['volume', 'system', 'channels', 'process', 'team', 'tools', 'stalled']) if (b[k]) lead.extra[k] = clean(b[k], 300);
  // Landing pages send a short form (name and phone, the rest optional); the contact page keeps the full form.
  lead.form = b.form === 'short' ? 'short' : 'full';
  if (lead.form === 'short') {
    if (!lead.name) errors.name = 'required';
    if (!lead.phone) errors.phone = 'required';
    else if (!isPhone(lead.phone)) errors.phone = 'phone';
  } else {
    for (const k of ['name', 'company', 'email']) if (!lead[k]) errors[k] = 'required';
    if (!lead.detail && !lead.topic) errors.detail = 'required'; // a picked situation (landing pages) can stand in for the message
  }
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) errors.email = 'email';
  if (!(b.consent === true || b.consent === 'true' || b.consent === 'on')) errors.consent = 'required';
  return { lead, errors };
}

/* ---- delivery adapters ---- */
// Plain-text email: nothing from the visitor is ever rendered as HTML.
export function leadEmail(lead) {
  const rows = [['Name', lead.name], ['Company', lead.company], ['Role', lead.role], ['Email', lead.email], ['Phone', lead.phone],
    ['Page', lead.source], ['Industry', lead.pain], ['Situation', lead.topic], ['Language', lead.lang]].filter(([, v]) => v);
  const none = lead.form === 'short' ? '(short form: call back by phone)' : '(none — situation picked above)';
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nMessage:\n${lead.detail || none}\n`;
  const subject = `New message from ${lead.name}${lead.company ? ` (${lead.company})` : ''} — bee & co.`.replace(/[\r\n]+/g, ' ');
  return { from: EMAIL_FROM, to: [EMAIL_TO], ...(lead.email ? { reply_to: lead.email } : {}), subject, text };
}

async function deliver(lead) {
  if (MISCONFIGURED) throw new Error(ADAPTER === 'email' ? 'LEAD_ADAPTER=email requires RESEND_API_KEY and LEAD_EMAIL_TO' : 'LEAD_ADAPTER=webhook requires LEAD_WEBHOOK_URL');
  if (ADAPTER === 'email') {
    const res = await fetch(EMAIL_API, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${EMAIL_KEY}` }, body: JSON.stringify(leadEmail(lead)), signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error('email ' + res.status);
    return 'email';
  }
  if (ADAPTER === 'webhook') {
    const res = await fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(SECRET ? { Authorization: `Bearer ${SECRET}` } : {}) }, body: JSON.stringify(lead), signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error('webhook ' + res.status);
    return 'webhook';
  }
  await mkdir(DATA_DIR, { recursive: true });
  await appendFile(join(DATA_DIR, 'leads.jsonl'), JSON.stringify(lead) + '\n');
  return 'dev';
}

/* ---- naive in-memory rate limit: 5 submissions / 10 min / IP ---- */
const hits = new Map();
const limited = (ip) => { const now = Date.now(); const a = (hits.get(ip) || []).filter((t) => now - t < 600000); a.push(now); hits.set(ip, a); return a.length > 5; };

const send = (res, code, body, headers = {}) => { res.writeHead(code, { ...SEC, ...headers }); res.end(body); };
export const sendJson = (res, code, o) => send(res, code, JSON.stringify(o), { 'Content-Type': 'application/json' });

async function readBody(req, max = 20000) {
  let size = 0; const chunks = [];
  for await (const ch of req) { size += ch.length; if (size > max) throw Object.assign(new Error('too large'), { code: 413 }); chunks.push(ch); }
  return Buffer.concat(chunks).toString('utf8');
}

export async function handleLead(req, res) {
  try {
    const fwd = process.env.VERCEL ? String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() : '';
    const ip = fwd || req.socket?.remoteAddress || '';
    let b; try { b = JSON.parse(await readBody(req)); } catch (e) { return sendJson(res, e.code === 413 ? 413 : 400, { ok: false, error: 'bad_request' }); }
    if (b.website) return sendJson(res, 200, { ok: true, mode: 'dev', spam: true }); // honeypot: pretend, store nothing
    const { lead, errors } = validateLead(b);
    if (Object.keys(errors).length) return sendJson(res, 400, { ok: false, errors });
    if (limited(ip)) return sendJson(res, 429, { ok: false, error: 'rate' }); // only valid submissions count
    lead.receivedAt = new Date().toISOString();
    const mode = await deliver(lead);
    sendJson(res, 200, { ok: true, mode }); // no self-booking link: Eran replies personally (removed 2026-11-23)
  } catch (e) {
    console.error('lead error', e.message);
    sendJson(res, 502, { ok: false, error: 'delivery' });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, 'http://x');
  let p = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = join(DIST, p);
  if (!file.startsWith(DIST)) return send(res, 403, 'Forbidden');
  try {
    let s = await stat(file);
    if (s.isDirectory()) { file = join(file, 'index.html'); s = await stat(file); }
    const ext = extname(file);
    const cache = ext === '.html' ? 'no-cache' : /woff2|svg/.test(ext) || file.includes('/img/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600';
    return send(res, 200, await readFile(file), { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cache });
  } catch {
    const lang = p.startsWith('/en') ? 'en' : 'he';
    return send(res, 404, await readFile(join(DIST, `404.${lang}.html`)).catch(() => 'Not found'), { 'Content-Type': 'text/html; charset=utf-8' });
  }
}

export const server = createServer((req, res) => {
  if (req.url.startsWith('/api/leads')) {
    if (req.method !== 'POST') return sendJson(res, 405, { ok: false });
    return handleLead(req, res);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  // The four solution pages, and later the examples page, were folded into the use case page (same rules as vercel.json)
  const old = /^\/(en\/)?(solutions(\/|$)|examples\/?(\?|#|$))/.exec(req.url);
  if (old) return send(res, 301, '', { Location: (old[1] ? '/en' : '') + '/business-use-case' });
  return serveStatic(req, res);
});
if (import.meta.url === `file://${process.argv[1]}`) {
  if (MISCONFIGURED) { console.error('LEAD_ADAPTER=webhook requires LEAD_WEBHOOK_URL'); process.exit(1); }
  server.listen(PORT, () => console.log(`bee & co. site on http://localhost:${PORT}  (lead adapter: ${ADAPTER})`));
}
