// Renders the Hebrew ad banners for every campaign domain. No photos of people.
//   angle "headline":  the landing page's question, on sage (matches the page the click lands on)
//   angle "hook-{id}": one sharp line from scripts/ad-copy.mjs, on night, so it stands out in a white feed
//   sizes: square 1080×1080 and portrait 1080×1350 (Facebook/Instagram feed), wide 1200×627 (LinkedIn, Facebook link ads)
// Legibility rules (from the campaign review): at least ~30px text at 1080 wide, heavy headline weight,
// no logo tagline, content centred instead of a large empty band.
// `node scripts/make-ad-images.mjs` → marketing/ads/images/{domain}-{angle}-{size}.png
import { mkdtemp, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import he from '../src/content/he.mjs';
import { HOOKS } from './ad-copy.mjs';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = resolve(import.meta.dirname, '..');
const SIZES = { square: [1080, 1080], portrait: [1080, 1350], wide: [1200, 627] };
const font = (w, sub) => `url('file://${join(root, 'public/fonts', `IBMPlexSansHebrew-${w}-${sub}.woff2`)}') format('woff2')`;
const faces = [400, 500, 600].map((w) => `
@font-face { font-family: Plex; font-weight: ${w}; src: ${font(w, 'hebrew')}; unicode-range: U+0590-05FF, U+FB1D-FB4F; }
@font-face { font-family: Plex; font-weight: ${w}; src: ${font(w, 'latin')}; unicode-range: U+0000-00FF, U+2010-2027; }`).join('');
const hex = 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)';
const mark = (s, ink) => `<svg viewBox="8.5 1 100 100" width="${s}" height="${s}"><path d="M28 13v62c0 8 6 14 14 14h20c15 0 27-12 27-27 0-14-11-25-25-26H44" fill="none" stroke="${ink}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M45 36l13-8 13 8v16l-13 8-13-8z" fill="#e8ad36"/></svg>`;

function page(id, angle, [W, H]) {
  const dark = angle !== 'headline', wide = W > H, tall = H > W;
  const ink = dark ? '#f5f0e6' : '#202820', soft = dark ? '#c7bdca' : '#465247';
  const hk = HOOKS[id].hooks.find((x) => 'hook-' + x.id === angle);
  const main = hk ? hk.h : he.industries[id].h1;
  const sub = hk ? hk.s : 'מאתרים איפה AI חוסך עבודה, ובונים את זה בתוך המערכות שכבר יש לכם.';
  const s = wide ? 0.66 : 1; // type scale
  const big = Math.round((main.length > 34 ? 84 : 96) * s * (tall && main.length <= 34 ? 1.12 : 1));
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><style>${faces}
* { margin: 0; box-sizing: border-box; } html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
body { background: ${dark ? '#25212a' : '#dce4d8'}; color: ${ink}; font-family: Plex, sans-serif; position: relative; }
.cell { position: absolute; clip-path: ${hex}; aspect-ratio: 1.14; }
.c1 { width: ${wide ? 240 : 330}px; left: ${wide ? -150 : -200}px; top: ${wide ? 200 : tall ? 520 : 400}px; background: #e8ad36; } /* middle-left edge: clear of the logo and the text */
.c2 { width: ${wide ? 120 : 170}px; left: ${wide ? -30 : -40}px; bottom: ${wide ? -40 : -50}px; background: ${dark ? '#534a58' : '#d9d5e6'}; }
.in { position: absolute; inset: ${wide ? '44px 60px 40px 190px' : tall ? '84px 84px 80px 130px' : '72px 80px 68px 130px'}; display: flex; flex-direction: column; }
.top { display: flex; justify-content: space-between; align-items: center; }
.lock { display: flex; align-items: center; gap: 12px; direction: ltr; }
.name { font: 400 ${Math.round(48 * s)}px/1 Georgia, serif; letter-spacing: -2px; }
.chip { font: 600 ${Math.round(30 * (wide ? 0.78 : 1))}px/1 Plex; padding: ${Math.round(14 * s)}px ${Math.round(22 * s)}px; border-radius: 999px; background: ${dark ? '#e8ad36' : '#202820'}; color: ${dark ? '#25212a' : '#f5f0e6'}; }
.mid { margin-block: auto; }
h1 { font: 600 ${big}px/1.12 Plex; letter-spacing: -.5px; text-wrap: balance; }
.sub { margin-top: ${Math.round(30 * s)}px; font: 400 ${Math.round(36 * s)}px/1.4 Plex; color: ${soft}; max-width: 26ch; text-wrap: pretty; }
.bar { width: ${Math.round(90 * s)}px; height: ${Math.round(8 * s)}px; background: #e8ad36; border-radius: 4px; margin-bottom: ${Math.round(34 * s)}px; }
.foot { display: flex; justify-content: space-between; align-items: baseline; font-size: ${Math.round(32 * s)}px; color: ${soft}; }
.foot b { color: ${dark ? '#f0c35b' : '#202820'}; font-weight: 600; }
</style></head><body><div class="cell c1"></div><div class="cell c2"></div>
<div class="in">
  <div class="top"><span class="chip"><bdi dir="ltr">AI</bdi> ${HOOKS[id].who}</span><div class="lock">${mark(Math.round(60 * s), ink)}<span class="name">bee &amp; co.</span></div></div>
  <div class="mid"><div class="bar"></div><h1>${main.replace(/([.?]) (?=\S)/g, '$1<br>')}</h1><p class="sub">${sub}</p></div>
  <div class="foot"><span>קובעים שיחה של 30 דקות, בלי התחייבות</span><b dir="ltr">beenco.tech</b></div>
</div></body></html>`;
}

const out = join(root, 'marketing/ads/images');
await mkdir(out, { recursive: true });
for (const f of await readdir(out)) if (f.endsWith('.png')) await rm(join(out, f)); // no stale angles left behind
const tmp = await mkdtemp(join(tmpdir(), 'ads-'));
let n = 0;
for (const id of Object.keys(HOOKS)) for (const angle of ['headline', ...HOOKS[id].hooks.map((x) => 'hook-' + x.id)]) for (const [size, dims] of Object.entries(SIZES)) {
  const name = `${id}-${angle}-${size}`, file = join(tmp, name + '.html'), png = join(out, name + '.png');
  await writeFile(file, page(id, angle, dims));
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--force-device-scale-factor=1',
    `--window-size=${dims[0]},${dims[1]}`, '--virtual-time-budget=3000', `--screenshot=${png}`, 'file://' + file], { stdio: 'ignore' });
  n++;
}
console.log(`wrote ${n} images to ${out}`);
