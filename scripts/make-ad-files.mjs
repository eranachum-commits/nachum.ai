// Builds the paid-ads import files for wave 1 (accounting firms, import & distribution) and checks platform limits.
// `node scripts/make-ad-files.mjs` → marketing/ads/google-ads-editor.csv, marketing/ads/meta-ads-import.csv
// Default output updates the live campaigns (keywords, negatives, ads). NEW_CAMPAIGNS=1 also creates the campaigns.
// Everything is created PAUSED: nothing spends until it is reviewed and switched on in each platform.
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import he from '../src/content/he.mjs';
import { HOOKS, CTA_END } from './ad-copy.mjs';

const root = resolve(import.meta.dirname, '..');
const SITE = 'https://beenco.tech';
const GOOGLE_ACCOUNT = '913-227-0780'; // Google Ads Editor needs the customer ID on every row (Israel time zone, ILS)
const DAILY_ILS = { google: 60, meta: 60 }; // starting budgets per campaign; change in the platform if needed

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
      // an AI as personal adviser; education
      'משפטי', 'השקעות', 'רפואי', 'מס', 'חינוך', 'בית ספר', 'מורים', 'סמינריונית',
      // tool lists, freelancing, careers
      'כלים', 'כלי', 'אפליקציה', 'פרילנס', 'פרילנסר', 'קריירה', 'הסמכה'],
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

const utm = (src, med, d, extra = '') => `utm_source=${src}&utm_medium=${med}&utm_campaign=${d.id}-w1${extra}`;
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
  const camp = `bee&co | ${d.name} | Search | W1`, ag = `${d.name} – core`;
  // Campaign, location and ad group rows only for a first upload (NEW_CAMPAIGNS=1). On the live account they would
  // reset the budget, status and bid settings set by hand and duplicate the location.
  if (process.env.NEW_CAMPAIGNS === '1' || d.create) {
    g.push(row({ Campaign: camp, 'Campaign Type': 'Search', Networks: 'Google search', Budget: DAILY_ILS.google, 'Budget type': 'Daily',
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

// ---- Meta Ads Manager (Import ads in bulk). Images are attached in Ads Manager after import. ----
const mCols = ['Campaign Name', 'Campaign Status', 'Campaign Objective', 'Buying Type', 'Ad Set Name', 'Ad Set Run Status', 'Ad Set Daily Budget',
  'Destination Type', 'Optimization Goal', 'Billing Event', 'Countries', 'Age Min', 'Age Max', 'Publisher Platforms',
  'Ad Name', 'Ad Status', 'Body', 'Title', 'Link', 'Display Link', 'Call to Action'];
const m = [mCols];
// One ad per banner: the landing-page headline plus each hook. utm_content tells them apart in GA;
// the image to attach is marketing/ads/images/{domain}-{angle}-square.png (or -portrait for Instagram).
for (const d of DOMAINS.filter((x) => HOOKS[x.id] && x.id !== 'business')) {
  const camp = `bee&co | ${d.name} | Traffic | W1`, set = `${d.name} – Israel 30-65`, H = HOOKS[d.id];
  const ads = [
    { angle: 'headline', body: H.headline.body, title: H.headline.title },
    ...H.hooks.map((x) => ({ angle: 'hook-' + x.id, body: x.body || `${x.h} ${x.s}`, title: x.title })),
  ];
  for (const a of ads) {
    const title = a.title;
    if (len(title) > 40) { console.error('meta title too long: ' + title); process.exit(1); }
    m.push([camp, 'PAUSED', 'Outcome Traffic', 'AUCTION', set, 'PAUSED', DAILY_ILS.meta, 'WEBSITE', 'LINK_CLICKS', 'IMPRESSIONS',
      'IL', 30, 65, 'facebook, instagram', `${d.id} – ${a.angle}`, 'PAUSED', `${a.body} ${CTA_END}`, title,
      `${SITE}${d.page}?${utm('facebook', 'paid', d, '&utm_content=' + a.angle)}`, 'beenco.tech', 'LEARN_MORE']);
  }
}

const out = join(root, 'marketing/ads');
await mkdir(out, { recursive: true });
await writeFile(join(out, ONLY ? `google-ads-editor-${ONLY}.csv` : 'google-ads-editor.csv'), csv(g));
await writeFile(join(out, 'meta-ads-import.csv'), csv(m));
console.log(`ok: ${g.length - 1} Google rows, ${m.length - 1} Meta ads; all limits checked`);
