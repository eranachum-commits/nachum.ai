// Renders the wave-1 ad images in Hebrew for each campaign domain, in two angles and two sizes:
//   angle "headline": the landing page's question;  angle "memo": three ideas with honest verdicts (from the page's memo)
//   sizes: 1080×1080 (Facebook/Instagram feed) and 1200×627 (LinkedIn and Facebook link ads)
// `node scripts/make-ad-images.mjs` → marketing/ads/images/{domain}-{angle}-{size}.png
import { mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import he from '../src/content/he.mjs';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = resolve(import.meta.dirname, '..');
const DOMAINS = ['accounting', 'distribution'];
const SIZES = { square: [1080, 1080], wide: [1200, 627] };
const font = (w, sub) => `url('file://${join(root, 'public/fonts', `IBMPlexSansHebrew-${w}-${sub}.woff2`)}') format('woff2')`;
const faces = [300, 400, 500, 600].map((w) => `
@font-face { font-family: Plex; font-weight: ${w}; src: ${font(w, 'hebrew')}; unicode-range: U+0590-05FF, U+FB1D-FB4F; }
@font-face { font-family: Plex; font-weight: ${w}; src: ${font(w, 'latin')}; unicode-range: U+0000-00FF, U+2010-2027; }`).join('');
const hex = 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)';
const mark = (s) => `<svg viewBox="8.5 1 100 100" width="${s}" height="${s}"><path d="M28 13v62c0 8 6 14 14 14h20c15 0 27-12 27-27 0-14-11-25-25-26H44" fill="none" stroke="#202820" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M45 36l13-8 13 8v16l-13 8-13-8z" fill="#e8ad36"/></svg>`;
const VERDICT = {
  build: '<svg viewBox="0 0 24 21"><path d="M6 0h12l6 10.5L18 21H6L0 10.5z" fill="#e8ad36"/></svg>',
  later: '<svg viewBox="0 0 24 21"><path d="M6.6 1h10.8l5.4 9.5-5.4 9.5H6.6L1.2 10.5z" fill="none" stroke="#465247" stroke-width="1.6"/></svg>',
  no: '<svg viewBox="0 0 24 21"><path d="M6.6 1h10.8l5.4 9.5-5.4 9.5H6.6L1.2 10.5z" fill="none" stroke="#596459" stroke-width="1.6"/><path d="M5 18 19 3" stroke="#596459" stroke-width="1.6"/></svg>',
};

function page(id, angle, [W, H]) {
  const d = he.industries[id], sq = W === H, k = sq ? 1.12 : 0.7; // type scale: the wide format is shorter
  const lock = `<div class="lock">${mark(64 * (sq ? 1 : 0.8))}<div><div class="name">bee &amp; co.</div><div class="sub">AI SOLUTIONS &amp; TRANSFORMATION</div></div></div>`;
  const foot = `<div class="foot"><span>שותף אחד מקצה לקצה</span><b dir="ltr">beenco.tech</b></div>`;
  const body = angle === 'headline'
    ? `<h1>${d.h1}</h1><p class="lede">מאתרים איפה AI חוסך עבודה, ובונים את זה בתוך המערכות שכבר יש לכם.</p>`
    : `<h1 class="mh">${he.home.memo.title}</h1><ol class="memo">${d.memo.items.map((x) => `<li class="r-${x.k}"><p>${x.q}</p><span class="v">${VERDICT[x.k]}${x.v}</span></li>`).join('')}</ol>`;
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><style>${faces}
* { margin: 0; box-sizing: border-box; } html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
body { background: #dce4d8; color: #202820; font-family: Plex, sans-serif; position: relative; }
.cell { position: absolute; clip-path: ${hex}; aspect-ratio: 1.14; }
.c1 { width: ${sq ? 360 : 300}px; left: ${sq ? -120 : -90}px; top: ${sq ? -90 : -80}px; background: #e8ad36; opacity: .9; }
.c2 { width: ${sq ? 190 : 150}px; left: ${sq ? -40 : -30}px; bottom: ${sq ? -50 : -50}px; background: #d9d5e6; }
.in { position: absolute; inset: ${sq ? '72px 72px 64px 120px' : '44px 56px 40px 200px'}; display: flex; flex-direction: column; }
.lock { display: flex; align-items: center; gap: 14px; direction: ltr; align-self: flex-start; } /* start = right in Hebrew, clear of the yellow cell */
.name { font: 400 ${sq ? 46 : 38}px/0.9 Georgia, serif; letter-spacing: -2px; }
.sub { font: 600 ${sq ? 11 : 9.5}px/1.2 Plex; letter-spacing: 1.2px; margin-top: 7px; }
h1 { margin-top: auto; font: 300 ${Math.round(84 * k)}px/1.12 Plex; letter-spacing: -.5px; text-wrap: balance; }
.lede { margin-top: ${sq ? 28 : 14}px; font: 400 ${Math.round(32 * k)}px/1.4 Plex; color: #465247; max-width: 30ch; }
.mh { margin-top: auto; font-size: ${Math.round(58 * (sq ? 1 : 0.62))}px; }
.memo { list-style: none; padding: 0; margin: ${sq ? '34px 0 auto' : '16px 0 auto'}; background: #fffdf8; border: 1px solid #c6c9be; border-top: 5px solid #202820; border-radius: 10px; padding: ${sq ? '8px 32px' : '2px 24px'}; }
.memo li { display: flex; justify-content: space-between; align-items: center; gap: 24px; padding: ${sq ? '24px 0' : '11px 0'}; border-top: 1px solid #c6c9be; }
.memo li:first-child { border-top: 0; }
.memo p { font: 500 ${Math.round(31 * (sq ? 1 : 0.68))}px/1.3 Plex; }
.v { flex: none; display: inline-flex; align-items: center; gap: 10px; font: 600 ${Math.round(28 * (sq ? 1 : 0.68))}px Plex; }
.v svg { width: ${sq ? 34 : 24}px; height: ${sq ? 30 : 21}px; }
.r-build .v { color: #4d3d07; } .r-later .v { color: #465247; } .r-no .v { color: #596459; }
.foot { margin-top: ${sq ? 40 : 18}px; display: flex; justify-content: space-between; align-items: baseline; font-size: ${sq ? 30 : 22}px; color: #465247; }
.foot b { color: #202820; font-weight: 600; }
</style></head><body><div class="cell c1"></div><div class="cell c2"></div>
<div class="in">${lock}${body}${foot}</div></body></html>`;
}

const out = join(root, 'marketing/ads/images');
await mkdir(out, { recursive: true });
const tmp = await mkdtemp(join(tmpdir(), 'ads-'));
for (const id of DOMAINS) for (const angle of ['headline', 'memo']) for (const [size, dims] of Object.entries(SIZES)) {
  const name = `${id}-${angle}-${size}`, file = join(tmp, name + '.html'), png = join(out, name + '.png');
  await writeFile(file, page(id, angle, dims));
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--force-device-scale-factor=1',
    `--window-size=${dims[0]},${dims[1]}`, '--virtual-time-budget=3000', `--screenshot=${png}`, 'file://' + file], { stdio: 'ignore' });
  console.log('wrote', png);
}
