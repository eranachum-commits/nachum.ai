# NACHUM.AI — bilingual site (HE/EN)

Fresh implementation per `NACHUM_AI_CLAUDE_PROJECT_README.md` (v6.1). Hebrew (RTL) at `/`, English (LTR) at `/en`.
12 routes × 2 languages = 24 pages: home, 4 pain-specific landing pages, how-it-works, about, results/measurement, FAQ, data & security, contact/booking, privacy (draft).

## Run

```bash
cp .env.example .env        # optional; defaults work for local dev
npm start                   # builds, then serves http://localhost:3000
npm test                    # build + 15 smoke checks (routes, i18n parity, links, hreflang, calculator, lead API)
```

Requires Node ≥ 20. **No dependencies, no `npm install`.**
`SITE_URL=https://your-domain npm run build` sets canonical/hreflang/sitemap URLs (the domain is NOT assumed owned).

## Stack (and why)
- **Zero-dependency Node static generator + tiny Node server.** Simplest reliable thing for a 24-page marketing site: no framework upgrades to maintain, <1s builds, clean checkout runs anywhere.
- Content is plain data in `src/content/{he,en}.mjs` (a test enforces identical structure); templates in `src/lib/render.mjs`; one CSS file with design tokens and logical properties (RTL/LTR from the same rules).
- Client JS (`public/js/app.js`, ~250 lines, ES module) is progressive: pages read fine without it; tools, menus and the form need it.
- Font (IBM Plex Sans Hebrew 400/500/700, Hebrew+Latin subsets) is **self-hosted** — no third-party request before consent.
- If you later want a CMS or Next.js, content/data are already separated from markup.

## Layout
```
build.mjs  server.mjs        build + server (lead API, security headers, rate limit)
src/content/he.mjs en.mjs    ALL copy (flags: pricing, guarantee, legal = DRAFT)
src/lib/render.mjs routes.mjs  templates, route registry
src/styles.css               design system
public/js/app.js calc.js     interactions; calc.js is shared with tests
docs/                        APPROVALS.md (what needs your decision) · LAUNCH.md (checklist, integrations, gaps)
```

## Lead capture
`POST /api/leads` validates server-side (required fields, email, consent, length caps), has a honeypot and a per-IP limit.
- `LEAD_ADAPTER=dev` (default): appends to `data/leads.jsonl`; the UI says plainly **"Development mode: request NOT delivered"**.
- `LEAD_ADAPTER=webhook` + `LEAD_WEBHOOK_URL` (+ optional `LEAD_WEBHOOK_SECRET`, `BOOKING_URL`): forwards JSON to your CRM/Make/Zapier/n8n. Success is shown only after the webhook returns 2xx.
No fake success states anywhere: network failure shows an error and nothing is claimed as sent.
