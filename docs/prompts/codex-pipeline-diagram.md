# Task: add the "Before AI → AI new era" pipeline diagram to the NACHUM.AI site

You are working in the repository `nachum.ai` (a zero-dependency static site generator + tiny Node server, bilingual Hebrew RTL at `/` and English LTR at `/en`). Add an interactive diagram that shows one generic business pipeline (a customer request moving to a reply) first **before AI**, then **in the AI new era**. The same eight boxes slide into new positions when the visitor toggles, so it reads as a transformation, not two separate charts.

## Ground rules (read before writing code)

- **Branch:** create a branch `feature/pipeline-diagram`. Do **not** push to `main` — every push to `main` deploys to production on Vercel. Commit on the branch only.
- **No dependencies.** No npm packages, no CDN scripts, no inline `<script>`, no `onclick=` attributes. The Content-Security-Policy is `script-src 'self'`; all behaviour goes in `public/js/app.js`. Inline `style="…"` attributes are allowed (the site already uses them for positions).
- **Where things live:**
  - Copy: `src/content/en.mjs` and `src/content/he.mjs`. A test enforces that both files have **identical structure** — every key you add to one, add to the other.
  - Markup: `src/lib/render.mjs` (template functions; see `timeline()`, `matrix()` and `offerCards()` for the style of existing diagram helpers, and `ill(c)` for the "Illustrative" chip).
  - Styles: `src/styles.css`. Use the existing tokens in `:root`; do not introduce new hex values. Use logical properties (`inset-inline-start`, `margin-inline`, etc.).
  - Client JS: `public/js/app.js` (ES module, helpers `$` and `$$` exist).
- **Run `npm test`** (builds and runs 15 smoke checks). It must pass, and you should add one check (below).
- Keep the house style: sentence case, no all-caps labels, no labels above headings, no decorative arrows on buttons.

## Placement

1. **Home page** (`pages.home` in `render.mjs`): a new section placed **directly before** the existing before/after explorer section (`id="example"`). Use the normal `section()` + `head()` helpers so spacing matches.
2. **How-it-works page** (`pages.how`): the same component, placed after the page hero and before the stage rows.

Render it through one helper, e.g. `function pipeline(c) { … }`, used in both places. Give the two instances unique ids if you need ids.

## Content (add to both content files under a new key `pipeline`)

Section heading and intro:

| key | English | Hebrew |
|---|---|---|
| `title` | One request, before and after AI | בקשה אחת, לפני ואחרי AI |
| `intro` | Toggle to see how a single request moves through the business today, and once an AI agent does the routine work and a person approves the exceptions. | החליפו תצוגה כדי לראות איך בקשה אחת עוברת בעסק היום, ואיך היא עוברת כשסוכן AI עושה את העבודה השגרתית ואדם מאשר את החריגים. |
| `toggle.before` | Before AI | לפני AI |
| `toggle.after` | AI new era | העידן החדש של AI |
| `toggleAria` | Pipeline view | תצוגת התהליך |
| `legend.person` | Manual work by a person | עבודה ידנית של עובד |
| `legend.ai` | AI | AI |
| `legend.system` | Systems and channels | מערכות וערוצים |
| `legend.rework` | Rework loop | לולאת תיקונים |
| `legend.live` | Live connection | חיבור ישיר |
| `stat.before` | Steps done by hand: 5 · People touching each request: 3 | שלבים ידניים: 5 · אנשים שנוגעים בכל בקשה: 3 |
| `stat.after` | Steps done by hand: 1 · People touching each request: 1 | שלבים ידניים: 1 · אנשים שנוגעים בכל בקשה: 1 |
| `desc.before` | Before AI: a request lands in a shared inbox, a person sorts it, looks up prices, types a draft and retypes it into the ERP; a manager reviews it, sometimes sends it back for rework, and the reply goes out days later. | לפני AI: בקשה מגיעה לתיבה משותפת, עובד ממיין אותה, מאתר מחירים, מקליד טיוטה ומקליד אותה שוב ל-ERP; מנהל בודק, לפעמים מחזיר לתיקון, והתשובה יוצאת אחרי כמה ימים. |
| `desc.after` | AI new era: an AI agent reads the request on arrival, pulls prices from the price list and syncs the ERP directly; one human checkpoint approves the exceptions, and the reply goes out the same day. | העידן החדש של AI: סוכן AI קורא את הבקשה עם ההגעה, מושך מחירים מהמחירון ומסנכרן את ה-ERP ישירות; נקודת בדיקה אנושית אחת מאשרת את החריגים, והתשובה יוצאת באותו יום. |

