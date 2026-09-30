#!/usr/bin/env node
/**
 * Stage public/ and .next/static/ into the standalone server bundle.
 *
 * `output: "standalone"` (see next.config.ts) emits a SELF-CONTAINED server
 * in .next/standalone/, but Next.js deliberately does NOT copy the static
 * asset directories into it. Anything served from public/ (images, manifest,
 * sw.js, favicons) therefore 404s when you run:
 *
 *     node .next/standalone/server.js
 *
 * which is exactly what `next start` tells you to do, and what the Dockerfile
 * does by hand:
 *
 *     COPY --from=builder /app/public            ./public
 *     COPY --from=builder /app/.next/static      ./.next/static
 *
 * The page HTML still renders (it is inlined into the server bundle), so the
 * failure looks like "the images went missing" rather than a server error.
 * This script performs the same two copies so a local standalone run matches
 * the Docker image.
 *
 * Wired to `postbuild`, so `npm run build` always produces a runnable bundle.
 * Safe to re-run: it syncs public/ and overwrites static/ in place.
 *
 * Usage:  node scripts/prepare-standalone.mjs
 */
import { cpSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STANDALONE = join(ROOT, '.next', 'standalone');
const PUBLIC = join(ROOT, 'public');
const STATIC = join(ROOT, '.next', 'static');

function copyDir(from, to) {
  if (!existsSync(from)) {
    console.warn(`  ! skipped (missing): ${from}`);
    return false;
  }
  rmSync(to, { recursive: true, force: true });
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
  return true;
}

if (!existsSync(join(STANDALONE, 'server.js'))) {
  console.error(
    'No standalone build found at .next/standalone/server.js.\n' +
      'Run `npm run build` first.'
  );
  process.exit(1);
}

console.log('Staging static assets into .next/standalone ...');

const publicOk = copyDir(PUBLIC, join(STANDALONE, 'public'));
const staticOk = copyDir(STATIC, join(STANDALONE, '.next', 'static'));

if (!publicOk || !staticOk) {
  console.error('\nFailed to stage one or more asset directories.');
  process.exit(1);
}

// Verify the exact asset that regressed in production, so a partial copy can
// never pass silently again.
const hero = join(STANDALONE, 'public', 'images', 'landing', 'hero_farm_isometric.jpg');
if (!existsSync(hero) || statSync(hero).size === 0) {
  console.error(`\nSanity check failed: ${hero} is missing or empty.`);
  process.exit(1);
}

console.log('  + public/          -> .next/standalone/public');
console.log('  + .next/static/    -> .next/standalone/.next/static');
console.log(`  + verified hero image (${statSync(hero).size} bytes)`);
console.log('\nStandalone bundle ready: node .next/standalone/server.js');
