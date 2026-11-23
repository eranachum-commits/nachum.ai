# bee & co. website — implementation record

What has been built so far, how it fits together, and what is still open.
Last updated: 2026-11-15 (bee & co. brand-system redesign in progress locally).

Related documents: [`README.md`](../README.md) (how to run), [`APPROVALS.md`](APPROVALS.md) (decisions waiting on the founder), [`LAUNCH.md`](LAUNCH.md) (launch checklist).

---

## 1. What the site is

A bilingual marketing site for bee & co., a boutique AI-solutions partner for established companies, led by a senior technology executive. The primary goal of every page is to book a free working session.

- **Hebrew (RTL)** at `/`, **English (LTR)** at `/en`. Every page exists in both languages with the same structure; a test enforces parity.
- **9 routes × 2 languages = 18 pages:** home, a generic use case (one recurring request from inbox to reply; it replaced the four solution pages, whose old addresses redirect to it), how it works, about, results and measurement, FAQ, data and security, contact/booking, privacy (draft, `noindex`).

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

The current look is **Quiet Authority**: a premium editorial consultancy system built around the bee & co. identity. It uses a connected lowercase-`b` mark, warm natural colour, restrained faceted-cell geometry, evidence-led diagrams and generous whitespace.

### Colour

Tokens live in `:root` in `src/styles.css`.

| Token | Value | Use |
|---|---|---|
| `--ink` / `--night` | `#202820` / `#25212a` | Botanical text; founder, CTA, footer and results bands |
| `--paper` / `--sheet` | `#f5f0e6` / `#fffdf8` | Warm page and document surfaces |
| `--paper-2` / `--peri` | `#e7ece3` / `#dce4d8` | Sage section and hero washes |
| `--ink-2` / `--muted` | `#465247` / `#596459` | Secondary and muted copy |
| `--rule` / `--field` | `#c6c9be` / `#6f796e` | Editorial hairlines and accessible controls |
| `--pollen` / `--accent` | `#e8ad36` / `#6b550b` | Proven-value signal and accessible accent text |
| `--human` / `--human-tint` | `#92520b` / `#f5dfcf` | Human checkpoints and approval moments |

The colours carry meaning consistently: **sage = systems and process, pollen = proven value or a decision, peach = a human checkpoint, lavender = supporting context.**

### Type

English display headings use an editorial serif stack; Hebrew headings, body copy, diagrams and controls use self-hosted **IBM Plex Sans Hebrew**. The two scripts share scale, spacing and hierarchy without forcing the same letterform style.

### Shape and layout

- Squared editorial controls, ruled content groups and minimal shadows.
- Connected-`b` wordmark; faceted cells are used sparingly as structural brand punctuation.
- Asymmetric heroes, serif-led English headlines and mirrored RTL compositions.
- Forms remain bounded for usability; informational cards become open, ruled layouts.

## 4. Messaging

**Update 2026-11-22 (business-first repositioning, supersedes the hero and home order below):** headline "Your business can work smarter." / "העסק שלכם יכול לעבוד חכם יותר.", delivery model is founder-led leadership plus specialists engaged per project (never a claimed permanent team). Home order: hero (+ situation picker) → five business problems → a link to the examples page (`/examples`: four *illustrative* before/after scenarios, one with a labelled worked calculation: 1,200 orders, 8→3 min, ~100 h, ≈₪11,000 capacity value at an assumed ₪110/h, explicitly not a client result and not cash savings) → how we work (4 steps) + who does what → three service families (Advisory = Decide, AI solutions & implementation = Build, Continuous improvement & transformation = Lead; "Decision Sprint" stays the named first step) → why bee & co. (three pillars + risk-reduction list) → four kinds of value (time saved / capacity released / financial savings / growth) → conversation. The only currency figure allowed on the site is on the examples page (`.home-examples`) (guarded in `tests/smoke.mjs`). About no longer says Eran builds everything himself; it has the "leads personally / specialists as required" lists (`about.co`). Results page adds the four kinds of value and metrics by category.

Earlier home redesign (2026-11-17), kept for history:

Home redesign (2026-11-17): **one accountable partner for end-to-end AI transformation**, made credible by a senior technology executive who still builds.

- Hero: EN "One partner. End-to-end AI transformation." / HE "שותף אחד. מהאתגר העסקי ועד AI שעובד." (adapted, not translated).
- Home order: hero (promise + "Which of these sounds like your business?" picker: four situations, each showing what is usually going on and where we would start; its action opens the contact form with `?pain=` and the situation pre-filled via `?q=`) → five services → why bee & co. (three pillars) → outcomes → conversation. No founder section on home (Eran is named in the hero trust line; the About page carries his story).
- "One-stop shop" means one accountable owner, not a large in-house team: a note under the journey says specialists are selected and managed by bee & co.
- Experience is stated as on LinkedIn: over 20 years in software, Director / Head of Engineering / VP R&D since 2020, organizations of 50+. Never "20+ years of senior leadership" (a test guards this).
- Outcomes are qualitative only. No client metrics, testimonials or case studies until there is written permission.
- Banned phrases (tested on home): revolutionize, cutting-edge, next-generation, "power of AI", unlock.

