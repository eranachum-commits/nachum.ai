// Builds the paid-ads import files for wave 1 (accounting firms, import & distribution) and checks platform limits.
// `node scripts/make-ad-files.mjs` → marketing/ads/google-ads-editor.csv, marketing/ads/meta-ads-import.csv
// Everything is created PAUSED: nothing spends until it is reviewed and switched on in each platform.
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import he from '../src/content/he.mjs';
import { HOOKS, CTA_END } from './ad-copy.mjs';

const root = resolve(import.meta.dirname, '..');
const SITE = 'https://beenco.tech';
const DAILY_ILS = { google: 100, meta: 60 }; // starting budgets per campaign; change in the platform if needed

// Shared negatives: job seekers, students, free tools. Domain negatives below (from the campaign review).
const NEGATIVES = ['קורס', 'קורסים', 'לימודים', 'תואר', 'משרה', 'משרות', 'דרושים', 'חינם', 'הורדה', 'pdf', 'מבחן', 'סטודנט', 'שכר',
  'סדנה', 'הכשרה', 'וובינר', 'מדריך', 'מה זה', 'פרומפט'];

const DOMAINS = [
  {
    id: 'accounting', name: 'Accounting firms', page: '/for/accounting',
    keywords: ['אוטומציה למשרד רואי חשבון', 'AI לרואי חשבון', 'בינה מלאכותית לרואי חשבון', 'בינה מלאכותית למשרד רואה חשבון',
      'אוטומציה להנהלת חשבונות', 'AI להנהלת חשבונות', 'קליטת מסמכים אוטומטית', 'התאמות בנק אוטומטיות'],
    headlines: ['AI למשרדי רואי חשבון', 'פחות הקלדה ופחות התאמות', 'עונת הדוחות בלי לעצור הכל', 'בונים בתוך התוכנה הקיימת',
      'איסוף מסמכים אוטומטי', 'שותף אחד מקצה לקצה', 'שיחה של 30 דקות עם ערן', '22 שנה בהייטק',
      'למדתם ראיית חשבון, לא הקלדה', 'תנו ל-AI לרדוף אחרי מסמכים', 'סודיות מובנית מהיום הראשון', 'AI בתוך התוכנה שכבר יש לכם'],
    descriptions: ['מאתרים איפה AI חוסך עבודה במשרד, בונים את זה בתוך התוכנה שלכם ודואגים שהצוות משתמש.',
      'איסוף מסמכים, הקלדה והתאמות בנק – אוטומטית, ואיש מקצוע מאשר רק את החריגים.',
      'מתחילים בשיחה של 30 דקות עם ערן נחום. בלי אנשי מכירות ובלי התחייבות.',
      'מידע הלקוחות נשאר אצלכם: גישת קריאה בלבד, כלים מאושרים, ושום דבר לא נכנס לכלי AI פתוח.'],
    paths: ['רואי-חשבון', 'AI'],
    negatives: ['עוסק פטור', 'חשבונית ירוקה', 'מורנינג', 'אפליקציה'],
  },
  {
    id: 'distribution', name: 'Import & distribution', page: '/for/distribution',
    keywords: ['אוטומציה להזמנות', 'קליטת הזמנות אוטומטית', 'הקלדת הזמנות', 'אוטומציה בפריוריטי', 'אוטומציה Priority',
      'AI לחברת הפצה', 'בינה מלאכותית ליבואנים', 'אוטומציה ל-ERP', 'אוטומציה להצעות מחיר'],
    // No product names in headlines: "works with Priority / SAP" reads as a partnership and risks trademark disapproval.
    headlines: ['AI לחברות הפצה ויבוא', 'די להקליד הזמנות ידנית', 'מהזמנה במייל ישר ל-ERP', 'מתחברים ל-ERP שכבר יש לכם',
      'הצעות מחיר מהמחירון שלכם', 'שותף אחד מקצה לקצה', 'שיחה של 30 דקות עם ערן', '22 שנה בהייטק',
      'יותר לקוחות, לא יותר מקלידים', 'כל הזמנה מוקלדת רק פעם אחת', 'אדם מאשר רק את החריגים', 'AI בתוך ה-ERP שכבר יש לכם'],
    descriptions: ['קוראים הזמנות אוטומטית ומכינים אותן ב-ERP. אדם מאשר רק את מה שחריג.',
      'מבט עצמאי ובכיר: מה שווה לאוטמט, מה לא, ובנייה בתוך המערכות שכבר יש לכם.',
      'מתחילים בשיחה של 30 דקות עם ערן נחום. בלי אנשי מכירות ובלי התחייבות.',
      'מתחילים מה-ERP שכבר יש לכם, בגישת קריאה בלבד. החלפת מערכת היא אף פעם לא הצעד הראשון.'],
    paths: ['חברות-הפצה', 'AI'],
    // "הקלדת הזמנות" attracts typing-from-home jobs; "אוטומציה להזמנות" catches appointment and restaurant bookings.
    negatives: ['מהבית', 'עבודה מהבית', 'תור', 'תורים', 'מסעדה', 'מלון', 'אירוע', 'וולט', 'shopify'],
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
const gCols = ['Campaign', 'Campaign Type', 'Networks', 'Budget', 'Budget type', 'Bid Strategy Type', 'Campaign Status', 'Final URL suffix', 'Location',
  'Ad Group', 'Ad Group Status', 'Keyword', 'Criterion Type', 'Ad type', 'Status', 'Final URL', 'Path 1', 'Path 2',
  ...Array.from({ length: H }, (_, i) => `Headline ${i + 1}`), 'Headline 1 position', ...Array.from({ length: D }, (_, i) => `Description ${i + 1}`)];
const g = [gCols];
const row = (o) => gCols.map((c) => o[c] ?? '');
for (const d of DOMAINS) {
  const camp = `bee&co | ${d.name} | Search | W1`, ag = `${d.name} – core`;
  g.push(row({ Campaign: camp, 'Campaign Type': 'Search', Networks: 'Google search', Budget: DAILY_ILS.google, 'Budget type': 'Daily',
    'Bid Strategy Type': 'Maximize clicks', 'Campaign Status': 'Paused', 'Final URL suffix': utm('google', 'cpc', d, '&utm_term={keyword}') }));
  g.push(row({ Campaign: camp, Location: 'Israel' }));
  g.push(row({ Campaign: camp, 'Ad Group': ag, 'Ad Group Status': 'Enabled' }));
  d.keywords.forEach((k) => g.push(row({ Campaign: camp, 'Ad Group': ag, Keyword: k, 'Criterion Type': 'Phrase', Status: 'Enabled' })));
  [...NEGATIVES, ...d.negatives].forEach((k) => g.push(row({ Campaign: camp, Keyword: k, 'Criterion Type': 'Campaign Negative Broad' })));
  const ad = { Campaign: camp, 'Ad Group': ag, 'Ad type': 'Responsive search ad', Status: 'Enabled', 'Final URL': SITE + d.page, 'Path 1': d.paths[0], 'Path 2': d.paths[1] };
  d.headlines.forEach((h, i) => { ad[`Headline ${i + 1}`] = h; });
  ad['Headline 1 position'] = 1; // pin "AI ל…" first: Google rotates the rest
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
for (const d of DOMAINS) {
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
await writeFile(join(out, 'google-ads-editor.csv'), csv(g));
await writeFile(join(out, 'meta-ads-import.csv'), csv(m));
console.log(`ok: ${g.length - 1} Google rows, ${m.length - 1} Meta ads; all limits checked`);
