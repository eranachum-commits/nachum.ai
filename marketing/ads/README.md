# Wave 1 paid ads: accounting firms, import & distribution

Everything here is created **paused**. Nothing spends money until you review it and switch it on in each platform.

| File | What it is |
|---|---|
| `google-ads-editor.csv` | Two Google Search campaigns (one per domain): ad group, keywords, negative keywords, one responsive search ad each |
| `meta-ads-import.csv` | Two Facebook/Instagram traffic campaigns, four ads each: the landing-page headline and three hooks |
| `images/` | Hebrew banners for five domains (accounting, distribution, insurance, law, real-estate): `{domain}-{angle}-{size}.png`. Angles: `headline` (the page's question, on sage) and `hook-{id}` (one sharp line, on dark). Sizes: `square` 1080×1080 and `portrait` 1080×1350 (Facebook/Instagram feed), `wide` 1200×627 (LinkedIn, Facebook link ads). No photos of people. |

| `search-images/` | Text-free brand images for Google Search image assets (square 1200×1200, landscape 1200×628, sage and night). Add them with the business name and `brand/logo-300.png` after Google's advertiser verification: until then Google rejects all three on a new account. Regenerate: `node scripts/make-search-images.mjs`. |

The hooks live in `scripts/ad-copy.mjs`. Regenerate after changing copy: `node scripts/make-ad-files.mjs` (checks Google's 30/90-character limits) and `node scripts/make-ad-images.mjs`.

## Google Ads

**Before importing**
1. Google Ads account in Expert mode, billing in ILS.
2. GA4 → Admin → Google Ads links → link the account.
3. Google Ads → Goals → Conversions → Import → Google Analytics 4 → `generate_lead` as **primary** (appears in GA after the first delivered lead).

**Import**
1. Install **Google Ads Editor** (free, business.google.com/en-all/ad-tools/google-ads-editor/) and download the account (913-227-0780).
2. Open the account window, then ☰ → **Import → From file…** → `google-ads-editor.csv` (importing from the account list greys the account out). Review the proposed changes, then **Keep**.
3. **Post** the changes to the account.

**Set by hand after import** (Editor can't take these reliably from a file)
- Languages: Hebrew and English.
- Location option: "Presence: people in or regularly in your targeted locations".
- Ad schedule: Sun–Thu 07:00–22:00 and Fri 08:00–13:00 (owners search outside office hours); trim with data from weeks 3–4.
- Assets: sitelinks (איך זה עובד, שאלות נפוצות, שיחה של 30 דקות), callouts (בלי אנשי מכירות, מחיר קבוע לספרינט, סודיות מובנית).
- Max CPC bid limit (under the Maximize clicks bid strategy): start around ₪8 and adjust after a week.
- Conversion goal: the imported `generate_lead`.
- Budget: the file sets ₪100/day per campaign. Change it if you want.

Then switch the campaigns on.

## Facebook and Instagram (Meta)

**Before importing**
1. A **bee & co. Facebook Page** (ads always run from a Page). Use `brand/logo-300.png`. Connect an Instagram account if you have one; otherwise Meta uses the Page.
2. **Meta Business Suite → Ads Manager** account, billing in ILS.

**Import**
1. Ads Manager → **⋯ (More) → Import ads in bulk** → choose `meta-ads-import.csv`.
2. Meta shows a preview with any errors before anything is created. If it rejects a column, export one manually created ad as a template (**Export → Selected**) and copy the rows across: the values are below.

**Set by hand after import**
- **Images:** each ad is named `{domain} – {angle}`. Upload `images/{domain}-{angle}-square.png` for Facebook feed and `-portrait.png` for Instagram feed (Meta lets you set one image per placement). Example: ad `accounting – hook-studied` → `accounting-hook-studied-square.png`.
- **Detailed targeting** (ad set): Israel, age 30–65, and interests or job titles such as accounting, certified public accountant, bookkeeping (accounting) and wholesale, import, logistics, ERP, small business owner (distribution). Keep "Advantage+ audience" off for the first two weeks.
- **Placements:** Facebook and Instagram feeds only to start; turn off Audience Network and Messenger.
- **Optimization:** link clicks. Once the Meta pixel is on the site (behind the consent banner, like GA), switch to landing page views, then to the lead conversion.
- Budget: the file sets ₪60/day per ad set.

| Setting | Value |
|---|---|
| Campaign objective | Traffic |
| Buying type | Auction |
| Countries | IL |
| Call to action | Learn more |
| Display link | beenco.tech |
| Links | `https://beenco.tech/for/{accounting,distribution}?utm_source=facebook&utm_medium=paid&utm_campaign={domain}-w1` |

## Tracking

Every ad link carries `utm_source` / `utm_medium` / `utm_campaign`, so each lead email and GA report shows which channel and domain it came from. Google adds its own click ID automatically.

## Weekly review (Sunday, 20 minutes)
- Google: search terms report → add irrelevant searches as negative keywords.
- Per campaign: clicks, cost, `generate_lead`, calls booked in the calendar.
- Many clicks and no leads → change the page or situations. Few clicks → widen keywords or targeting.
- After four weeks, move budget to the channel and domain with the lowest cost per booked call.
