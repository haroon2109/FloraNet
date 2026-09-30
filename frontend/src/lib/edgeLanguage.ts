/**
 * Farmer Edge — Speech / Whisper language resolution.
 *
 * Shared by the live diagnostics card (Whisper transcription) and the offline
 * capture queue (replay after reconnect) so a queued voice note is always
 * transcribed in the same locale it was recorded for.
 */

/** Default UI locale for each BRICS nation's majority language. */
export const LANGUAGE_BY_COUNTRY: Record<string, string> = {
  India: 'hi-IN',
  Brazil: 'pt-BR',
  Russia: 'ru-RU',
  China: 'zh-CN',
  'South Africa': 'zu-ZA',
  Egypt: 'ar-EG',
  Ethiopia: 'am-ET',
  Iran: 'fa-IR',
  UAE: 'ar-AE',
};

/** Bare ISO 639-1 codes (as stored by onboarding) → BCP-47 UI locale. */
const BARE_TO_BCP47: Record<string, string> = {
  hi: 'hi-IN',
  pt: 'pt-BR',
  ru: 'ru-RU',
  zh: 'zh-CN',
  zu: 'zu-ZA',
  en: 'en-US',
  ar: 'ar-EG',
  am: 'am-ET',
  fa: 'fa-IR',
};

/**
 * Resolve the BCP-47 locale used for Whisper transcription, preferring the
 * farmer's saved language and falling back to their country's default.
 */
export function whisperLanguageForProfile(country?: string, language?: string): string {
  const normalized = (language || '').trim();
  if (normalized) {
    // Accept both BCP-47 (hi-IN) and bare ISO codes (hi) from onboarding.
    if (normalized.includes('-') || normalized.includes('_')) return normalized.replace('_', '-');
    if (BARE_TO_BCP47[normalized.toLowerCase()]) return BARE_TO_BCP47[normalized.toLowerCase()];
    return normalized;
  }
  return LANGUAGE_BY_COUNTRY[country || ''] || 'en-US';
}

/** Extract the bare Whisper language code (e.g. `hi-IN` → `hi`). */
export function whisperCodeForProfile(country?: string, language?: string): string {
  return whisperLanguageForProfile(country, language).split('-')[0].toLowerCase();
}
