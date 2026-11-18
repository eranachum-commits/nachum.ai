// Renders the PNG icons from the favicon's mark with headless Chrome:
// public/apple-touch-icon.png (180×180, iOS home screen) and public/icon-512.png (logo for structured data).
// Run after changing the mark: `node scripts/make-icons.mjs`. Square corners: iOS and Google round them themselves.
import { mkdtemp, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = resolve(import.meta.dirname, '..');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#dce4d8"/><g transform="translate(16 16) scale(.8) translate(-16 -16)"><path d="M8 4v19c0 3 2 5 5 5h6a9 9 0 0 0 0-18h-6" fill="none" stroke="#202820" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="m13 10 4-2.4 4 2.4v5l-4 2.4-4-2.4z" fill="#e8ad36"/></g></svg>`;

const dir = await mkdtemp(join(tmpdir(), 'icons-'));
for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-512.png', 512]]) {
  const html = join(dir, `${size}.html`);
  await writeFile(html, `<!doctype html><style>*{margin:0}html,body{width:${size}px;height:${size}px;overflow:hidden}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${size},${size}`, `--screenshot=${join(root, 'public', name)}`, `file://${html}`], { stdio: 'ignore' });
  console.log('wrote public/' + name);
}
