// Builds the paid-ads import files for wave 1 (accounting firms, import & distribution) and checks platform limits.
// `node scripts/make-ad-files.mjs` → marketing/ads/google-ads-editor.csv, marketing/ads/meta-ads-import.csv
// Default output updates the live campaigns (keywords, negatives, ads). NEW_CAMPAIGNS=1 also creates the campaigns.
// Everything is created PAUSED: nothing spends until it is reviewed and switched on in each platform.
import { mkdir, writeFile, readFile, readdir, copyFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import he from '../src/content/he.mjs';
import { HOOKS, CTA_END } from './ad-copy.mjs';

const root = resolve(import.meta.dirname, '..');
const SITE = 'https://beenco.tech';
const GOOGLE_ACCOUNT = '913-227-0780'; // Google Ads Editor needs the customer ID on every row (Israel time zone, ILS)
const DAILY_ILS = { google: 60, meta: { accounting: 30, distribution: 30, business: 60, law: 30 } }; // starting daily budgets (ILS) per campaign / ad set; change in the platform if needed

// Shared negatives: job seekers, students, free tools. Domain negatives below (from the campaign review).
// Shared negatives: job seekers, students, events, free tools, how-to, software logins (reviews 2026-11-18).
// Hebrew prefixes make separate words, so "קורס" doesn't block "לקורס": the variants are listed.
// Not "pdf" (order PDFs), "chatgpt" (staff using ChatGPT on client files is a landing-page situation), "עבודה" ("תהליכי עבודה")
// or "איך" ("איך להכניס AI למשרד"): they block prospects (audit 2026-11-18).
const NEGATIVES = ['קורס', 'קורסים', 'לקורס', 'קורסי', 'לימודים', 'ללמוד', 'תואר', 'משרה', 'משרות', 'דרושים', 'דרוש', 'דרושה', 'דרושות',
  'שכר', 'משכורת', 'חינם', 'בחינם', 'חינמי', 'חינמית', 'הורדה', 'מבחן', 'בחינות', 'סטודנט', 'התמחות', 'מתמחה',
  'סדנה', 'הכשרה', 'השתלמות', 'השתלמויות', 'כנס', 'הרצאה', 'וובינר', 'לשכת', 'מדריך', 'מה זה', 'דוגמה', 'דוגמא', 'תבנית',
  'פרומפט', 'כניסה', 'aig', 'אי אי גי', 'איי איי גי', 'התחברות', 'login', 'תמיכה'];

// keywords: phrase match. paused: keywords from the first upload that drew the wrong searchers (kept, switched off).
// pins: headline indexes Google may show in position 1 (it rotates between them).
const DOMAINS = [
  {
    id: 'accounting', name: 'Accounting firms', page: '/for/accounting',
    keywords: ['אוטומציה למשרד רואי חשבון', 'AI לרואי חשבון', 'בינה מלאכותית לרואי חשבון', 'בינה מלאכותית למשרד רואה חשבון',
      'אוטומציה להנהלת חשבונות', 'קליטת מסמכים אוטומטית', 'אוטומציה לרואה חשבון', 'בינה מלאכותית במשרד רואי חשבון',
      'AI במשרד רואי חשבון', 'אוטומציה למשרד הנהלת חשבונות', 'איסוף מסמכים מלקוחות', 'AI להנהלת חשבונות'],
    paused: ['התאמות בנק אוטומטיות'],
    // 15 headlines; the exact keywords appear as headlines (Google's check is close to literal), no near-duplicate pairs.
    headlines: ['AI למשרדי רואי חשבון', 'אוטומציה למשרד רואי חשבון', 'בינה מלאכותית לרואי חשבון', 'AI לרואי חשבון',
      'עונת הדוחות בלי לעצור הכל', 'קליטת מסמכים והתאמות בנק', 'קליטת חשבוניות אוטומטית', 'איסוף מסמכים אוטומטי',
      'קבעו שיחה של 30 דקות', 'מעל 20 שנה בפיתוח תוכנה', 'פחות הקלדה, יותר זמן לייעוץ', 'תנו ל-AI לרדוף אחרי מסמכים',
      'סודיות לקוחות מהיום הראשון', 'AI בתוך התוכנה שכבר יש לכם', 'בלי אנשי מכירות'],
    pins: [0, 1, 2], // several headlines eligible for position 1 is Google's recommended pinning; Google rotates them
    descriptions: ['מאתרים איפה AI חוסך עבודה במשרד, בונים בתוך התוכנה שלכם ומלווים את הצוות עד שזה עובד.',
      'בשיחה של 30 דקות עם ערן נחום נבין איפה המשרד מאבד שעות ומה שווה לבדוק קודם.',
      'גם למשרד קטן: מה שקובע הוא נפח העבודה החוזרת, לא גודל הצוות. בודקים את זה בשיחה הראשונה.',
      'מידע הלקוחות נשאר אצלכם: הרשאת צפייה בלבד, כלים מאושרים, ושום דבר לא עובר לכלי AI ציבורי.'],
    paths: ['רואי-חשבון', 'AI'],
    // Not "חשבונית", "OCR", "סורק", "תוכנה": firm owners search invoice and document intake that way. App shoppers are filtered by brand.
    negatives: ['עוסק פטור', 'חשבונית ירוקה', 'מורנינג', 'אפליקציה', 'אייקאונט', 'ריווחית', 'עצמאי', 'עסק קטן'],
  },
  {
    id: 'distribution', name: 'Import & distribution', page: '/for/distribution',
    keywords: ['אוטומציה להזמנות', 'קליטת הזמנות אוטומטית', 'הקלדת הזמנות', 'אוטומציה בפריוריטי', 'אוטומציה Priority',
      'AI לחברת הפצה', 'בינה מלאכותית ליבואנים', 'אוטומציה ל-ERP', 'אוטומציה להצעות מחיר',
      'אוטומציה לחברת הפצה', 'AI לחברות הפצה', 'אוטומציה ליבואנים', 'אוטומציה לסיטונאים', 'קליטת הזמנות לפריוריטי',
      'קליטת הזמנות מהמייל', 'SAP B1 אוטומציה', 'אוטומציה SAP Business One'],
    paused: [],
    // No product names in headlines: "works with Priority / SAP" reads as a partnership and risks trademark disapproval.
    headlines: ['די להקליד הזמנות ידנית', 'אוטומציה לחברות הפצה', 'AI לחברות הפצה ויבוא', 'קליטת הזמנות אוטומטית',
      'אוטומציה ליבואנים וסיטונאים', 'בינה מלאכותית ליבוא והפצה', 'מהזמנה במייל ישר ל-ERP', 'קליטת הזמנות ממייל ו-PDF',
      'הצעות מחיר מהמחירון שלכם', 'בלי להחליף את ה-ERP', 'קבעו שיחה של 30 דקות', 'מעל 20 שנה בפיתוח תוכנה',
      'יותר לקוחות, לא יותר מקלידים', 'כל הזמנה מוקלדת רק פעם אחת', 'אדם מאשר רק את החריגים'],
    pins: [0, 1, 2],
    descriptions: ['קוראים הזמנות ממייל ומ-PDF ומכינים אותן ב-ERP. אדם מאשר רק את החריגות.',
      'מבט חיצוני ובלתי תלוי: מה שווה אוטומציה ומה לא, ובנייה בתוך המערכות שכבר יש לכם.',
      'מתחילים בשיחה של 30 דקות עם ערן נחום. בלי אנשי מכירות ובלי התחייבות.',
      'יש לכם ספק IT? הוא דואג שהמערכות ירוצו. אנחנו עובדים שכבה מעל, ולצידו כשצריך.'],
    paths: ['חברות-הפצה', 'AI'],
    // "הקלדת הזמנות" attracts typing-from-home jobs; "אוטומציה להזמנות" catches appointment and restaurant bookings;
    // quotes draw contractors; Priority draws developers.
    negatives: ['מהבית', 'עבודה מהבית', 'תור', 'תורים', 'מסעדה', 'מלון', 'אירוע', 'וולט', 'shopify', 'קבלן', 'שיפוצים', 'מפתח',
      'מתכנת', 'SDK', 'וורד', 'יועץ פריוריטי'], // not "אקסל": "הזמנות מאקסל ל-ERP" is a real pain
  },
  {
    // Service intent: where the Hebrew volume is (Keyword Planner 2026-11-18: ~500/month each for "בינה מלאכותית לעסקים",
    // "אוטומציה לעסקים", "סוכן AI"). Lands on the home page. create: the import also creates this campaign (paused).
    id: 'business', name: 'AI for business', page: '/', create: true,
    keywords: ['בינה מלאכותית לעסקים', 'בינה מלאכותית לעסק', 'AI לעסקים', 'אוטומציה לעסקים', 'אוטומציה עסקית', 'הטמעת AI',
      'הטמעת בינה מלאכותית', 'יועץ AI', 'יועץ בינה מלאכותית', 'ייעוץ AI לעסקים', 'סוכן AI לעסק', 'סוכן AI לעסקים', 'סוכני AI לעסקים'],
    paused: ['סוכן AI'], // ~500/month but mixed intent (products, real-estate agents, free tools): on only if search terms show buyers
    headlines: ['בינה מלאכותית לעסקים', 'אוטומציה לעסקים', 'AI לעסקים, מקצה לקצה', 'הטמעת AI בתוך העסק שלכם',
      'יועץ AI שגם בונה בעצמו', 'סוכני AI בתוך המערכות שלכם', 'מהבעיה העסקית ועד AI שעובד', 'בלי להחליף את המערכות שלכם',
      'קבעו שיחה של 30 דקות', 'מעל 20 שנה בפיתוח תוכנה', 'שותף אחד, מקצה לקצה', 'מדברים ישירות עם ערן נחום',
      'מה שווה לבנות, ומה לא', 'מלווים עד שהצוות משתמש', 'הסכם סודיות לפני הכול'],
    pins: [0, 1, 2],
    descriptions: ['מאתרים איפה AI חוסך עבודה, בונים בתוך המערכות שכבר יש לכם ומלווים את הצוות עד שזה עובד.',
      'אסטרטגיה, פיתוח, חיבור למערכות והטמעה, באחריות של שותף אחד. בלי ספקים שמגלגלים אחריות.',
      'בשיחה של 30 דקות עם ערן נחום נבין איפה העסק מאבד שעות ומה שווה לבדוק קודם.',
      'לפעמים התשובה הנכונה היא בכלל לא AI. אומרים את זה לפני שמתחילים לבנות.'],
    paths: ['לעסקים', 'שיחה'], // Hebrew only: mixed-direction paths render out of order
    // Grouped by the risk each covers (review 2026-11-18). Not "פיתוח/בניית סוכן" or "gpt": "בניית סוכן AI לעסק" and
    // "הטמעת GPT בעסק" are buyers; DIY is caught by איך לבנות, python, n8n, קוד.
    negatives: ['ביטוח', 'איך לבנות', 'n8n', 'make', 'zapier', 'זאפייר', 'מייק', 'python', 'github', 'קוד', 'api', 'openai',
      'תמונות', 'תמונה', 'וידאו', 'שירים', 'ציור', 'כתיבת תוכן', 'מחולל',
      // products and other kinds of agents
      'נדלן', 'נדל"ן', 'גוגל', 'google', 'gemini', "ג'מיני", 'copilot', 'קופיילוט', 'claude', 'קלוד', 'manus', "צ'אט",
      // industrial automation
      'תעשייתית', 'plc', 'רובוטיקה', 'רובוט', 'בקרה',
      // WhatsApp bots and marketing automation
      'וואטסאפ', 'ווטסאפ', 'whatsapp', 'בוט', "צ'אטבוט", 'שיווקית', 'דיוור', 'אינסטגרם',
      // search-terms review 2026-11-22: IPO news, product names that "AI" close-variants matched, media generation, courses
      'הנפקה', 'הנפקת', 'אנתרופיק', 'אנטרופיק', 'anthropic', 'מניה', 'מניות', 'קריינות', 'פודקאסט', 'לוגו', 'סרטון', 'סרטוני', 'פרומפטים',
      'סדנת', 'שיווק', 'marketing', 'סכנות', 'יחליף', 'סושיאל', 'alibaba', 'capafy', 'cropus', 'rto', 'clara', 'קלרה', 'skills', 'סקילס',
      'tofu', 'duks', 'revora', 'newo', 'briskwhale', 'neurolytica', 'sourcingai', 'תקדין',
      // an AI as personal adviser; education
      'משפטי', 'השקעות', 'רפואי', 'מס', 'חינוך', 'בית ספר', 'מורים', 'סמינריונית',
      // tool lists, freelancing, careers
      'כלים', 'כלי', 'אפליקציה', 'פרילנס', 'פרילנסר', 'קריירה', 'הסמכה'],
  },
  {
    // Law-firm test (segment review 2026-11-22, marketing/ads/review-segments-2026-11-22.md). Its own campaign: "AI for business"
    // negates "משפטי". create: the import makes it paused. Import alone with ONLY=law. Switch on only if Keyword Planner
    // shows ~50+ searches a month for these phrases; Meta is the main test.
    id: 'law', name: 'Law firms', page: '/for/law', create: true, wave: 'w2', budget: 20,
    keywords: ['בינה מלאכותית לעורכי דין', 'AI לעורכי דין', 'AI למשרד עורכי דין', 'בינה מלאכותית למשרד עורכי דין',
      'AI במשרד עורכי דין', 'בינה מלאכותית במשרד עורכי דין', 'כלי AI לעורכי דין', 'כלי בינה מלאכותית לעורכי דין',
      'אוטומציה למשרד עורכי דין'],
    paused: [],
    // Independent selection is the angle: Hebrew legal-AI products (Techdin, Din Rega, LitiGate) give free demos.
    headlines: ['AI למשרדי עורכי דין', 'בינה מלאכותית לעורכי דין', 'AI לעורכי דין', 'AI למשרד עורכי דין',
      'איזה כלי AI באמת שווה?', 'השוואה עצמאית של כלי AI', 'עם חיסיון וסודיות מובנים', 'טיוטה ראשונה מהתבניות שלכם',
      'חיפוש בתיקים של המשרד', 'עורך דין עובר על כל טיוטה', 'מדיניות AI ברורה למשרד', 'קבעו שיחה של 30 דקות',
      'מעל 20 שנה בפיתוח תוכנה', 'בלי אנשי מכירות', 'לא ספק כלים. מבט עצמאי'],
    pins: [0, 1, 2],
    descriptions: ['כל ספק מציג הדגמה טובה. משווים את הכלים על המסמכים שלכם וממליצים מה שווה את הסיכון.',
      'טיוטות ראשונות וחיפוש בתיקים, בתוך המערכות שהמשרד כבר עובד איתן. עורך דין מאשר הכול.',
      'קודם הסכם סודיות. מידע לקוחות נשאר בכלים מאושרים בלבד, ושום דבר לא עובר לכלי ציבורי.',
      'בשיחה של 30 דקות עם ערן נחום נבין איפה הולכות שעות הבכירים ומה שווה לבדוק קודם.'],
    paths: ['עורכי-דין', 'שיחה'],
    // The public looking for free legal answers from an AI ("עורך דין AI"), and law students.
    negatives: ['ייעוץ משפטי', 'שאלה משפטית', 'לייעוץ', 'בוט', 'גירושין', 'גירושים', 'מזונות', 'צוואה', 'ירושה', 'תאונה',
      'פיצויים', 'פיטורים', 'תביעה', 'תביעות קטנות', 'לימודי', 'משפטים', 'סטודנטים'],
  },
];

// ---- platform limits (fail loudly instead of letting an import reject a row) ----
const errs = [];
const len = (s) => [...s].length;
for (const d of DOMAINS) {
  d.headlines.forEach((h) => len(h) > 30 && errs.push(`${d.id} headline >30 (${len(h)}): ${h}`));
  d.descriptions.forEach((x) => len(x) > 90 && errs.push(`${d.id} description >90 (${len(x)}): ${x}`));
  d.paths.forEach((p) => len(p) > 15 && errs.push(`${d.id} path >15: ${p}`));
  if (d.headlines.length < 3 || d.headlines.length > 15 || d.descriptions.length < 2 || d.descriptions.length > 4) errs.push(`${d.id}: RSA needs 3+ headlines and 2+ descriptions`);
}
if (errs.length) { console.error(errs.join('\n')); process.exit(1); }

const wave = (d) => d.wave || 'w1';
const utm = (src, med, d, extra = '') => `utm_source=${src}&utm_medium=${med}&utm_campaign=${d.id}-${wave(d)}${extra}`;
const csv = (rows) => '﻿' + rows.map((r) => r.map((v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(',')).join('\r\n') + '\r\n';

// ---- Google Ads Editor (Account → Import → From file) ----
const H = 15, D = 4;
const gCols = ['Account', 'Campaign', 'Campaign Type', 'Networks', 'Budget', 'Budget type', 'Bid Strategy Type', 'Campaign Status', 'Final URL suffix', 'Location',
  'Ad Group', 'Ad Group Status', 'Keyword', 'Criterion Type', 'Ad type', 'Status', 'Final URL', 'Path 1', 'Path 2',
  ...Array.from({ length: H }, (_, i) => [`Headline ${i + 1}`, `Headline ${i + 1} position`]).flat(), ...Array.from({ length: D }, (_, i) => `Description ${i + 1}`)];
const g = [gCols];
const row = (o) => gCols.map((c) => (c === 'Account' ? GOOGLE_ACCOUNT : o[c] ?? ''));
// ONLY=<id> writes just that campaign to google-ads-editor-<id>.csv, for importing one new campaign without re-adding
// the other campaigns' ads (each import of an ad creates a new copy).
const ONLY = process.env.ONLY || '';
for (const d of DOMAINS.filter((x) => !ONLY || x.id === ONLY)) {
  const camp = `bee&co | ${d.name} | Search | ${wave(d).toUpperCase()}`, ag = `${d.name} – core`;
  // Campaign, location and ad group rows only for a first upload (NEW_CAMPAIGNS=1). On the live account they would
  // reset the budget, status and bid settings set by hand and duplicate the location.
  if (process.env.NEW_CAMPAIGNS === '1' || d.create) {
    g.push(row({ Campaign: camp, 'Campaign Type': 'Search', Networks: 'Google search', Budget: d.budget || DAILY_ILS.google, 'Budget type': 'Daily',
      'Bid Strategy Type': 'Maximize clicks', 'Campaign Status': 'Paused', 'Final URL suffix': utm('google', 'cpc', d, '&utm_term={keyword}') }));
    g.push(row({ Campaign: camp, Location: 'Israel' }));
    g.push(row({ Campaign: camp, 'Ad Group': ag, 'Ad Group Status': 'Enabled' }));
  }
  d.keywords.forEach((k) => g.push(row({ Campaign: camp, 'Ad Group': ag, Keyword: k, 'Criterion Type': 'Phrase', Status: 'Enabled' })));
  d.paused.forEach((k) => g.push(row({ Campaign: camp, 'Ad Group': ag, Keyword: k, 'Criterion Type': 'Phrase', Status: 'Paused' })));
  [...NEGATIVES, ...d.negatives].forEach((k) => g.push(row({ Campaign: camp, Keyword: k, 'Criterion Type': 'Campaign Negative Broad' })));
  const ad = { Campaign: camp, 'Ad Group': ag, 'Ad type': 'Responsive search ad', Status: 'Enabled', 'Final URL': SITE + d.page, 'Path 1': d.paths[0], 'Path 2': d.paths[1] };
  d.headlines.forEach((h, i) => { ad[`Headline ${i + 1}`] = h; });
  d.pins.forEach((i) => { ad[`Headline ${i + 1} position`] = 1; }); // Google rotates these in position 1, the rest anywhere
  d.descriptions.forEach((x, i) => { ad[`Description ${i + 1}`] = x; });
  g.push(row(ad));
}

// ---- Meta Ads Manager (Import ads in bulk) ----
// Follows Meta's own template (AdsManagerTemplate_v2.3, 114 columns, kept in scripts/meta-import-columns.json). Meta's import dialog takes: the
// CSV plus the banner files, each ad naming its image in the "Image File Name" column (see marketing/ads/meta-upload/). Everything is created paused.
// Template rules: objective "Traffic"; creative type "Page post ad" with the Facebook Page ID in "Link object ID";
// campaign, ad set and ad names up to 35 characters; Device Platforms is required.
const META_PAGE_ID = '1437816686084407'; // the bee & co. Facebook Page (asset_id in its Business Suite URL)
const META_SHORT = { accounting: 'Accounting', distribution: 'Distribution', business: 'AI business', law: 'Law' };
const mCols = JSON.parse(await readFile(join(root, 'scripts/meta-import-columns.json'), 'utf8'));
const m = [mCols];
const metaImages = [];
const metaAds = []; // for the hand-setup sheet (new ad accounts can't publish bulk-imported ads)
// One ad per banner: the landing-page headline plus each hook. utm_content tells them apart in GA;
// the image is marketing/ads/images/{domain}-{angle}-square.png (portrait and wide exist for placements added later).
for (const d of DOMAINS.filter((x) => HOOKS[x.id])) {
  const camp = `bee&co | ${META_SHORT[d.id]} | Meta | ${wave(d).toUpperCase()}`, set = `${META_SHORT[d.id]} – Israel 30-65`, H = HOOKS[d.id];
  const ads = [
    { angle: 'headline', body: H.headline.body, title: H.headline.title },
    ...H.hooks.map((x) => ({ angle: 'hook-' + x.id, body: x.body || `${x.h} ${x.s}`, title: x.title })),
  ];
  for (const a of ads) {
    const name = `${d.id} – ${a.angle}`, image = `${d.id}-${a.angle}-square.png`;
    for (const [what, v, max] of [['campaign', camp, 35], ['ad set', set, 35], ['ad name', name, 35], ['title', a.title, 40]]) {
      if (len(v) > max) { console.error(`meta ${what} too long (${len(v)} > ${max}): ${v}`); process.exit(1); }
    }
    const o = {
      'Campaign Name': camp, 'Campaign Status': 'PAUSED', 'Special Ad Categories': 'none', 'Campaign Objective': 'Traffic', 'Buying Type': 'AUCTION',
      'Ad Set Run Status': 'PAUSED', 'Ad Set Name': set, 'Ad Set Daily Budget': DAILY_ILS.meta[d.id], 'Link': `${SITE}${d.page}?${utm('facebook', 'paid', d, '&utm_content=' + a.angle)}`,
      'Link Object ID': META_PAGE_ID, 'Countries': 'IL', 'Age Min': 30, 'Age Max': 65, 'Publisher Platforms': 'facebook, instagram',
      'Device Platforms': 'mobile, desktop', 'Facebook Positions': 'feed', 'Instagram Positions': 'stream',
      'Optimization Goal': 'LINK_CLICKS', 'Billing Event': 'IMPRESSIONS', 'Ad Status': 'PAUSED', 'Ad Name': name, 'Title': a.title,
      'Body': `${a.body} ${CTA_END}`, 'Display Link': 'beenco.tech', 'Creative Type': 'Page post ad', 'Image File Name': image, 'Call to Action': 'LEARN_MORE',
    };
    for (const k of Object.keys(o)) if (!mCols.includes(k)) { console.error('unknown Meta column: ' + k); process.exit(1); }
    m.push(mCols.map((c) => o[c] ?? ''));
    metaImages.push(image);
    metaAds.push({ d, camp, set, name, title: a.title, body: o.Body, link: o.Link, image });
  }
}

const out = join(root, 'marketing/ads');
await mkdir(out, { recursive: true });
await writeFile(join(out, ONLY ? `google-ads-editor-${ONLY}.csv` : 'google-ads-editor.csv'), csv(g));

// New ad accounts can't publish bulk-imported ads (Meta error #3738001), so this sheet lists every field for creating them by hand.
{
  const lines = ['# Meta ads: set up by hand', '',
    'Generated by `node scripts/make-ad-files.mjs`. Meta blocks publishing of bulk-imported ads on new ad accounts (error #3738001), so create the campaigns in Ads Manager with **Create**, and copy the fields below. Everything is created **paused**.', '',
    '## Settings for every campaign', '',
    '| Field | Value |', '|---|---|',
    '| Campaign objective | **Traffic** |', '| Special ad category | None |', '| Buying type | Auction |',
    '| Campaign budget (Advantage campaign budget) | **Off**: set the budget on the ad set |',
    '| Ad set: conversion location | **Website** |', '| Ad set: performance goal | **Maximize number of link clicks** |',
    `| Ad set: daily budget | Accounting ₪${DAILY_ILS.meta.accounting}, Distribution ₪${DAILY_ILS.meta.distribution}, AI business ₪${DAILY_ILS.meta.business}, Law ₪${DAILY_ILS.meta.law} |`, '| Ad set: bid strategy | Highest volume (no bid amount) |',
    '| Audience | Original audience options (Advantage+ audience **off**). Israel, age 30–65, Hebrew. Interests: see the README |',
    '| Placements | **Manual**: Facebook Feed and Instagram Feed only |',
    '| Ad: Page | bee & co. |', '| Ad: format | Single image |', '| Ad: call to action | Learn more |', '| Ad: display link | beenco.tech |', '| Status | Off (paused) |', ''];
  for (const camp of [...new Set(metaAds.map((a) => a.camp))]) {
    const ads = metaAds.filter((a) => a.camp === camp);
    lines.push(`## ${camp}`, '', `Ad set name: **${ads[0].set}**. Create the first ad, then **Duplicate** it inside the ad set for the other three and change the fields below.`, '');
    for (const a of ads) {
      lines.push(`### ${a.name}`, '', `- **Ad name:** ${a.name}`, `- **Image:** \`marketing/ads/meta-upload/${a.image}\``, `- **Primary text:** ${a.body}`, `- **Headline:** ${a.title}`, `- **Website URL:** ${a.link}`, '');
    }
  }
  await writeFile(join(out, 'meta-manual-setup.md'), lines.join('\n'));
}
await writeFile(join(out, 'meta-ads-import.csv'), csv(m));
// Meta's import dialog takes the images (Images tab) and the CSV (File tab) separately and matches them by file name,
// so everything it needs goes into one folder: marketing/ads/meta-upload/. Rebuilt on every run: only the banners and the
// import CSV are replaced. Review exports (meta-results-*.csv, google-search-terms-*.csv) also live here and are kept.
const upload = join(out, 'meta-upload');
await mkdir(upload, { recursive: true });
for (const f of await readdir(upload)) if (f.endsWith('.png')) await rm(join(upload, f));
await copyFile(join(out, 'meta-ads-import.csv'), join(upload, 'meta-ads-import.csv'));
for (const f of metaImages) await copyFile(join(out, 'images', f), join(upload, f));
await rm(join(out, 'meta-ads-import.zip'), { force: true });
console.log(`ok: ${g.length - 1} Google rows, ${m.length - 1} Meta ads; all limits checked`);
