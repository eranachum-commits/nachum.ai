# Decisions needing your approval before launch

Everything below is implemented as **cautious draft copy**. Nothing here is final.

| # | Item | Where in code | Current draft | Needed |
|---|------|---------------|---------------|--------|
| 1 | Prices (Sprint ₪18–28K, Program ₪28–45K/mo, Run ₪15–25K/mo) | `offers.items`, `home.cta`, `contact.priceNote`, FAQ | Shown as **indicative, excl. VAT**, "not a binding offer" | Founder confirms ranges and whether to publish them |
| 2 | Guarantee / waiver wording | `offers.guarantee`, FAQ "What if the Sprint does not deliver?" | "May be waived… for reasons within our control… terms in the agreement" | Legal review; never "free PoC", "guaranteed ROI", "production in 10 days" (none used) |
| 3 | Sprint → Program credit | **Not published anywhere** | omitted on purpose (100% credit not approved; 25–50% under consideration) | Unit-economics decision first |
| 4 | Privacy policy | `/privacy`, `/en/privacy` | Draft, `noindex`, visible DRAFT banner | Israeli-law review; add contact for requests |
| 5 | Data & security principles | `/data-and-security` | Draft banner | Legal/DPA review |
| 6 | Logo / identity | `.logo` wordmark + CSS mark, `favicon.svg` | Placeholder wordmark | Final identity |
| 7 | Founder photo | `.portrait` (monogram "EN") | Placeholder; no fabricated imagery | Provide/approve a photo |
| 8 | Domain | `SITE_URL` | `http://localhost:3000` | Confirm the production domain and ownership |
| 9 | Contact email / privacy contact | not present | none shown | Professional email address |
| 10 | CRM / booking / email provider | `server.mjs` adapters | dev adapter + generic webhook | Choose provider, supply credentials |
| 11 | Analytics + consent | `public/js/app.js` | Consent banner; events to `dataLayer` only after opt-in; no vendor loaded | Choose vendor; legal check of consent approach |
| 12 | Case studies / testimonials / logos | `/results` | **None.** Page explains how results are measured | Only with written client permission |
| 13 | "Who does the work" claim | FAQ, About | "Eran leads every engagement personally" | Confirm this holds as volume grows |
| 14 | OG share image | not generated | no `og:image` tag | Provide a 1200×630 PNG |

Copy that makes numeric claims (all illustrative, labelled "להמחשה בלבד"/"Illustrative"): workflow explorer times, calculator defaults, hero document example, inbox/matrix/usage samples.

## Repositioning (Nov 2026) — still open before launch

| # | Item | Where in code | Current state | Needed |
|---|------|---------------|---------------|--------|
| 15 | Founder photo | `PHOTO` in `src/lib/render.mjs`, files in `public/img/` | **Done** (Nov 2026): home founder section, About hero, Contact, memo signature | To replace it, use new file names (e.g. `-v2`): images are cached for a year |
| 16 | Contact email | `contact.direct` (content) | LinkedIn link only | A professional address to show beside the form |
| 17 | Decision Stories page | not built | — | Eran's raw notes for 2 career stories (Agora RE hotfixes −85% is the first candidate) |
| 18 | References | not shown | one 2017 peer recommendation on LinkedIn | 3–5 recommendations from former CEOs/execs (Resident, Agora RE, WalkMe) |
| 19 | LinkedIn profile | outside the site | still shows the startup role as current, "Open to work" on | End-date the startup role, add "Founder, bee & co.", new headline, turn off Open to work |
| 20 | Booking link | `BOOKING_URL` env | not set | Calendar link so the success message offers "Choose a time" |

Prices: none are published anywhere (decision 2026-11-16). Items 1 and 3 above are superseded.
