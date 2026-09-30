/**
 * AgriN landing-page translations.
 *
 * The catalogue now lives in `./landingLocales/` — one file per language, so a
 * new language is a single reviewable file instead of another 66-line block in
 * a growing monolith. This module stays the public entry point so every
 * existing `from '@/data/landingTranslations'` import keeps working unchanged.
 */
import { landingLocales, TRANSLATED_CODES } from './landingLocales';
import type { LandingTranslation } from './landingLocales';

export type { LandingTranslation };
export { TRANSLATED_CODES };

/** Every language that has a real, complete translation. */
export const landingTranslations: Record<string, LandingTranslation> = landingLocales;

/**
 * Languages with no translation of their own. Selecting one of these is a real
 * choice (the Constitution recognises all of them), so we render the closest
 * translated sibling — but `resolveLandingTranslationKey` reports the
 * substitution so the UI can say so rather than failing silently.
 */
const INDIA_FALLBACK = new Set([
  'bn', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'kok', 'doi', 'mni',
  'brx', 'sa', 'mai', 'sat', 'ks', 'ne', 'sd',
]);
const SOUTH_AFRICA_FALLBACK = new Set([
  'zu', 'xh', 'af', 'nso', 'tn', 'st', 'ts', 'ss', 've', 'nr', 'sasl',
]);

/** Dropdown codes that have no translation of their own. */
export const UNTRANSLATED_CODES = new Set<string>([
  ...INDIA_FALLBACK,
  ...SOUTH_AFRICA_FALLBACK,
]);

/** Region/script variants that legitimately render as a translated sibling. */
const VARIANT_ALIASES: Record<string, string> = {
  'en-IN': 'en', 'en-ZA': 'en', 'en-US': 'en', 'en-GB': 'en',
  'en-AU': 'en', 'en-CA': 'en', 'en-IE': 'en',
  'ru-RU': 'ru', 'ru-KZ': 'ru',
  'hi-IN': 'hi',
  'ta-LK': 'ta', 'ta-SG': 'ta',
  'te-IN': 'te',
  'mr-IN': 'mr',
  'bn-BD': 'bn', 'bn-IN': 'bn',
  'pa-IN': 'pa', 'pa-PK': 'pa',
  'gu-IN': 'gu',
  'kn-IN': 'kn',
  'ml-IN': 'ml',
  'ur-PK': 'ur', 'ur-IN': 'ur',
  'or-IN': 'or',
  'as-IN': 'as',
  'af-ZA': 'af',
  'pt-PT': 'pt-BR',
  'zh-TW': 'zh-CN', 'zh-HK': 'zh-CN',
};

function resolveKey(langCode: string): string {
  const normalized = (langCode || 'en').trim().replace('_', '-');
  if (landingTranslations[normalized]) return normalized;
  if (VARIANT_ALIASES[normalized]) return VARIANT_ALIASES[normalized];

  const prefix = normalized.split('-')[0];
  if (landingTranslations[prefix]) return prefix;
  if (normalized.startsWith('zh')) return 'zh-CN';
  if (normalized.startsWith('pt')) return 'pt-BR';
  // India: other Eighth Schedule languages → Hindi (closest widely-read sibling)
  if (INDIA_FALLBACK.has(prefix)) return 'hi';
  // South Africa: other official languages → English (a shared official language)
  if (SOUTH_AFRICA_FALLBACK.has(normalized) || SOUTH_AFRICA_FALLBACK.has(prefix)) {
    return 'en';
  }
  if (prefix === 'zh') return 'zh-CN';
  return 'en';
}

export function getLandingTranslation(langCode: string): LandingTranslation {
  const key = resolveKey(langCode);
  return landingTranslations[key] || landingTranslations.en;
}

/**
 * Which translation key a locale actually renders with, and whether that is a
 * substitution. `fallback: true` means the user picked a language we cannot
 * display — callers MUST tell the user instead of silently swapping.
 */
export function resolveLandingTranslationKey(langCode: string): {
  key: string;
  fallback: boolean;
} {
  const normalized = (langCode || 'en').trim().replace('_', '-');
  const key = resolveKey(langCode);
  // A "real" match is the exact code, or a region/script variant of the same
  // base language (en-IN → en, ru-RU → ru, zh-TW → zh-CN).
  const sameLanguage = key.split('-')[0] === normalized.split('-')[0];
  return { key, fallback: !landingTranslations[normalized] && !sameLanguage };
}
