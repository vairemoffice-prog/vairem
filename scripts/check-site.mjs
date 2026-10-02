// Static checks for the VAIREM site. No dependencies: run with `node scripts/check-site.mjs`.
// Fails (exit 1) on broken local links/assets/anchors, missing basics (title,
// description, lang, one <h1>, alt text) and duplicate ids.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const pages = readdirSync(root).filter(f => f.endsWith('.html')).sort();
const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);

const stripScripts = html => html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
const idsOf = html => [...stripScripts(html).matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const isExternal = u => /^(https?:)?\/\//i.test(u) || /^(mailto|tel|data|javascript):/i.test(u);

const cache = new Map();
const read = f => cache.get(f) ?? (cache.set(f, readFileSync(f, 'utf8')), cache.get(f));

for (const page of pages) {
  const html = read(join(root, page));
  const body = stripScripts(html);

  if (!/<html[^>]*\slang="[^"]+"/.test(html)) fail(page, 'missing <html lang>');
  if (!/<title>[^<]+<\/title>/.test(html)) fail(page, 'missing <title>');
  if (!/<meta name="description" content="[^"]+"/.test(html)) fail(page, 'missing meta description');
  const h1 = (body.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(page, `expected exactly one <h1>, found ${h1}`);

  for (const m of body.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(m[0])) fail(page, `<img> without alt: ${m[0].slice(0, 80)}`);
  }

  const ids = idsOf(html);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  for (const id of new Set(dup)) fail(page, `duplicate id "${id}"`);

  // Local href/src (data-src is optional media and is intentionally not checked).
  for (const m of body.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    const url = m[1].trim();
    if (!url || isExternal(url)) continue;
    const [pathPart, hash] = url.split('#');
    const clean = pathPart.split('?')[0];
    const target = clean ? resolve(root, clean) : join(root, page);
    if (!existsSync(target)) { fail(page, `broken link/asset "${url}"`); continue; }
    if (hash && target.endsWith('.html')) {
      if (!idsOf(read(target)).includes(hash)) fail(page, `anchor "#${hash}" not found in ${clean || page}`);
    }
  }
}

// url(...) references in CSS.
const cssFile = join(root, 'css/styles.css');
for (const m of read(cssFile).matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
  const u = m[1];
  if (isExternal(u) || u.startsWith('#')) continue;
  if (!existsSync(resolve(dirname(cssFile), u.split('?')[0]))) fail('css/styles.css', `missing file "${u}"`);
}

if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n` + errors.map(e => ' - ' + e).join('\n'));
  process.exit(1);
}
console.log(`OK: ${pages.length} pages checked, no problems.`);
