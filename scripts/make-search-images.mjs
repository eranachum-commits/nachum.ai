// Image assets for Google Search ads. Google rejects overlaid text on these, so they carry no words:
// the brand mark and the honeycomb cells, on sage and on night.
// Sizes Google asks for: square 1:1 (1200×1200) and landscape 1.91:1 (1200×628).
// `node scripts/make-search-images.mjs` → marketing/ads/search-images/{sage,night}-{square,landscape}.png
import { mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = resolve(import.meta.dirname, '..');
const SIZES = { square: [1200, 1200], landscape: [1200, 628] };
const THEMES = {
  sage: { bg: '#dce4d8', ink: '#202820', cell: '#d9d5e6', soft: '#fffdf8' },
  night: { bg: '#25212a', ink: '#f5f0e6', cell: '#534a58', soft: '#3a3340' },
};
const hex = 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)';
const mark = (s, ink) => `<svg viewBox="8.5 1 100 100" width="${s}" height="${s}"><path d="M28 13v62c0 8 6 14 14 14h20c15 0 27-12 27-27 0-14-11-25-25-26H44" fill="none" stroke="${ink}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M45 36l13-8 13 8v16l-13 8-13-8z" fill="#e8ad36"/></svg>`;

function page(t, [W, H]) {
  const wide = W > H, m = wide ? 300 : 420; // mark size
  // Cells sit at the edges, clear of the centre where Google may crop.
  const cells = wide
    ? [[260, -90, -80, '#e8ad36'], [150, 1010, 470, t.cell], [90, 120, 470, t.soft], [120, 1060, 40, t.soft]]
    : [[380, -130, -110, '#e8ad36'], [240, 940, 960, t.cell], [140, 120, 1010, t.soft], [170, 980, 120, t.soft]];
  return `<!doctype html><html><head><meta charset="utf-8"><style>
* { margin: 0; } html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: ${t.bg}; position: relative; }
.c { position: absolute; clip-path: ${hex}; aspect-ratio: 1.14; }
.m { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
</style></head><body>${cells.map(([w, x, y, bg]) => `<div class="c" style="width:${w}px;left:${x}px;top:${y}px;background:${bg}"></div>`).join('')}
<div class="m">${mark(m, t.ink)}</div></body></html>`;
}

const out = join(root, 'marketing/ads/search-images');
await mkdir(out, { recursive: true });
const tmp = await mkdtemp(join(tmpdir(), 'search-img-'));
for (const [theme, t] of Object.entries(THEMES)) for (const [size, dims] of Object.entries(SIZES)) {
  const name = `${theme}-${size}`, file = join(tmp, name + '.html'), png = join(out, name + '.png');
  await writeFile(file, page(t, dims));
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--window-size=${dims[0]},${dims[1]}`, '--virtual-time-budget=1000', `--screenshot=${png}`, 'file://' + file], { stdio: 'ignore' });
  console.log('wrote', png);
}