Nodes: an array `nodes` of eight items, in this order, each with `id`, `before: { t, s, kind }` and `after: { t, s, kind }`. `kind` is `person`, `ai` or `system` (not translated; keep identical in both files).

| id | before (EN) | before (HE) | before kind | after (EN) | after (HE) | after kind |
|---|---|---|---|---|---|---|
| `req` | Request / Email or form | בקשה / מייל או טופס | system | Request / Email or form | בקשה / מייל או טופס | system |
| `inbox` | Shared inbox / Waits in a queue | תיבה משותפת / ממתינה בתור | system | Shared inbox / Read on arrival | תיבה משותפת / נקראת עם ההגעה | system |
| `sort` | Read and sort / A person, by hand | קריאה ומיון / ידנית, על ידי עובד | person | AI agent / Reads and drafts | סוכן AI / קורא ומכין טיוטה | ai |
| `look` | Look up prices / Old quotes, sheets | איתור מחירים / הצעות ישנות וגיליונות | person | Price list / Read directly | מחירון / נקרא ישירות | system |
| `draft` | Prepare draft / Typed by hand | הכנת טיוטה / הקלדה ידנית | person | (absorbed into the AI agent: hidden) | (same) | ai |
| `erp` | Retype into ERP / Copy and paste | הקלדה חוזרת ל-ERP / העתק־הדבק | person | ERP / CRM / Synced directly | ERP / CRM / מסונכרן ישירות | system |
| `appr` | Manager review / When time allows | בדיקת מנהל / כשמתפנה זמן | person | Human checkpoint / Exceptions only | נקודת בדיקה אנושית / חריגים בלבד | person |
| `reply` | Reply sent / Days later | תשובה נשלחה / אחרי כמה ימים | system | Reply sent / Same day | תשובה נשלחה / באותו יום | system |

("Title / subtitle" — split on the slash into `t` and `s`.) For `draft.after`, use the AI agent's title with an empty subtitle and add `hidden: true`.

The whole figure is illustrative: show the existing `ill(c)` chip next to the toggle, like the other tools.

## Geometry (SVG `viewBox="0 0 680 320"`, every node 140 × 56, `rx` 12)

Node top-left positions for **LTR**:

| id | before (x, y) | after (x, y) |
|---|---|---|
| req | 25, 30 | 25, 120 |
| inbox | 185, 30 | 185, 120 |
| sort | 345, 30 | 345, 120 |
| look | 505, 30 | 185, 240 |
| draft | 505, 170 | 345, 120 (and fades out) |
| erp | 345, 170 | 345, 240 |
| appr | 185, 170 | 505, 120 |
| reply | 25, 170 | 505, 240 |

Edges for **before** (all solid arrows, `--ink-2` at 1px, with an arrowhead marker):
`165,58→183,58` · `325,58→343,58` · `485,58→503,58` · `575,86→575,168` · `505,198→487,198` · `345,198→327,198` · `185,198→167,198`, plus the **rework loop**, a dashed path `M255 226 L255 262 L560 262 L560 228` (stroke `--human`, dash `5 4`, arrowhead).

Edges for **after**:
`165,148→183,148` · `325,148→343,148` · `485,148→503,148` · `575,176→575,238` (solid), plus two **live connections** in dashed `--accent` (dash `4 3`) with arrowheads at both ends: `415,178→415,238` (AI ↔ ERP) and the path `M375 178 L375 208 L255 208 L255 238` (AI ↔ price list).

**RTL (Hebrew):** the flow must run right to left. Do not flip the SVG with CSS (that mirrors the text). In `render.mjs`, when `c.dir === 'rtl'`, mirror the geometry: node `x' = 680 − x − 140`; every edge/path x coordinate `x' = 680 − x`. Pass the mirrored positions to the client through `data-` attributes (below), so `app.js` doesn't need to know the direction.

## Markup

