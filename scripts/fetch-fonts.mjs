// One-off: self-host Frank Ruhl Libre + Heebo (hebrew + latin subsets) from Google Fonts.
import { writeFile } from 'node:fs/promises';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36';
const url = 'https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700&family=Heebo:wght@400;500;700&display=swap';
const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
const blocks = [...css.matchAll(/\/\* ([\w-]+) \*\/\s*@font-face\s*\{([^}]+)\}/g)];
let out = '';
for (const [, subset, b] of blocks) {
  if (!['hebrew', 'latin'].includes(subset)) continue;
  const fam = /font-family: '([^']+)'/.exec(b)[1];
  const w = /font-weight: (\d+)/.exec(b)[1];
  const src = /url\((https:[^)]+)\)/.exec(b)[1];
  const file = `${fam.replace(/\s/g, '')}-${w}-${subset}.woff2`;
  await writeFile(`public/fonts/${file}`, Buffer.from(await (await fetch(src)).arrayBuffer()));
  const range = /unicode-range: ([^;]+);/.exec(b)[1];
  out += `@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url(/fonts/${file}) format('woff2');unicode-range:${range}}\n`;
}
await writeFile('src/fonts.css', out);
console.log(out.split('\n').length - 1, 'faces');
