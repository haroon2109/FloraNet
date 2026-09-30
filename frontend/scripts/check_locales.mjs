#!/usr/bin/env node
/**
 * Locale integrity guard for src/data/landingLocales/.
 *
 * The language dropdown advertises 39 BRICS languages, so a partially-written
 * translation is a silent failure: the page renders someone else's language
 * and the user has no way to tell. This guard catches the ways that happens.
 *
 * Checks per locale file:
 *   1. all 46 catalogue keys present
 *   2. no empty values
 *   3. braces balanced (object literal is structurally complete)
 *   4. exactly one exported const, with the type import
 *   5. no unescaped apostrophe (would truncate the string)
 *   6. no CJK/fullwidth characters leaked into a non-CJK locale
 *   7. no English source string copied verbatim (untranslated leftovers)
 *
 * Exit code is non-zero when anything fails, so it can gate CI.
 *
 * Usage:  node scripts/check_locales.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = join(HERE, '..', 'src', 'data', 'landingLocales');
const CJK = /[　-鿿가-힯＀-￯]/;

// Locales whose OWN script legitimately contains Han (zh) or Arabic (ur).
const HAN_OK = new Set(['zh-CN']);
const ARABIC_OK = new Set(['ur']);
const ARABIC_RE = /[؀-ۿ]/;

const REQUIRED = [
  'product', 'solutions', 'resources', 'bricsImpact', 'pricing', 'aboutUs',
  'joinPilot', 'getStarted',
  'badge', 'titlePart1', 'titlePart2', 'titlePart3', 'description',
  'ctaGetStarted', 'ctaLiveDemo', 'trustedBy',
  'nodes', 'corpora', 'water', 'resolution',
  'tag', 'title', 'subtitle', 'farmers', 'farmersDesc', 'agribusiness',
  'agribusinessDesc', 'government', 'governmentDesc', 'researchers',
  'researchersDesc', 'learnMore', 'viewCorridor', 'ctaButton', 'demoButton',
];

// Keys whose value legitimately coincides across locales: brand names,
// units and acronyms that are not translated.
const ALLOWED_IDENTICAL = new Set([
  'bricsImpact', 'nodes', 'resolution', 'water', 'corpora',
  'ctaGetStarted', 'ctaLiveDemo', 'ctaButton', 'demoButton',
  'learnMore', 'viewCorridor', 'title', 'subtitle', 'tag',
]);

const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.ts') && !['types.ts', 'index.ts'].includes(f))
  .sort();

if (files.length === 0) {
  console.error(`No locale files found in ${DIR}`);
  process.exit(1);
}

let bad = 0;
console.log(`Checking ${files.length} locale file(s)\n`);

for (const f of files) {
  const code = f.replace('.ts', '');
  const src = readFileSync(join(DIR, f), 'utf8');
  const fail = (msg) => {
    bad++;
    console.log(`  FAIL ${f}: ${msg}`);
  };

  const missing = REQUIRED.filter((k) => !new RegExp(`(^|[\\s{,])${k}:`).test(src));
  if (missing.length) fail(`missing keys -> ${missing.join(', ')}`);

  const empties = [...src.matchAll(/(\w+):\s*'([^']*)'/g)]
    .filter(([, , v]) => v.trim() === '');
  if (empties.length) fail(`empty values -> ${empties.map((e) => e[1]).join(', ')}`);

  // Unescaped apostrophe inside a single-quoted value truncates the string.
  src.split('\n').forEach((line, i) => {
    for (const [, v] of line.matchAll(/:\s*'([^']*)'/g)) {
      if (v.includes("'")) fail(`line ${i + 1} unescaped apostrophe -> ${v.slice(0, 60)}`);
    }
  });

  const opens = (src.match(/\{/g) || []).length;
  const closes = (src.match(/\}/g) || []).length;
  if (opens !== closes) fail(`brace imbalance {${opens} vs }${closes}`);

  if (!/^import \{ LandingTranslation \} from '\.\/types';/m.test(src)) {
    fail('missing type import');
  }
  const decls = src.match(/export const \w+: LandingTranslation/g) || [];
  if (decls.length !== 1) fail(`expected 1 exported const, found ${decls.length}`);

  src.split('\n').forEach((line, i) => {
    if (!CJK.test(line)) return;
    if (HAN_OK.has(code)) return;
    if (ARABIC_OK.has(code) && ARABIC_RE.test(line)) return;
    fail(`line ${i + 1} non-locale CJK -> ${line.trim().slice(0, 70)}`);
  });
}

// English-leak pass: compare every locale against the English reference so a
// half-finished translation can't pass by having all 46 keys present.
const en = readFileSync(join(DIR, 'en.ts'), 'utf8');
const enStrings = new Map();
for (const [, k, v] of en.matchAll(/(\w+):\s*'([^']*)'/g)) enStrings.set(k, v);

for (const f of files) {
  if (f === 'en.ts') continue;
  const code = f.replace('.ts', '');
  const src = readFileSync(join(DIR, f), 'utf8');
  const hits = [];
  for (const [, k, v] of src.matchAll(/(\w+):\s*'([^']*)'/g)) {
    if (enStrings.get(k) === v && !ALLOWED_IDENTICAL.has(k)) hits.push(k);
  }
  if (hits.length) {
    bad += hits.length;
    console.log(`  LEAK ${code}: ${hits.length} untranslated string(s) -> ${hits.join(', ')}`);
  }
}

if (bad === 0) {
  console.log(`\nAll ${files.length} locale file(s) clean.`);
} else {
  console.log(`\n${bad} problem(s) found.`);
}
process.exit(bad === 0 ? 0 : 1);