- `<figure class="pipeline tool" data-pipeline data-mode="before">` containing: a `.tool-head` with the toggle (`<div class="seg" role="group" aria-label="…">` with two `<button type="button" aria-pressed>`; reuse the existing `.seg` styles from the explorer) and `ill(c)`; the `<svg role="img" aria-labelledby>` with `<title>` and a `<desc>` that holds `desc.before`; the legend; the stat line.
- Each node: `<g class="pl-node pl--{kind}" data-before="x,y" data-after="x,y" data-before-t="…" data-before-s="…" data-before-kind="…" data-after-t="…" data-after-s="…" data-after-kind="…" [data-after-hidden] style="transform: translate(Xpx, Ypx)">` with a `<rect>` and two `<text>` lines (title 14px weight 500, subtitle 12px), centred with `text-anchor="middle"` and `dominant-baseline="central"` at y 20 and 38.
- Two edge groups: `<g class="pl-edges pl-edges--before">` and `<g class="pl-edges pl-edges--after">` (the after group starts at `opacity: 0`).
- Arrowhead: one `<marker>` per SVG with a unique id (two diagrams can share a page in theory), using `stroke="context-stroke"`.
- **No-JS / screen readers:** server-render the **before** state. Hide the toggle with the `hidden` attribute and let `app.js` reveal it. Always include a visually hidden (`.sr-only`) ordered list of both states (the `desc.before` and `desc.after` sentences), so the after state is never JS-only.
- Wrap numbers in the stat line as the rest of the site does (Hebrew output already passes through `isolateNumbers()`).

## Styling (`src/styles.css`, next to the other diagram styles)

- Person nodes: fill `--human-tint`, stroke `--human`, text `--human-ink`.
- AI nodes: fill `--accent-tint`, stroke `--accent`, title `--accent-deep`.
- System nodes: fill `--paper-2`, stroke `--rule-2`, title `--ink`, subtitle `--ink-2`.
- Subtitles in each kind use the same family at a slightly lighter shade, and must keep 4.5:1 contrast on their fill (check it).
- Node stroke 1px; legend swatches reuse the same three fills plus the two dashed line styles.
- Motion: `.pl-node { transition: transform .8s var(--ease-out), opacity .5s; }`; edges crossfade with `transition: opacity .35s`, the incoming group delayed by `.55s`. Add the selectors to the existing `@media (prefers-reduced-motion: reduce)` behaviour (it already kills transitions globally; just make sure nothing re-enables them). No infinite animations, no autoplay.
- Mobile: the SVG scales with `width: 100%`; below 560px make sure the 12px subtitles stay legible (raise the SVG's rendered size by letting the figure go edge to edge inside the container, or hide subtitles below 420px and keep titles).

## Behaviour (`public/js/app.js`)

For each `[data-pipeline]`:
- Remove `hidden` from the toggle group.
- On a toggle click: set `data-mode`, update `aria-pressed` on both buttons, and for every `.pl-node` set `style.transform` from `data-{mode}`, swap the two text lines and the `pl--{kind}` class from the `data-{mode}-*` attributes, and set `opacity` to 0 when `data-after-hidden` is present and the mode is `after`.
- Crossfade the edge groups (set the delay on the incoming group).
- Update the `<desc>` text and the stat line (pass the strings via `data-` attributes on the figure) and the legend's dashed-line label (`legend.rework` ↔ `legend.live`).
- Track it the same way the explorer does: `track('tool_interaction', { tool: 'pipeline', mode })`.

## Test

In `tests/smoke.mjs`, add a check that `/` and `/en` each contain `data-pipeline`, exactly 8 `.pl-node` elements per pipeline, and that the Hebrew page's `req` node has a larger before-x than the English one (proves the RTL mirroring). Keep the existing 15 checks passing.

## Done means

- `npm test` passes (16 checks).
- `npm start`, then open `http://localhost:3000/en` and `http://localhost:3000/`: the toggle animates all eight boxes into place in both languages; in Hebrew the flow runs right to left; with JavaScript disabled the before state renders and the toggle is not shown; keyboard users can tab to both toggle buttons, and the focus ring is visible.
- Commit on `feature/pipeline-diagram` with a clear message. Do not merge or push to `main`; report the branch name and a short summary of the files you changed.
