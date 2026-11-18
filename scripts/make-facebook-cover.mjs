// Renders the Facebook Page cover (820×312 display size, exported at 2× = 1640×624) in Hebrew and English.
// `node scripts/make-facebook-cover.mjs` → brand/facebook-cover-{he,en}.png
// Facebook shows 820×312 on desktop but crops to the central 640px on phones, and places the profile picture over the
// bottom-left. So decoration lives at the far left, and the text sits inside x 230–730, in the upper two thirds.
import { mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = resolve(import.meta.dirname, '..');
const W = 820, H = 312;
const font = (w, sub) => `url('file://${join(root, 'public/fonts', `IBMPlexSansHebrew-${w}-${sub}.woff2`)}') format('woff2')`;
const faces = [300, 400, 600].map((w) => `
@font-face { font-family: Plex; font-weight: ${w}; src: ${font(w, 'hebrew')}; unicode-range: U+0590-05FF, U+FB1D-FB4F; }
@font-face { font-family: Plex; font-weight: ${w}; src: ${font(w, 'latin')}; unicode-range: U+0000-00FF, U+2010-2027; }`).join('');
const hex = 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)';

const T = {
  he: { dir: 'rtl', h: 'שותף אחד.<br>מהאתגר העסקי ועד AI&nbsp;שעובד.', s: 'אסטרטגיה, פיתוח, חיבור למערכות והטמעה' },
  en: { dir: 'ltr', h: 'One partner.<br>End&#8209;to&#8209;end AI transformation.', s: 'Strategy, engineering, integration and adoption' },
};

const page = (lang) => { const t = T[lang], rtl = t.dir === 'rtl';
  return `<!doctype html><html lang="${lang}" dir="${t.dir}"><head><meta charset="utf-8"><style>${faces}
* { margin: 0; box-sizing: border-box; } html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
body { background: #dce4d8; color: #202820; font-family: Plex, sans-serif; position: relative; }
.cell { position: absolute; clip-path: ${hex}; aspect-ratio: 1.14; }
.c1 { width: 300px; left: -110px; top: -80px; background: #e8ad36; opacity: .9; }
.c2 { width: 170px; left: 120px; top: 150px; background: #d9d5e6; }
.c3 { width: 70px; left: 70px; top: 90px; background: #fffdf8; }
.t { position: absolute; left: ${rtl ? 230 : 290}px; right: ${rtl ? 100 : 56}px; top: 0; height: 250px; display: flex; flex-direction: column; justify-content: center; gap: 14px; text-align: ${rtl ? 'right' : 'left'}; }
h1 { ${rtl ? 'font: 300 36px/1.2 Plex; letter-spacing: -.3px;' : "font: 400 34px/1.1 Georgia, 'Times New Roman', serif; letter-spacing: -1.4px;"} text-wrap: balance; }
p { font-size: 18px; color: #465247; }
p b { color: #202820; font-weight: 600; }
</style></head><body><div class="cell c1"></div><div class="cell c2"></div><div class="cell c3"></div>
<div class="t"><h1>${t.h}</h1><p>${t.s}</p><p><b dir="ltr">beenco.tech</b></p></div></body></html>`; };

const out = join(root, 'brand');
await mkdir(out, { recursive: true });
const tmp = await mkdtemp(join(tmpdir(), 'fbcover-'));
for (const lang of ['he', 'en']) {
  const file = join(tmp, lang + '.html'), png = join(out, `facebook-cover-${lang}.png`);
  await writeFile(file, page(lang));
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--force-device-scale-factor=2',
    `--window-size=${W},${H}`, '--virtual-time-budget=3000', `--screenshot=${png}`, 'file://' + file], { stdio: 'ignore' });
  console.log('wrote', png);
}