### Home patterns added to the design system

| Pattern | Classes | Rules |
|---|---|---|
| Journey | `.journey`, `.jr-stage`, `.jr-gate`, `.jr-note` | On the how-it-works page (content in `how.journey`; home reads the stage names from there). Five stages in reading direction (mirrored in Hebrew), each with what you get and your decision (peach). One lavender-edged note about specialists. No lanes, no automatic animation. |
| Engagement timeline | `.run`, `.run-step`, `.run-gate` | How it works. A pollen rail (bee & co. owns every step) with the duration as the large type, what happens, what you get and the journey stages it covers; your decision is a peach diamond on the rail between steps. Mirrors in Hebrew; stacks on phones. |
| About: career line | `.career`, `.career li.now` | First-person About page. Four points (2004, 2008, 2020, Today) on one ink rule that turns pollen at bee & co.; vertical on phones. Followed by a large founder quote beside the story (`.about-quote`) and a hands-on card with tags (`.hands`). Roles only, never employer names. |
| About: experience rows | `.xp`, `.xp-row`, `.xp-link` | Three rows that read as one sentence: what I've done → a pollen hex link → what you get (set larger). Labels once above on wide screens, inside each row on phones. |
| About: why me | `.why-card`, `.why-points`, `.co-note` | A signed first-person card: night panel (title, lead, one booking action) beside three promises (decide → build → stay) on a hex line that lights up once when the list scrolls into view (`app.js` arms it only when motion is allowed). Under it, an open "& co." strip with the name set large. No photo. |
| Service row | `.svc-list`, `.svc`, `.svc-cover` | Ruled rows, not cards. Each row shows the journey stages it covers as five hexes plus the stage names in text. Stage indexes live in content (`services.items[].stages`). |
| Pillar | `.pillars`, `.pillar`, `.pillar-not` | Dark band. Each pillar ends with a "Not:" contrast line that names what a typical provider does. |
| Outcomes | `.outcomes` | Ruled auto-fit grid, title + one line each, then a link to the measurement method. |

## 5. Signature components and diagrams

| Component | Where | What it shows |
|---|---|---|
| Brand hero + connected cells | Home | Business-outcome headline, proof-led positioning and a restrained Discover-to-Scale signal |
| Use case page (CEO lens) | `/business-use-case`, linked from the main menu | A CEO's line of thought: pain picker (five CEO pains as tabs; each lights the step of a five-step lane where it hides, then what we change and the number that proves it) → decision path (four stages, "your call" between them, durations only) → booking. The "Why work with Eran" comparison now lives on the About page. Replaced the four solution pages |
| Before/after AI pipeline | Not shown on any page (component kept in `pipeline()`, its styles and `pipeline` copy, for reuse) | One request moving through the business; the same boxes morph from the manual version (hand steps, rework loop) to the AI version (AI agent, live system connections, one human checkpoint) |
| Transformation flow + method track | Home | Discover → Prioritize → Design → Prove → Deploy → Scale, with a proof decision gate, refinement loop, executive flow chart and detailed list |
| Offers as standing bars | Home | Stage 1 emphasised in navy with "Free" and the booking button; stages 2–4 rise as bars on a shared baseline and show duration only, no prices |
| How-it-works stage rail | How it works | Stage rows joined by a vertical connector; the stages table shows a Duration column instead of prices |
| About page | `/about` | A CEO's questions in order: hero about the person (headline, lede, booking and three facts beside the portrait) → the story → "What 20 years of technology leadership means for your project" (five rows: experience from the bio → what it means for the client, joined by pollen arrows) → "Why work with Eran" comparison → "How we work" principles → booking |
| Results page (measuring success) | `/results` | Menu label "Measuring success". General for every kind of engagement: success is agreed in writing before the work starts. A goal-to-decision flowchart (business goal → choose the measures → set the baseline → agree the bar ◇ → do the work → cleared? ◇ → continue and report, with an "Adjust or stop" branch and a loop at every review; horizontal on desktop, vertical on phones, mirrored in Hebrew), then the rules as large statements with pollen hexes (`.rules`, `.rules-list`) and two footnotes (`.rules-notes`). No process-only KPI board, no success-agreement sheet. |
| Capacity calculator, two-minute check | Not currently rendered | Code and copy still exist (`calculator()`, `check()` in `render.mjs`), but no page shows them since the bee & co. redesign; the quiz results now point to the use case |

## 6. Motion

