// Renders the LinkedIn Company Page cover (1128×191, exported at 2× for sharp screens) in Hebrew and English.
// `node scripts/make-cover.mjs` → brand/linkedin-cover-{he,en}.png
// LinkedIn places the page logo over the bottom-left of the cover and crops the sides on phones,
// so the left ~280px only carries decoration and the text sits in the centre-right.
import { mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = resolve(import.meta.dirname, '..');
const W = 1128, H = 191;
const font = (w, sub) => `url('file://${join(root, 'public/fonts', `IBMPlexSansHebrew-${w}-${sub}.woff2`)}') format('woff2')`;
const faces = [300, 400, 600].map((w) => `
@font-face { font-family: Plex; font-weight: ${w}; src: ${font(w, 'hebrew')}; unicode-range: U+0590-05FF, U+FB1D-FB4F; }
@font-face { font-family: Plex; font-weight: ${w}; src: ${font(w, 'latin')}; unicode-range: U+0000-00FF, U+2010-2027; }`).join('');
const hex = 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)';

const T = {
  he: { dir: 'rtl', h: 'שותף אחד. מהאתגר העסקי ועד AI שעובד.', s: 'אסטרטגיה, פיתוח, חיבור למערכות והטמעה, באחריות של גורם אחד' },
  en: { dir: 'ltr', h: 'One partner. End-to-end AI transformation.', s: 'Strategy, engineering, integration and adoption, with one accountable partner' },
};

const page = (lang) => { const t = T[lang], rtl = t.dir === 'rtl';
  return `<!doctype html><html lang="${lang}" dir="${t.dir}"><head><meta charset="utf-8"><style>${faces}
* { margin: 0; box-sizing: border-box; } html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
body { background: #dce4d8; color: #202820; font-family: Plex, sans-serif; position: relative; }
.cell { position: absolute; clip-path: ${hex}; aspect-ratio: 1.14; }
/* Decoration on the left, under where LinkedIn puts the logo. */
.c1 { width: 250px; left: -70px; top: -60px; background: #e8ad36; opacity: .9; }
.c2 { width: 150px; left: 150px; top: 95px; background: #d9d5e6; }
.c3 { width: 64px; left: 128px; top: 40px; background: #fffdf8; }
.t { position: absolute; left: 330px; right: 100px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; gap: 10px; text-align: ${rtl ? 'right' : 'left'}; }
h1 { ${rtl ? 'font: 300 38px/1.15 Plex; letter-spacing: -.3px;' : "font: 400 40px/1.05 Georgia, 'Times New Roman', serif; letter-spacing: -1.4px;"} }
p { font-size: 17px; color: #465247; }
p b { color: #202820; font-weight: 600; }
</style></head><body><div class="cell c1"></div><div class="cell c2"></div><div class="cell c3"></div>
<div class="t"><h1>${t.h}</h1><p>${t.s} · <b dir="ltr">beenco.tech</b></p></div></body></html>`; };

const out = join(root, 'brand');
await mkdir(out, { recursive: true });
const tmp = await mkdtemp(join(tmpdir(), 'cover-'));
for (const lang of ['he', 'en']) {
  const file = join(tmp, lang + '.html'), png = join(out, `linkedin-cover-${lang}.png`);
  await writeFile(file, page(lang));
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--force-device-scale-factor=2',
    `--window-size=${W},${H}`, '--virtual-time-budget=3000', `--screenshot=${png}`, 'file://' + file], { stdio: 'ignore' });
  console.log('wrote', png);
}
