// Single source of truth for the public address of the site: site.json.
//
// To move the site (e.g. to a custom domain):
//   1. edit "url" in site.json         (no trailing slash, e.g. "https://vairem.pl")
//   2. run  node scripts/apply-site-url.mjs
//   3. commit the result, and redeploy the Cloudflare Worker (see the
//      worker README) — the worker has its own copy of the address.
//
// The script rewrites canonical / og / twitter / JSON-LD URLs, sitemap.xml,
// robots.txt, the Worker's CORS origin and Stripe return URLs, the Worker
// README, and the address in the Telegram teaser. It also adds or removes the
// CNAME file that GitHub Pages needs for a custom domain.
import { readFileSync, writeFileSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const read = f => readFileSync(join(root, f), 'utf8');

const normalize = u => new URL(u.trim()).href.replace(/\/+$/, '');
const want = normalize(JSON.parse(read('site.json')).url);

// The current address is whatever the home page declares as canonical.
const canonical = read('index.html').match(/<link rel="canonical" href="([^"]+)"/)?.[1];
if (!canonical) { console.error('index.html has no canonical link'); process.exit(1); }
const have = normalize(canonical);

if (have === want) { console.log(`Already using ${want} — nothing to do.`); process.exit(0); }

const haveUrl = new URL(have), wantUrl = new URL(want);

// Where the address appears in two forms (full address vs. origin only) a blind
// replace would be ambiguous, so those files are rewritten per context.
const swapAll = (text, from, to) => text.split(from).join(to);
const rewrite = {
  html: t => swapAll(t, have, want),
  txt: t => swapAll(t, have, want),
  worker: t => t
    .replace(/(const ALLOWED_ORIGIN = ')[^']*(')/, `$1${wantUrl.origin}$2`)
    .replace(/(const SITE = ')[^']*(')/, `$1${want}$2`),
  readme: t => swapAll(swapAll(t, `${have}/checkout.html`, `${want}/checkout.html`),
                       `\`${haveUrl.origin}\``, `\`${wantUrl.origin}\``),
  telegram: t => swapAll(t, have, want)
};
const files = [
  ...readdirSync(root).filter(f => f.endsWith('.html')).map(f => [f, rewrite.html]),
  ['sitemap.xml', rewrite.txt],
  ['robots.txt', rewrite.txt],
  ['cloudflare/hubspot-sync-worker/src/index.js', rewrite.worker],
  ['cloudflare/hubspot-sync-worker/README.md', rewrite.readme],
  ['.github/workflows/telegram-teaser.yml', rewrite.telegram]
];

let changed = 0;
for (const [f, fn] of files) {
  const before = read(f), after = fn(before);
  if (after !== before) { writeFileSync(join(root, f), after); changed++; console.log('updated', f); }
}

// GitHub Pages custom domain: CNAME file exists only for non-github.io hosts.
const cname = join(root, 'CNAME');
if (wantUrl.hostname.endsWith('github.io')) {
  if (existsSync(cname)) { rmSync(cname); console.log('removed CNAME'); }
} else {
  writeFileSync(cname, wantUrl.hostname + '\n'); console.log(`wrote CNAME (${wantUrl.hostname})`);
}

console.log(`\n${have}  ->  ${want}  (${changed} files)`);
console.log('Reminder: redeploy the Cloudflare Worker (it has its own copy of the address).');
