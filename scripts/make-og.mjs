// Renders the 1200×630 share images (og:image) for both languages with headless Chrome.
// Run after changing the headline or brand: `node scripts/make-og.mjs` → public/og/og-{he,en}.png
// Uses the site's own colours, mark and self-hosted Hebrew font; nothing is fetched from the network.
import { mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import he from '../src/content/he.mjs';
import en from '../src/content/en.mjs';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = resolve(import.meta.dirname, '..');
const font = (w, sub) => `url('file://${join(root, 'public/fonts', `IBMPlexSansHebrew-${w}-${sub}.woff2`)}') format('woff2')`;
const faces = [300, 400, 500, 600].map((w) => `
@font-face { font-family: Plex; font-weight: ${w}; src: ${font(w, 'hebrew')}; unicode-range: U+0590-05FF, U+FB1D-FB4F; }
@font-face { font-family: Plex; font-weight: ${w}; src: ${font(w, 'latin')}; unicode-range: U+0000-00FF, U+2010-2027; }`).join('');

const hex = 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)';
const mark = `<svg viewBox="0 0 100 100" width="76" height="76"><path d="M28 13v62c0 8 6 14 14 14h20c15 0 27-12 27-27 0-14-11-25-25-26H44" fill="none" stroke="#202820" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M45 36l13-8 13 8v16l-13 8-13-8z" fill="#e8ad36"/></svg>`;

function page(c) {
  const rtl = c.dir === 'rtl';
  const T = {
    he: { h1: 'שותף אחד.<br>מהאתגר העסקי<br>ועד AI שעובד.', by: 'בהובלת ערן נחום, 22 שנה בהייטק' },
    en: { h1: 'One partner.<br>End-to-end AI<br>transformation.', by: 'Led by Eran Nachum, 22 years in high-tech' },
  }[c.lang];
  return `<!doctype html><html lang="${c.lang}" dir="${c.dir}"><head><meta charset="utf-8"><style>${faces}
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { background: #dce4d8; color: #202820; font-family: Plex, sans-serif; position: relative; }
.cell { position: absolute; clip-path: ${hex}; aspect-ratio: 1.14; }
.c1 { width: 520px; inset-inline-end: -150px; top: -70px; background: #e8ad36; opacity: .9; }
.c2 { width: 270px; inset-inline-end: 150px; top: 410px; background: #d9d5e6; }
.c3 { width: 120px; inset-inline-end: 130px; top: 470px; background: #fffdf8; }
.in { position: absolute; inset: 64px 72px; display: flex; flex-direction: column; }
.lock { display: flex; align-items: center; gap: 18px; direction: ltr; align-self: flex-start; }
.name { font: 400 54px/0.9 Georgia, 'Times New Roman', serif; letter-spacing: -2.4px; }
.sub { font: 600 13px/1.25 Plex; letter-spacing: 1.4px; margin-top: 8px; }
h1 { margin-top: auto; font-weight: 300; ${rtl ? 'font: 300 74px/1.1 Plex; letter-spacing: -0.5px;' : "font: 400 78px/1.0 Georgia, 'Times New Roman', serif; letter-spacing: -3px;"} max-width: 760px; }
.foot { margin-top: 34px; display: flex; gap: 28px; align-items: baseline; font-size: 26px; }
.foot b { font-weight: 600; }
.foot span { color: #465247; }
</style></head><body>
<div class="cell c1"></div><div class="cell c2"></div><div class="cell c3"></div>
<div class="in">
  <div class="lock">${mark}<div><div class="name">bee &amp; co.</div><div class="sub">AI SOLUTIONS &amp;<br>TRANSFORMATION</div></div></div>
  <h1>${T.h1}</h1>
  <div class="foot"><b dir="ltr">beenco.tech</b><span>${T.by}</span></div>
</div></body></html>`;
}

const out = join(root, 'public/og');
await mkdir(out, { recursive: true });
const tmp = await mkdtemp(join(tmpdir(), 'og-'));
for (const c of [he, en]) {
  const html = join(tmp, `og-${c.lang}.html`), png = join(out, `og-${c.lang}.png`);
  await writeFile(html, page(c));
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--force-device-scale-factor=1',
    '--window-size=1200,630', '--virtual-time-budget=3000', `--screenshot=${png}`, 'file://' + html], { stdio: 'ignore' });
  console.log('wrote', png);
}
