# Launch pack

## Definition-of-done status (from the brief)
| Requirement | Status |
|---|---|
| Runs from clean checkout, documented commands, builds | ✅ `npm start` / `npm test` |
| All HE + EN routes, language switch to matching page, no dead ends | ✅ tested (24 pages) |
| RTL/LTR, mixed scripts, numbers/prices isolated from bidi reordering | ✅ logical CSS; numeric runs wrapped in LTR isolates in Hebrew output |
| Semantic HTML, keyboard, labels, focus, reduced motion | ✅ implemented; **manual screen-reader pass still recommended** |
| SEO: titles, meta, canonical, hreflang, OG, sitemap, robots, FAQ/Org JSON-LD | ✅ (no `og:image` until asset exists) |
| Performance: self-hosted subsetted fonts, 1 CSS + 1 JS file, no images, long-cache fonts | ✅ |
| Calculator accurate, validated, disclaimers, reset | ✅ unit-tested |
| Form real + tested, or explicit demo mode, no fake success | ✅ dev mode is explicit; webhook mode implemented but **not tested against a live CRM** (no credentials) |
| Route / language / form / calc / menu smoke tests | ✅ `npm test` (menu & tools verified manually in browser) |

## Before going public
1. Resolve everything in `docs/APPROVALS.md`.
2. Set env: `SITE_URL`, `LEAD_ADAPTER=webhook`, `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_SECRET`, `BOOKING_URL`; send a real test lead and confirm it lands in the CRM.
3. Deploy anywhere that runs Node ≥ 20 (`npm run build && node server.mjs`) behind HTTPS (Render, Fly, Railway, a VPS + Caddy/nginx). `dist/` alone is static, but then `/api/leads` needs an equivalent function — don't ship the form without it.
4. Remove `noindex` on privacy page (in `render.mjs`, `draftNoindex`) once legal approves.
5. Analytics: load your vendor inside the consent callback in `app.js` (`set('yes')`) and map `dataLayer` events: `cta_click`, `tool_interaction`, `booking_initiated`, `booking_completed`. Optimise on offline CRM stages (qualified → session held → memo → **paid Sprint**), not page views.
6. Replace rate limiter (in-memory, per-process) with edge/WAF limiting if you run multiple instances; add CAPTCHA only if spam appears.
7. Accessibility: run axe/Lighthouse + one NVDA/VoiceOver pass on Hebrew pages.

## Known gaps / honest notes
- No real photography, logo, OG image, or case evidence yet (deliberate — see approvals).
- Hebrew copy is written natively but needs a native-speaker marketing edit before launch.
- Bottleneck check keeps answers in the browser; "docs/reporting" result has no dedicated landing page (routes to booking).
- Contact page has no email/phone shown until a professional address exists.
- 90-day GTM plan, unit-economics model and SOW templates are intentionally out of scope for the site (README §8–9).

## Rollout (README §8)
Days 1–14 ship + direct outreach with the quotes/inbox pages as links · cap free sessions at ~6/week (add a "limited availability" line only if true) · no paid ads until messaging converts.
