// Palette guard: every colour literal under src/ must be one of the seven locked colours.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ALLOWED = new Set([
  '#fdd013', '#6aeefd', '#354093', '#c6fefe', '#f7be76', '#e31902', '#ffffff', '#fff',
]);

const HEX = /#[0-9a-f]{3,8}\b/gi;
const FUNC = /\b(?:rgba?|hsla?)\([^)]*\)/gi;

export function findViolations(text) {
  const out = [];
  for (const m of text.match(HEX) ?? []) if (!ALLOWED.has(m.toLowerCase())) out.push(m);
  for (const m of text.match(FUNC) ?? []) out.push(m);
  return out;
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (['.ts', '.tsx', '.css', '.html', '.mjs'].includes(extname(p))) files.push(p);
  }
  return files;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const root = join(process.cwd(), 'src');
  let bad = 0;
  for (const file of walk(root)) {
    const v = findViolations(readFileSync(file, 'utf8'));
    if (v.length) { bad += v.length; console.error(`${file}: ${v.join(', ')}`); }
  }
  if (bad) { console.error(`\n✖ ${bad} off-palette colour literal(s).`); process.exit(1); }
  console.log('✔ palette clean');
}
