# NACHUM.AI website — implementation record

What has been built so far, how it fits together, and what is still open.
Last updated: 2026-11-15 (commit `a464eaa`, live at https://nachum-ai.vercel.app).

Related documents: [`README.md`](../README.md) (how to run), [`APPROVALS.md`](APPROVALS.md) (decisions waiting on the founder), [`LAUNCH.md`](LAUNCH.md) (launch checklist).

---

## 1. What the site is

A bilingual marketing site for NACHUM.AI, a boutique AI-solutions partner for established companies, led by a senior technology executive. The primary goal of every page is to book a free working session.

- **Hebrew (RTL)** at `/`, **English (LTR)** at `/en`. Every page exists in both languages with the same structure; a test enforces parity.
- **12 routes × 2 languages = 24 pages:** home, four solution landing pages (quotes and orders, customer inbox, opportunity discovery, AI adoption), how it works, about, results and measurement, FAQ, data and security, contact/booking, privacy (draft, `noindex`).

## 2. Stack and structure

Zero runtime dependencies. No framework, no `npm install`.

| Path | Role |
|---|---|
| `build.mjs` | Static generator: renders every route in both languages into `dist/`, plus sitemap, robots and 404 pages |
| `server.mjs` | Local server: static files, security headers, and the lead API (`POST /api/leads`) |
| `api/leads.mjs` | Vercel serverless entry for the lead API; reuses the handler exported from `server.mjs` |
| `src/content/he.mjs`, `en.mjs` | All copy, as plain data |
| `src/lib/render.mjs` | Page templates and components |
| `src/lib/routes.mjs` | Route registry |
| `src/styles.css` | The whole design system (tokens, components, diagrams, motion) |
| `src/fonts.css` | Self-hosted font faces |
| `public/js/app.js` | Progressive enhancement: menus, tools, form, consent, motion triggers |
| `public/js/calc.js` | Capacity calculator logic (shared with tests) |
| `tests/smoke.mjs` | 15 checks: routes, HE/EN parity, links, hreflang, calculator, lead API, headers |
| `vercel.json` | Vercel build, output and headers |

Commands: `npm start` (build + serve on :3000), `npm test` (build + smoke tests), `npm run build`.

## 3. Design system (current)

The current look is a **boutique pastel** direction, aligned to the colour map of the founder's "AI-Native Engineering" deck.

### Colour

Tokens live in `:root` in `src/styles.css`.

| Token | Value | Use |
|---|---|---|
| `--ink` / `--night` | `#132238` | Text; dark bands (founder, footer, calculator results, free offer) |
| `--paper` | `#fbfcfe` | Page background |
| `--paper-2` | `#eef3fa` | Ice wash: alternating bands |
| `--peri` | `#e4ebfd` | Periwinkle wash: hero |
| `--ink-2` / `--muted` | `#4a5b73` / `#5b6a80` | Secondary and muted text |
| `--rule` / `--field` | `#d3dce8` / `#7c8aa0` | Hairlines / form-control borders |
| `--accent` / `--accent-deep` | `#2563eb` / `#1e3a8a` | The AI and actions / blue text on washes |
| `--human` / `--human-tint` | `#b45309` / `#fff4e8` | The human decision: approval stamp, human checkpoints |

The colours carry meaning consistently: **blue = the AI working, apricot/amber = a person deciding, grey = manual work or systems.**

### Type

One family, **IBM Plex Sans Hebrew** (Hebrew + Latin), self-hosted in weights 300, 400, 500 and 600. Display headings use Light 300 for a sharp, elegant feel; headings 500; body 400. (The deck uses Inter, which has no Hebrew.)

### Shape and layout

- Pill buttons and controls; 16px radius on documents, tools and cards.
- Ruled "ledger" columns instead of identical boxed cards for groups that are not sequences.
- Section labels above headings were removed; the hero keeps one positioning line ("Senior business & technology partner").

## 4. Messaging

- Hero headline names AI solutions explicitly:
  - EN: "AI solutions that do real work inside your business."
  - HE: "פתרונות AI שעושים עבודה אמיתית בתוך העסק שלכם."
- Page titles and the footer line position NACHUM.AI as a hands-on AI-solutions partner.
- Stage 1 of the four-stage path is **Observe / מתבוננים** (previously See / רואים). The stages are Observe → Prove → Embed → Expand.

## 5. Signature components and diagrams

| Component | Where | What it shows |
|---|---|---|
| Hero work order + approval stamp | Home and quotes landing | A quote request moving through three stages, joined by a dashed connector; an "Approved / מאושר" stamp lands on the human checkpoint once it is in view |
| Before/after explorer + timeline | Home, quotes and inbox landings | Steps toggle between manual and AI-assisted; a timeline diagram compares both runs as segmented bars (grey manual, blue AI, apricot human), e.g. 34 min vs 8 min (illustrative) |
| Method track | Home | Observe → Prove → Embed → Expand as numbered circles with flowing connectors (horizontal on desktop, vertical on phones) |
| Offers as standing bars | Home | Stage 1 emphasised in navy with "Free" and the booking button; stages 2–4 rise as bars on a shared baseline and show duration only, no prices |
| How-it-works stage rail | How it works | Stage rows joined by a vertical connector; the stages table shows a Duration column instead of prices |
| Prioritisation matrix | Opportunity discovery | Impact × feasibility quadrants with a tinted "quick wins" corner, plus a hidden text list for screen readers |
| Capacity calculator | Home | Scenario calculator for freed hours (illustrative, not a promise) |
| Two-minute check | Home | Eight-question quiz pointing to the right starting solution |

## 6. Motion

- **One page-load moment:** the approval stamp lands on the hero work order when it scrolls into view.
- **Diagram flow:** connectors play three slow cycles (under 5 seconds) when a diagram enters the viewport, then rest.
- **Responsive motion only after a click:** menus and FAQ answers drop in; the explorer's new times fade in top to bottom; ladder panels fade.
- Timing tokens: `--t-fast` .15s, `--t-med` .22s, `--t-slow` .5s, one easing curve.
- Everything is disabled under `prefers-reduced-motion: reduce`.

## 7. Accessibility (WCAG 2.1 AA)

Reviewed twice by automated audits and fixed. Current state:

- Text contrast ≥ 4.5:1 everywhere (lowest ≈ 4.6:1, muted text on periwinkle); control borders ≥ 3:1; light focus ring on navy surfaces.
- One `h1` per page, no skipped heading levels, landmarks on every page, skip link, mobile menu is a `<nav>`.
- Keyboard: Escape closes the Solutions menu and returns focus; the menu closes when focus leaves it; adoption tabs use arrow keys and reverse correctly in Hebrew.
- No horizontal scroll at 320px.
- The timeline marks the active row by label weight and colour, not opacity; manual segments are outlined.
- Moving content stops within 5 seconds (WCAG 2.2.2).
- Not yet tested with a real screen reader (VoiceOver/NVDA).

## 8. Prices

Removed so far:
- Offers section on the home page (now durations only).
- FAQ: "What does a Sprint cost?" became "How is a Proof of Value Sprint priced?" (by scope, written proposal, 10–15 working days, 50/50 payment).
- Call-to-action band under the FAQ and home page.
- How-it-works stages table, its price note and its search description.

Still present:
- Footer note on every page: "Prices are indicative and subject to a written proposal."
- Contact/booking forms: price note under the form and the budget options (₪18–28K).
- Price data in `offers.items[].price` (used only for "Free" on stage 1).

## 9. Hosting and deployment

- **Vercel project:** `nachum-ai` (account `eranachum`), connected to GitHub `eranachum-commits/nachum.ai`.
- **Every push to `main` deploys to production** at https://nachum-ai.vercel.app (build ≈ 10 seconds). Pull requests get preview deployments.
- `vercel.json`: build `node build.mjs`, output `dist/`, clean URLs, security headers (CSP, frame, referrer, permissions, nosniff), long cache on fonts and SVGs.
- Canonical, hreflang and sitemap URLs use the Vercel production URL unless `SITE_URL` is set.
- **Search engines are blocked on Vercel** (`robots.txt: Disallow: /`) until `ALLOW_INDEXING=1` is set, because prices, legal pages and the domain are still drafts.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `SITE_URL` | Vercel production URL, else `http://localhost:3000` | Canonical/hreflang/sitemap origin |
| `ALLOW_INDEXING` | unset | Set to `1` on Vercel to let search engines index the site |
| `LEAD_ADAPTER` | `dev` | `dev` stores locally (on Vercel: ephemeral `/tmp`) and tells the visitor the request was not delivered; `webhook` sends leads to `LEAD_WEBHOOK_URL` |
| `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_SECRET` | unset | CRM / automation endpoint for leads |
| `BOOKING_URL` | unset | Scheduling link shown after a successful submission |

## 10. History

| Commit | Change |
|---|---|
| `3427012` | Initial bilingual site |
| `6885c4d` | First redesign: "approval stamp" identity (form paper, violet stamp ink) |
| `08f3f7c` | Motion polish and accessibility fixes from review |
| `5fbd116` | Screen-reader text alternative for the prioritisation matrix |
| `dc19163` | Pastel redesign aligned to the deck palette, soft diagrams, offers as standing bars, Observe rename, Vercel setup |
| `8fd874f` | First Vercel production deploy |
| `a464eaa` | Prices removed from the FAQ and how-it-works |

Process used for the redesigns: the `frontend-design` skill for direction, `design-critique` and `accessibility-review` passes, and two parallel review agents (design critic, WCAG auditor) whose findings were applied.

## 11. Proposed, not built

- **Before/after AI pipeline diagram:** a generic "request to reply" flowchart whose boxes morph from the manual version (five hand steps, three people, a rework loop) into the AI version (one AI agent connected to the price list and ERP, one human checkpoint for exceptions). Sketched as a prototype in the working session; a candidate for the home page or the how-it-works page.

## 12. Open items

- Prices still in the footer note and the contact forms (see section 8).
- Lead delivery: set `LEAD_ADAPTER=webhook` and a webhook URL in Vercel to receive real leads.
- Indexing: set `ALLOW_INDEXING=1` after launch approvals.
- Domain: connect `nachum.ai` in Vercel once ownership is confirmed, then set `SITE_URL`.
- Founder photo (currently an "EN" monogram placeholder) and final logo.
- Screen-reader testing with VoiceOver and NVDA.
- The offers intro sentence still says "Prices are indicative starting points"; it was kept unchanged on request.
- Everything listed in [`APPROVALS.md`](APPROVALS.md).
