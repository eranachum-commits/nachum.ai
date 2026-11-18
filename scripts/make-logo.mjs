// Renders square brand logos (e.g. the LinkedIn Company Page logo) with headless Chrome.
// `node scripts/make-logo.mjs` → brand/logo-300.png (mark only) and brand/logo-300-wordmark.png
import { mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = resolve(import.meta.dirname, '..');
const S = 300;
const mark = (size) => `<svg viewBox="8.5 1 100 100" width="${size}" height="${size}"><path d="M28 13v62c0 8 6 14 14 14h20c15 0 27-12 27-27 0-14-11-25-25-26H44" fill="none" stroke="#202820" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M45 36l13-8 13 8v16l-13 8-13-8z" fill="#e8ad36"/></svg>`;
const font = (w) => `url('file://${join(root, 'public/fonts', `IBMPlexSansHebrew-${w}-latin.woff2`)}') format('woff2')`;
const base = `@font-face { font-family: Plex; font-weight: 600; src: ${font(600)}; }
* { margin: 0; box-sizing: border-box; } html, body { width: ${S}px; height: ${S}px; overflow: hidden; }
body { background: #dce4d8; display: grid; place-items: center; color: #202820; }`;

const variants = {
  // Mark only: reads at LinkedIn's small sizes (feed and comments show it at about 48px).
  'logo-300': `<style>${base}</style>${mark(196)}`,
  // Mark with the name, for places that show the logo large.
  'logo-300-wordmark': `<style>${base}
.w { display: grid; justify-items: center; gap: 6px; }
.n { font: 400 50px/1 Georgia, 'Times New Roman', serif; letter-spacing: -2.2px; }
.s { font: 600 10.5px/1.3 Plex, sans-serif; letter-spacing: 1.2px; text-align: center; }</style>
<div class="w">${mark(118)}<div class="n">bee &amp; co.</div><div class="s">AI SOLUTIONS &amp; TRANSFORMATION</div></div>`,
};

const out = join(root, 'brand');
await mkdir(out, { recursive: true });
const tmp = await mkdtemp(join(tmpdir(), 'logo-'));
for (const [name, html] of Object.entries(variants)) {
  const file = join(tmp, name + '.html'), png = join(out, name + '.png');
  await writeFile(file, `<!doctype html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--force-device-scale-factor=1',
    `--window-size=${S},${S}`, '--virtual-time-budget=2000', `--screenshot=${png}`, 'file://' + file], { stdio: 'ignore' });
  console.log('wrote', png);
}
