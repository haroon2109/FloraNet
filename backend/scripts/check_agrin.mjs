#!/usr/bin/env node
/**
 * AgriN interoperability guard.
 *
 * AgriN (the BARP profile) is only useful if every document FloraNet emits
 * agrees on ONE vocabulary. The codebase previously shipped two incompatible
 * `@context` documents — `http://purl.org/agrin/schema/` in the DPG node and
 * `https://agrin.org/schema/v1/` in the soil router — which is precisely the
 * interoperability failure the standard exists to prevent. Two contexts means
 * ICAR, Embrapa and ARC cannot merge records without bespoke translation.
 *
 * This guard keeps that from coming back:
 *   1. exactly one canonical context definition (app/models/agrin.py)
 *   2. no stray/invented AgriN context IRI anywhere else in the backend
 *   3. the named output types exist as AgriN JSON-LD records
 *   4. every AgriN response carries a resolvable @context
 *
 * Exit code is non-zero on failure, so it can gate CI.
 *
 * Usage:  node scripts/check_agrin.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BACKEND = join(ROOT, 'backend', 'app');
const CANONICAL_CONTEXT_DEF = join(BACKEND, 'models', 'agrin.py');
const AGRIN_ROUTER = join(BACKEND, 'api', 'agrin.py');

// Any AgriN-ish IRI that is not the canonical one.
const STRAY_CONTEXT = /(?:purl\.org\/agrin|agrin\.org\/schema|agrin\.org\/context)/i;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.py$/.test(entry.name)) out.push(full);
  }
  return out;
}

const errors = [];
const notes = [];


// ---- 1. the canonical definition must exist ---------------------------
if (!existsSync(CANONICAL_CONTEXT_DEF)) {
  errors.push(
    `Missing canonical AgriN context: ${relative(ROOT, CANONICAL_CONTEXT_DEF)}\n` +
      `           app/models/agrin.py is the single source of truth for the @context.`
  );
} else {
  const canon = readFileSync(CANONICAL_CONTEXT_DEF, 'utf8');
  for (const required of ['AGRIIN_CONTEXT', 'AGRIIN_CONTEXT_IRI', 'AGRIIN_VERSION', 'agrin_envelope']) {
    if (!canon.includes(required)) {
      errors.push(`Canonical context module does not define \`${required}\`.`);
    }
  }
  if (!/@vocab["']?\s*:\s*["']https:\/\/schema\.org\//.test(canon)) {
    errors.push(
      'Canonical @context must set `@vocab` to https://schema.org/ so unprefixed\n' +
        '           terms resolve in any standard JSON-LD processor.'
    );
  }
  notes.push('canonical context module present and well-formed');
}

// ---- 2. no stray AgriN context IRI anywhere else ----------------------
let scanned = 0;
for (const file of walk(BACKEND)) {
  scanned++;
  if (file === CANONICAL_CONTEXT_DEF) continue;
  const text = readFileSync(file, 'utf8');
  // Only flag a STRAY context, never a reference to the canonical one.
  if (STRAY_CONTEXT.test(text) && !text.includes('AGRIIN_CONTEXT')) {
    errors.push(
      `Competing AgriN context IRI in ${relative(ROOT, file)}\n` +
        `           A second @context breaks federation. Import AGRIIN_CONTEXT from\n` +
        `           app.models.agrin instead of inlining a namespace here.`
    );
  }
}
notes.push(`scanned ${scanned} backend Python files for competing contexts`);

// ---- 3. the named outputs must be modelled ---------------------------
if (existsSync(CANONICAL_CONTEXT_DEF)) {
  const canon = readFileSync(CANONICAL_CONTEXT_DEF, 'utf8');
  const requiredClasses = {
    DiseaseDiagnosis: 'disease diagnoses',
    SoilProfile: 'soil profiles',
    GeneticResource: 'seed / genetic-resource recommendations',
    AgroInput: 'agro-inputs',
    CarbonSequestrationProfile: 'cover-crop / green-manure carbon metadata',
    ResilienceMatch: 'climate-resilient indigenous seed ranking',
  };
  for (const [cls, human] of Object.entries(requiredClasses)) {
    if (!canon.includes(`agrin:${cls}`)) {
      errors.push(`AgriN class \`agrin:${cls}\` is missing — ${human} cannot be federated.`);
    }
  }
}

// ---- 4. every AgriN response must attach the context -----------------
if (existsSync(AGRIN_ROUTER)) {
  const router = readFileSync(AGRIN_ROUTER, 'utf8');
  const endpoints = [...router.matchAll(/@router\.get\("([^"]+)"\)/g)].map((m) => m[1]);
  notes.push(`AgriN router exposes ${endpoints.length} endpoint(s): ${endpoints.join(', ')}`);

  const forCore = [
    '/genetic-resources',
    '/agro-inputs',
    '/soil-profiles',
    '/diagnoses',
    '/carbon-metadata',
    '/resilience-match',
    '/schema',
    '/context',
    '/dataset',
  ];
  for (const ep of forCore) {
    if (!endpoints.includes(ep)) errors.push(`AgriN router is missing the ${ep} endpoint.`);
  }
  // A bare dict return would silently ship untyped JSON with no @context.
  if (!/agrin_envelope/.test(router)) {
    errors.push(
      'AgriN router never calls `agrin_envelope`, so responses would ship\n' +
        '           without an @context and could not be interpreted as JSON-LD.'
    );
  }
  if (!/application\/ld\+json/.test(router)) {
    errors.push('AgriN router must serve `application/ld+json`, not application/json.');
  }
} else {
  errors.push(`Missing AgriN router: ${relative(ROOT, AGRIN_ROUTER)}`);
}

// ---- 5. carbon metadata must never be emitted as a tradable credit ---------
// The single most damaging failure this module could have is a cover-crop
// record drifting into looking like an issued, verified carbon credit. Every
// record must therefore default creditClaimable to false in the model, and the
// knowledge base must refuse to derive a figure from a missing biomass input
// rather than reporting a silent 0 t C/ha (which reads as a measurement).
if (existsSync(CANONICAL_CONTEXT_DEF)) {
  const canon = readFileSync(CANONICAL_CONTEXT_DEF, 'utf8');
  const creditMatch = canon.match(/creditClaimable:[^=]*=\s*Field\(\s*default=(False|True)/);
  if (!creditMatch) {
    errors.push(
      '`creditClaimable` must be declared with an explicit default on\n' +
      '           CarbonSequestrationProfile so a schema change cannot silently flip it.'
    );
  } else if (creditMatch[1] !== 'False') {
    errors.push(
      '`creditClaimable` defaults to True. No record in FloraNet is a verified\n' +
      '           carbon credit; this default must stay False.'
    );
  }
}

const carbonKb = join(BACKEND, 'knowledge', 'carbon_sequestration.py');
if (!existsSync(carbonKb)) {
  errors.push(
    `Missing carbon-sequestration knowledge base: ${relative(ROOT, carbonKb)}\n` +
    '           Carbon metadata must live in the backend so it can be federated and audited.'
  );
} else {
  const kb = readFileSync(carbonKb, 'utf8');
  if (!/CONVERSION_EFFICIENCY/.test(kb)) {
    errors.push(
      'carbon_sequestration.py must publish CONVERSION_EFFICIENCY — a derived SOC\n' +
      '           figure whose conversion factor is unstated cannot be audited.'
    );
  }
  if (!/CREDIT_READINESS/.test(kb)) {
    errors.push(
      'carbon_sequestration.py must publish CREDIT_READINESS naming what is still\n' +
      '           missing before a carbon claim (baseline, additionality, verification).'
    );
  }
  notes.push('carbon-sequestration knowledge base publishes its assumptions and gaps');
}

// ---- 6. the router must be registered in main.py ----------------------
const mainPy = join(BACKEND, 'main.py');
if (existsSync(mainPy)) {
  const main = readFileSync(mainPy, 'utf8');
  if (!/include_router\(\s*agrin\.router/.test(main)) {
    errors.push('app/main.py does not include agrin.router — the endpoints would be unreachable.');
  }
}

// ---- report -----------------------------------------------------------
console.log('AgriN (BARP) interoperability guard');
for (const n of notes) console.log(`  - ${n}`);

if (errors.length) {
  console.error(`\n${errors.length} AgriN problem(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\nAgriN profile is consistent and federable.');
