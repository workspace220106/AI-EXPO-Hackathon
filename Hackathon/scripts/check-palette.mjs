// Palette guard: every colour literal under src/ must be one of the seven locked colours.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ALLOWED = new Set([
  '#fdd013', '#6aeefd', '#354093', '#c6fefe', '#f7be76', '#e31902', '#ffffff', '#fff',
]);

const HEX = /#[0-9a-f]{3,8}\b/gi;
const FUNC = /\b(?:rgba?|hsla?)\([^)]*\)/gi;

// The 148 CSS Color Module Level 4 named colour keywords. Deliberately excludes the
// CSS-wide keywords transparent / currentcolor / inherit / initial / unset / none,
// which are legitimate values and must never be flagged.
const NAMED_COLORS = new Set([
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black',
  'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse',
  'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan',
  'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta',
  'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen',
  'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink',
  'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen',
  'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'grey', 'green',
  'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender',
  'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
  'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon',
  'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue',
  'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine',
  'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue',
  'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream',
  'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange',
  'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred',
  'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple',
  'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell',
  'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen',
  'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white',
  'whitesmoke', 'yellow', 'yellowgreen',
]);

const isNamedColor = (tok) => NAMED_COLORS.has(tok.toLowerCase());

// Every CSS declaration value: the text after a `:` up to the next `;`, `}` or `{`
// (or end of string), split into whitespace/comma/paren-separated tokens. Property
// names (the part before the `:`) are never captured, so `--color-red: #E31902`
// only ever yields tokens from `#E31902` — "red" in the property name is untouched.
function cssValueTokens(text) {
  const tokens = [];
  const DECL = /:([^;{}]*)/g;
  let m;
  while ((m = DECL.exec(text))) {
    for (const tok of m[1].split(/[\s,()]+/)) if (tok) tokens.push(tok);
  }
  return tokens;
}

// Raw contents of style="..."/style='...' attributes, for scanning HTML the same way.
function styleAttrValues(text) {
  const values = [];
  const ATTR = /style\s*=\s*"([^"]*)"|style\s*=\s*'([^']*)'/gi;
  let m;
  while ((m = ATTR.exec(text))) values.push(m[1] ?? m[2]);
  return values;
}

// Raw contents of <style>...</style> blocks, for scanning HTML the same way.
function styleBlockContents(text) {
  const values = [];
  const BLOCK = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = BLOCK.exec(text))) values.push(m[1]);
  return values;
}

// Every quoted string literal inside a JSX inline `style={{ ... }}` object. Nothing
// outside such a block is ever scanned, and unquoted references (e.g. PALETTE.navy)
// are ignored since they aren't string literals.
function styleObjectStrings(text) {
  const strings = [];
  const BLOCK = /style=\{\{([\s\S]*?)\}\}/g;
  const STR = /'([^']*)'|"([^"]*)"/g;
  let block;
  while ((block = BLOCK.exec(text))) {
    STR.lastIndex = 0;
    let s;
    while ((s = STR.exec(block[1]))) strings.push(s[1] ?? s[2]);
  }
  return strings;
}

export function findViolations(text, filename = '') {
  const out = [];
  for (const m of text.match(HEX) ?? []) {
    if (/^#\d{4}$/.test(m)) continue; // runner ids are "#" + four decimal digits (#0247), never a colour
    if (!ALLOWED.has(m.toLowerCase())) out.push(m);
  }
  for (const m of text.match(FUNC) ?? []) out.push(m);

  const lower = filename.toLowerCase();
  if (/\.(ts|tsx|mjs)$/.test(lower)) {
    // TS/TSX/mjs mode: only quoted string literals inside style={{ }} blocks count.
    out.push(...styleObjectStrings(text).filter(isNamedColor));
  } else if (lower.endsWith('.html')) {
    // HTML mode: <style> blocks and style="" attributes, each scanned as CSS.
    for (const block of styleBlockContents(text)) out.push(...cssValueTokens(block).filter(isNamedColor));
    for (const attr of styleAttrValues(text)) out.push(...cssValueTokens(attr).filter(isNamedColor));
  } else {
    // CSS mode (.css, or no filename given): scan every declaration value directly.
    out.push(...cssValueTokens(text).filter(isNamedColor));
  }
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
    const v = findViolations(readFileSync(file, 'utf8'), file);
    if (v.length) { bad += v.length; console.error(`${file}: ${v.join(', ')}`); }
  }
  if (bad) { console.error(`\n✖ ${bad} off-palette colour literal(s).`); process.exit(1); }
  console.log('✔ palette clean');
}
