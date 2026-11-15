// Vercel serverless entry for the lead form. Reuses the same validation, honeypot,
// rate limit and delivery adapters as the local server (server.mjs), so behaviour is identical.
import { handleLead, sendJson } from '../server.mjs';

export default function leads(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { ok: false });
  return handleLead(req, res);
}
