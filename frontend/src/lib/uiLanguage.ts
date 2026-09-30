"use client";

/**
 * Shared UI-language plumbing.
 *
 * One source of truth: `userProfile.language` (persisted in `floranet_user`).
 * The landing dropdown, the in-app switcher, onboarding and Settings all read
 * and write the SAME field, and every surface that formats data (dates, <html
 * lang>, RTL direction) resolves it here so screens can never disagree.
 *
 * Stored values are normalized to a canonical code from the BRICS catalogue
 * (`hi`, `pt-BR`, `zh-CN`, `zu`, `en-IN` …). Legacy values written by older
 * onboarding/preferences flows ("hindi", "English", "mandarin-simplified")
 * are mapped too, so no screen silently falls back to English because a
 * previous version stored a display name.
 */

import { allBRICSLanguages } from '@/data/bricsLanguages';

/** Default when nothing has been chosen yet (English — India build). */
export const DEFAULT_UI_LANGUAGE = 'en-IN';

/**
 * Values historically written by the onboarding preferences select and the
 * old TopBar switcher (display words, not codes) → canonical code.
 */
const LEGACY_WORD_MAP: Record<string, string> = {
  english: 'en-IN',
  'english (india)': 'en-IN',
  'english (south africa)': 'en-ZA',
  'english-sa': 'en-ZA',
  hindi: 'hi',
  bengali: 'bn',
  telugu: 'te',
  marathi: 'mr',
  tamil: 'ta',
  gujarati: 'gu',
  urdu: 'ur',
  kannada: 'kn',
  odia: 'or',
  malayalam: 'ml',
  punjabi: 'pa',
  assamese: 'as',
  maithili: 'mai',
  santali: 'sat',
  kashmiri: 'ks',
  nepali: 'ne',
  sindhi: 'sd',
  konkani: 'kok',
  dogri: 'doi',
  manipuri: 'mni',
  bodo: 'brx',
  sanskrit: 'sa',
  portuguese: 'pt-BR',
  'portuguese (brazil)': 'pt-BR',
  russian: 'ru',
  'mandarin-simplified': 'zh-CN',
  'mandarin-chinese (simplified)': 'zh-CN',
  'mandarin-traditional': 'zh-TW',
  arabic: 'ar',
  'arabic (uae)': 'ar-AE',
  amharic: 'am',
  persian: 'fa',
  'persian (farsi)': 'fa',
  zulu: 'zu',
  xhosa: 'xh',
  afrikaans: 'af',
  sepedi: 'nso',
  tswana: 'tn',
  sotho: 'st',
  tsonga: 'ts',
  swati: 'ss',
  venda: 've',
  ndebele: 'nr',
  sasl: 'sasl',
  'south african sign language': 'sasl',
};

/**
 * Normalize any stored language value to a canonical BRICS code.
 *
 * Accepts codes (`hi`, `pt-BR`, `en-IN`), BCP-47 variants (`hi_IN`,
 * `pt-PT` → `pt-BR`), display names ("Hindi", "Portuguese (Brazil)") and
 * legacy preference words ("hindi"). Returns `fallback` when nothing
 * resolves.
 */
export function normalizeLanguageCode(raw?: string | null, fallback = DEFAULT_UI_LANGUAGE): string {
  const value = (raw || '').trim();
  if (!value) return fallback;

  const lower = value.toLowerCase().replace(/_/g, '-');

  // Exact canonical code (hi, pt-BR, zh-CN …).
  const byCode = allBRICSLanguages.find((l) => l.code.toLowerCase() === lower);
  if (byCode) return byCode.code;

  // Same base language with a different region tag (hi_IN → hi, en_US → en-IN).
  const base = lower.split('-')[0];
  const byBase = allBRICSLanguages.find((l) => l.code.toLowerCase().split('-')[0] === base);
  if (byBase) return byBase.code;

  // Legacy words / display names ("hindi", "English (India)").
  const byWord = LEGACY_WORD_MAP[lower];
  if (byWord) return byWord;

  // Display name from the catalogue ("Hindi", "isiZulu (Zulu)").
  const byName = allBRICSLanguages.find(
    (l) => l.name.toLowerCase() === lower || l.nativeName.toLowerCase() === lower,
  );
  if (byName) return byName.code;

  return fallback;
}

/** BCP-47 tag for `<html lang>` / Intl, derived from the stored code. */
export function htmlLangFor(raw?: string | null): string {
  return normalizeLanguageCode(raw);
}

/**
 * Right-to-left scripts: the whole document flips `dir="rtl"` so Urdu,
 * Arabic and Persian screens read correctly on every page.
 */
const RTL_LANGUAGES = new Set(['ar', 'fa', 'ur', 'he']);

export function isRTLLanguage(raw?: string | null): boolean {
  const code = normalizeLanguageCode(raw).toLowerCase();
  // Base check covers variants such as `ar-AE`, `ur-PK`.
  return RTL_LANGUAGES.has(code) || RTL_LANGUAGES.has(code.split('-')[0]);
}

/**
 * Intl locale for date/number formatting. Region-suffixed codes are used
 * as-is; bare codes fall back to `en-IN` only when the tag is malformed.
 */
export function intlLocaleFor(raw?: string | null): string {
  const code = normalizeLanguageCode(raw);
  try {
    // Validates the tag; throws on malformed input.
    Intl.getCanonicalLocales(code);
    return code;
  } catch {
    return DEFAULT_UI_LANGUAGE;
  }
}

/** Human label for a stored language code, for settings/summary rows. */
export function languageDisplayName(raw?: string | null): string {
  const code = normalizeLanguageCode(raw);
  const match = allBRICSLanguages.find((l) => l.code === code);
  return match ? `${match.nativeName} (${match.name})` : 'English (India)';
}

