# Wave 1 paid ads: accounting firms, import & distribution

Everything here is created **paused**. Nothing spends money until you review it and switch it on in each platform.

| File | What it is |
|---|---|
| `google-ads-editor.csv` | Three Google Search campaigns (accounting, distribution, AI for business): ad group, keywords, negative keywords, one responsive search ad each. `google-ads-editor-business.csv` is the AI for business campaign alone, for importing it without re-adding the other two campaigns' ads |
| `meta-manual-setup.md` | Every field of the 12 Meta ads, to create them by hand in Ads Manager (new ad accounts can't publish imported ads) |
| `meta-upload/` | **What you import into Meta**: `meta-ads-import.csv` plus the 12 square banners it names (Meta matches them by file name). Built by `make-ad-files.mjs` from Meta's own template (`scripts/meta-import-columns.json`) |
| `meta-ads-import.csv` | Three Facebook/Instagram traffic campaigns (accounting, distribution, AI for business), four ads each: the landing-page headline and three hooks |
| `images/` | Hebrew banners for six domains (accounting, distribution, AI for business, insurance, law, real-estate): `{domain}-{angle}-{size}.png`. Angles: `headline` (the page's question, on sage) and `hook-{id}` (one sharp line, on dark). Sizes: `square` 1080×1080 and `portrait` 1080×1350 (Facebook/Instagram feed), `wide` 1200×627 (LinkedIn, Facebook link ads). No photos of people. |

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
- Assets: sitelinks (איך זה עובד, שאלות נפוצות, שיחה של 30 דקות), callouts (בלי אנשי מכירות, מחיר קבוע לאבחון, סודיות מובנית).
- Max CPC bid limit (under the Maximize clicks bid strategy): start around ₪8 and adjust after a week.
- Conversion goal: the imported `generate_lead`.
- Budget: the file sets ₪100/day per campaign. Change it if you want.

Then switch the campaigns on.

## Facebook and Instagram (Meta)

**Before importing**
1. A **bee & co. Facebook Page** (ads always run from a Page). Use `brand/logo-300.png`. Connect an Instagram account if you have one; otherwise Meta uses the Page.
2. **Meta Business Suite → Ads Manager** account, billing in ILS.

> **A new ad account can't publish bulk-imported ads** (Meta error #3738001, "after several weeks of running ads"). The import works as a draft, but it can't go live. Create the campaigns with **Create** instead, using the field-by-field sheet `meta-manual-setup.md`. The import steps below stay for an account with history.

**Import**
1. Ads Manager → **⋯ (More) → Import ads in bulk**.
2. **Images** tab → choose all 12 `.png` files in `meta-upload/` (select them together). Wait until they finish uploading.
3. **File** tab → "Text or Excel file" → choose `meta-upload/meta-ads-import.csv` → **Import**. Meta shows a preview with any errors before anything is created; everything arrives paused, with the image attached.
4. If a column is rejected, the template is `AdsManagerTemplate_v2.3` (Import dialog → Download template): the values in the CSV follow it (objective `Traffic`, creative type `Page post ad`, Page ID in `Link object ID`, names up to 35 characters).

**Set by hand after import**
- **Images:** the import attaches `images/{domain}-{angle}-square.png` to each ad. To use the 4:5 portrait on Instagram, edit the ad → Placements → customize assets, and add `-portrait.png` for Instagram feed.
- **Detailed targeting** (ad set): Israel, age 30–65, and interests or job titles such as accounting, certified public accountant, bookkeeping (accounting); wholesale, import, logistics, ERP, small business owner (distribution); business owner, CEO, COO, managing director, small and medium business (AI for business, which lands on the home page). Keep "Advantage+ audience" off for the first two weeks.
- **Placements:** Facebook and Instagram feeds only to start; turn off Audience Network and Messenger.
- **Optimization:** link clicks, and keep it there for now. The Meta pixel (dataset `928177403595090`, `META_PIXEL_ID` in Vercel) is live behind the consent banner and reports `PageView` and `Lead`, but only for visitors who accept it, so landing page views or Lead would under-count and starve the learning. Judge Meta by the lead sheet and GA, not Meta's own conversion numbers. Switch to the `Lead` conversion only if Meta reports roughly 50 leads a week, which at this budget it won't.
- **Copy and images are generated from `scripts/ad-copy.mjs`**, the same source as the banners, so changing a hook means re-running `node scripts/make-ad-files.mjs` and `node scripts/make-ad-images.mjs` and re-uploading that ad's image.
- Budget: ₪30/day for the accounting, distribution and law ad sets and ₪60/day for AI business. Law (wave 2, `law-w2`) is a 2-week test from 2026-11-22: see `review-segments-2026-11-22.md`. Set in the ad sets and in `scripts/make-ad-files.mjs`.

| Setting | Value |
|---|---|
| Campaign objective | Traffic |
| Buying type | Auction |
| Countries | IL |
| Call to action | Learn more |
| Display link | beenco.tech |
| Links | `https://beenco.tech/for/{accounting,distribution}` or `https://beenco.tech/` (AI for business), plus `?utm_source=facebook&utm_medium=paid&utm_campaign={domain}-w1&utm_content={angle}` |

## Tracking

Every ad link carries `utm_source` / `utm_medium` / `utm_campaign`, so each lead email and GA report shows which channel and domain it came from. Google adds its own click ID automatically.

## Weekly review (Sunday, 20 minutes)
- Google: search terms report → add irrelevant searches as negative keywords.
- Per campaign: clicks, cost, `generate_lead`, calls booked in the calendar.
- Many clicks and no leads → change the page or situations. Few clicks → widen keywords or targeting.
- After four weeks, move budget to the channel and domain with the lowest cost per booked call.