- **Diagram flow:** connectors play three slow cycles (under 5 seconds) when a diagram enters the viewport, then rest.
- **Responsive motion only after a click:** the mobile menu and FAQ answers drop in; the pipeline diagram morphs between its before and after states.
- Timing tokens: `--t-fast` .15s, `--t-med` .22s, `--t-slow` .5s, one easing curve.
- Everything is disabled under `prefers-reduced-motion: reduce`.

## 7. Accessibility (WCAG 2.1 AA)

Reviewed twice by automated audits and fixed. Current state:

- Text contrast ≥ 4.5:1 everywhere (lowest ≈ 4.6:1, muted text on periwinkle); control borders ≥ 3:1; light focus ring on navy surfaces.
- One `h1` per page, no skipped heading levels, landmarks on every page, skip link, mobile menu is a `<nav>`.
- Keyboard: every navigation item is a plain link (the Solutions dropdown is gone); Escape closes the mobile menu and returns focus to its button.
- No horizontal scroll at 320px.
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

- **Vercel project:** `bee-co`, connected to the production repository.
- **Every push to `main` deploys to production** at the configured production URL (build ≈ 10 seconds). Pull requests get preview deployments.
- `vercel.json`: build `node build.mjs`, output `dist/`, clean URLs, security headers (CSP, frame, referrer, permissions, nosniff), long cache on fonts and SVGs.
- Canonical, hreflang and sitemap URLs use the Vercel production URL unless `SITE_URL` is set.
- **Production is always indexable** (since 2026-11-23). Vercel preview deployments get `robots.txt: Disallow: /` unless `ALLOW_INDEXING=1`. The privacy page stays `noindex` until legal sign-off.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `SITE_URL` | Vercel production URL, else `http://localhost:3000` | Canonical/hreflang/sitemap origin |
| `ALLOW_INDEXING` | unset | Production is indexed regardless; set to `1` to also open a preview deployment to search engines |
| `LEAD_ADAPTER` | `dev` | `dev` stores locally (on Vercel: ephemeral `/tmp`) and tells the visitor the request was not delivered; `webhook` sends leads to `LEAD_WEBHOOK_URL` |
| `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_SECRET` | unset | CRM / automation endpoint for leads |

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
| `865c6e1` | This implementation record |
| `ad7316e`, `02664db` | Codex prompt for, then the interactive before/after AI pipeline diagram |
| `6c1a48a` | Redesign around the bee & co. brand |
| `9379b0b`, `1c8ef29` | Clearer AI transformation value proposition and Hebrew headline |
| `d654323` | Four solution pages replaced by one generic use case: new `/business-use-case` page and home preview; Solutions menu and footer column replaced by "Use case"; quiz results repointed; old `/solutions/...` addresses redirect (301) to the use case; unused solution code, copy and ~150 style rules removed |
| `4ce08c4` | Before/after AI diagram moved from home to the use case page, which now shows the diagram plus "Where the effort goes" (before, with AI, what it saves); use case preview removed from home; diagram also removed from how it works |
| `4a64f91` | Use case page rebuilt around CEO pains: pain picker, decision path, why-Eran comparison; before/after diagram section and its savings rows removed; reusable tab behaviour extended (vertical tabs, Home/End, works without JS) |
| `061d73a` | Results page rebuilt from scratch: measurement flowchart, worked calculation, measures with formulas, rules |
| `ca0a45b` | Results page: worked calculation removed; outcome added to the measures title and table |
| (this change) | About page rebuilt from scratch: hero beside the portrait, experience-to-client ledger, comparison, principles; the four "in practice" items folded into the ledger |
| `061d73a` | "Why work with Eran" comparison moved from the use case page to About; About relaid for reading: story beside a sticky portrait and fact list, comparison, practice in a 2×2 grid, how we work ending on the booking button; larger logo; tighter spacing between blocks |

Process used for the redesigns: the `frontend-design` skill for direction, `design-critique` and `accessibility-review` passes, and two parallel review agents (design critic, WCAG auditor) whose findings were applied.

## 11. Proposed, not built

- Nothing outstanding. The before/after AI pipeline diagram proposed earlier is now built on the home page (`02664db`).

## 12. Open items

- Prices still in the footer note and the contact forms (see section 8).
- Lead delivery: set `LEAD_ADAPTER=webhook` and a webhook URL in Vercel to receive real leads.
- Indexing: production is indexed by default (2026-11-23); submit `https://beenco.tech/sitemap.xml` in Google Search Console.
- Domain: connect the approved production domain in Vercel, then set `SITE_URL`.
- Founder photo (currently an "EN" monogram placeholder) and final logo.
- Screen-reader testing with VoiceOver and NVDA.
- The offers intro sentence still says "Prices are indicative starting points"; it was kept unchanged on request.
- Everything listed in [`APPROVALS.md`](APPROVALS.md).
