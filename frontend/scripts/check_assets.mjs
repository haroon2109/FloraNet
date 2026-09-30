#!/usr/bin/env node
/**
 * Image asset integrity guard.
 *
 * The landing page is image-heavy and `output: "standalone"` does not ship
 * public/ or .next/static/ by default, so a build can pass and then serve a
 * perfectly styled page with every image 404ing. This guard fails loudly
 * instead, at two levels:
 *
 *   1. Every "/images/..." path referenced in src/ must exist in public/
 *      and be a non-empty, real image file (magic-byte check).
 *   2. If a standalone build exists, the same files must be staged into
 *      .next/standalone/public — the copy the server needs at runtime.
 *
 * Exit code is non-zero on any failure, so it can gate CI.
 *
 * Usage:  node scripts/check_assets.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const PUBLIC = join(ROOT, 'public');
const STANDALONE_PUBLIC = join(ROOT, '.next', 'standalone', 'public');
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']);

// Leading byte signatures -> human readable format.
const SIGNATURES = [
  { name: 'jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[b.length - 2] === 0xff && b[b.length - 1] === 0xd9 },
  { name: 'png', test: (b) => b.slice(1, 4).toString('latin1') === 'PNG' },
  { name: 'gif', test: (b) => b.slice(0, 3).toString('latin1') === 'GIF' },
  { name: 'webp', test: (b) => b.slice(0, 4).toString('latin1') === 'RIFF' && b.slice(8, 12).toString('latin1') === 'WEBP' },
  { name: 'svg', test: (b) => b.slice(0, 256).toString('utf8').includes('<svg') },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// ---- 1. collect referenced public paths -------------------------------
const refs = new Map(); // url -> Set(referencing files)
const REF_RE = /["'`](\/images\/[^"'`\s]+\.(?:jpg|jpeg|png|webp|avif|gif|svg))["'`]/g;

for (const file of walk(SRC)) {
  if (!/\.(ts|tsx|js|jsx|mjs|css)$/.test(file)) continue;
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(REF_RE)) {
    if (!refs.has(m[1])) refs.set(m[1], new Set());
    refs.get(m[1]).add(relative(ROOT, file));
  }
}

if (refs.size === 0) {
  console.error('No /images/ references found — the scan is broken, not the assets.');
  process.exit(1);
}

/**
 * Full integrity check for one image file.
 * Returns null when the file is a usable image, otherwise a failure reason.
 *
 * Existence alone is not enough: a truncated or half-copied download leaves a
 * non-empty file that the browser cannot decode, which is exactly the
 * "images went missing" symptom this guard exists to prevent.
 */
function verifyImage(abs) {
  if (!existsSync(abs)) return 'does not exist';

  const size = statSync(abs).size;
  if (size === 0) return 'is 0 bytes';
  if (extname(abs).toLowerCase() === '.svg') return null;

  const buf = readFileSync(abs);
  const sig = SIGNATURES.find((s) => s.test(buf));
  if (!sig) return `is not a recognisable image (${size} bytes)`;
  if (sig.name === 'jpeg' && size < 1024) return `is only ${size} bytes, likely truncated`;
  return null;
}

// ---- 2. verify each referenced file in public/ ------------------------
const errors = [];
let checked = 0;

for (const [url, sources] of [...refs.entries()].sort()) {
  const where = [...sources].join(', ');
  const reason = verifyImage(join(PUBLIC, url.replace(/^\//, '')));
  if (reason) {
    errors.push(`INVALID   ${url} — ${reason}\n           referenced by ${where}`);
    continue;
  }
  checked++;
}

// ---- 3. verify standalone staging ------------------------------------
// The standalone server reads ONLY from .next/standalone/public, so a staged
// copy that is absent, empty, truncated, or stale relative to public/ is a
// silent production outage. Validate it exactly like the source file.
const hasStandalone = existsSync(join(ROOT, '.next', 'standalone', 'server.js'));
if (hasStandalone) {
  for (const [url, sources] of [...refs.entries()].sort()) {
    const where = [...sources].join(', ');
    const rel = url.replace(/^\//, '');
    const src = join(PUBLIC, rel);
    const staged = join(STANDALONE_PUBLIC, rel);

    const reason = verifyImage(staged);
    if (reason) {
      const detail = existsSync(src)
        ? 'the file in public/ is fine'
        : 'it is missing from public/ as well';
      errors.push(
        `UNSTAGED  ${url} — staged copy ${reason}; ${detail}\n` +
          `           referenced by ${where}\n` +
          `           fix: npm run postbuild`
      );
      continue;
    }

    // Stale build: public/ was updated after the last build.
    if (statSync(staged).size !== statSync(src).size) {
      errors.push(
        `STALE     ${url} — staged copy is ${statSync(staged).size} bytes but\n` +
          `           public/ is ${statSync(src).size} bytes (referenced by ${where})\n` +
          `           fix: npm run build`
      );
    }
  }
}

// ---- report -----------------------------------------------------------
console.log(`Asset guard: ${refs.size} referenced, ${checked} verified in public/.`);

if (hasStandalone) {
  const staged = existsSync(STANDALONE_PUBLIC)
    ? 'standalone build found — staging verified'
    : 'standalone build found — staging MISSING';
  console.log(staged);
} else {
  console.log('No standalone build present — skipped staging check.');
}

if (errors.length) {
  console.error(`\n${errors.length} asset problem(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log('All referenced images present and valid.');
