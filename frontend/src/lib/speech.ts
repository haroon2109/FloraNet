/**
 * Shared Web Speech helpers for FloraNet's voice-first interface.
 *
 * One implementation for every leg of the voice loop so the farmer's selected
 * language is honoured end to end instead of being silently reset to en-US:
 *
 *  • STT (dictation)   — browser SpeechRecognition, driven by an explicit locale.
 *  • TTS (read-aloud)  — speechSynthesis with the closest installed voice.
 *  • Capabilities      — GET /audio/languages, so the UI can tell the farmer the
 *                        truth when the local Whisper model lacks their language
 *                        (isiZulu, isiXhosa, Odia …) rather than failing quietly.
 */

import { getApiBaseUrl } from '@/lib/apiConfig';
import { whisperLanguageForProfile } from '@/lib/edgeLanguage';
import { allBRICSLanguages } from '@/data/bricsLanguages';

const DEFAULT_LOCALE = 'en-US';

/**
 * BCP-47 locale for speech, resolved from the farmer's profile.
 *
 * Accepts a BCP-47 tag (`hi-IN`), a bare ISO code (`ta`), or a human language
 * name as stored by onboarding (`Tamil`, `English`). Anything unrecognised
 * falls back to the country default rather than producing an invalid tag —
 * `SpeechRecognition.lang = 'English'` throws in some browsers.
 */
export function speechLocaleFor(country?: string, language?: string): string {
  const raw = (language || '').trim();
  if (!raw) return whisperLanguageForProfile(country, undefined) || DEFAULT_LOCALE;

  // Already a BCP-47 tag (hi-IN, pt-BR, zh_CN …).
  if (raw.includes('-') || raw.includes('_')) return raw.replace('_', '-');

  const lower = raw.toLowerCase();
  if (lower === 'en' || lower === 'english') return DEFAULT_LOCALE;

  const byCode = allBRICSLanguages.find((l) => l.code.toLowerCase() === lower);
  if (byCode) return byCode.code;

  // Bare code that only exists region-suffixed in the catalogue (zh → zh-CN).
  const byBareCode = allBRICSLanguages.find(
    (l) => l.code.toLowerCase().split(/[-_]/)[0] === lower,
  );
  if (byBareCode) return byBareCode.code;

  // Human-readable name from onboarding ("Tamil" → "ta").
  const byName = allBRICSLanguages.find(
    (l) => l.name.toLowerCase() === lower || l.name.toLowerCase().startsWith(lower),
  );
  if (byName) return byName.code;

  return whisperLanguageForProfile(country, undefined) || DEFAULT_LOCALE;
}

/**
 * Human language name for the chat API (`ta` → "Tamil").
 *
 * The backend writes its system instruction as "Write the entire answer in
 * {language}", so a raw code would leak into the prompt; a display name is
 * what the model follows reliably.
 */
export function chatLanguageName(language?: string): string {
  const raw = (language || '').trim();
  if (!raw) return 'English';

  const lower = raw.toLowerCase();
  if (lower === 'en' || lower === 'english' || lower.startsWith('en-') || lower.startsWith('en_')) {
    return 'English';
  }

  const byCode = allBRICSLanguages.find((l) => l.code.toLowerCase() === lower);
  if (byCode) return byCode.name;

  const byBareCode = allBRICSLanguages.find(
    (l) => l.code.toLowerCase().split(/[-_]/)[0] === lower.split(/[-_]/)[0],
  );
  if (byBareCode) return byBareCode.name;

  // Already a display name ("Tamil", "Portuguese (Brazil)").
  return raw;
}

/* ------------------------------------------------------------------ */
/* Minimal structural typings for the vendor-prefixed Web Speech API.  */
/* (The DOM lib omits webkitSpeechRecognition, so we describe the      */
/*  surface we actually use instead of casting through `any`.)         */
/* ------------------------------------------------------------------ */

export interface SpeechRecognitionAlternativeLike {
  transcript?: string;
}

export interface SpeechRecognitionResultLike {
  0?: SpeechRecognitionAlternativeLike;
  isFinal?: boolean;
}

export interface SpeechRecognitionEventLike {
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

export interface DictationHandlers {
  /** `transcript` is the accumulated utterance; `isFinal` marks the last result. */
  onResult: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  /** Browser error code (`not-allowed`, `no-speech`, `network` …). */
  onError?: (code: string) => void;
}

/**
 * Build a locale-aware dictation instance, or null when unsupported.
 *
 * A fresh instance is intentional: `SpeechRecognition.lang` is effectively
 * fixed once constructed, so switching language must rebuild it.
 */
export function createDictation(
  locale: string,
  handlers: DictationHandlers,
  options?: { interimResults?: boolean },
): SpeechRecognitionLike | null {
  const SpeechRecognition = getSpeechRecognitionCtor();
  if (!SpeechRecognition) return null;

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = options?.interimResults ?? true;
    recognition.lang = locale || DEFAULT_LOCALE;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const results = event.results;
      const transcript = Array.from({ length: results.length }, (_, i) =>
        results[i]?.[0]?.transcript ?? '',
      ).join('');
      const last = results[results.length - 1];
      const isFinal = Boolean(last?.isFinal);
      handlers.onResult(transcript, isFinal);
    };
    recognition.onend = () => handlers.onEnd?.();
    recognition.onerror = (event: { error?: string }) =>
      handlers.onError?.(event?.error || 'unknown');

    return recognition;
  } catch {
    return null;
  }
}

export interface SpeakOptions {
  onEnd?: () => void;
  /** Fired when no installed voice covers the requested locale. */
  onFallback?: (usedLocale: string) => void;
}

/**
 * Read text aloud in `locale`, falling back to an installed voice when the
 * exact one is missing. Returns false when synthesis is unavailable (SSR or
 * unsupported browser) so callers can show an honest message.
 */
export function speakText(text: string, locale?: string, options?: SpeakOptions): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;

  const body = (text || '').trim();
  if (!body) {
    options?.onEnd?.();
    return false;
  }

  const requested = (locale || DEFAULT_LOCALE).replace('_', '-');
  const voices = window.speechSynthesis.getVoices();
  let tag = requested;

  // Voices load asynchronously; only downgrade to English once we know the
  // requested locale has no voice installed.
  if (voices.length > 0) {
    const exact = voices.find((v) => v.lang.replace('_', '-') === requested);
    const primary = voices.find((v) =>
      v.lang.replace('_', '-').startsWith(requested.split('-')[0]),
    );
    if (exact) tag = exact.lang.replace('_', '-');
    else if (primary) tag = primary.lang.replace('_', '-');
    else {
      tag = DEFAULT_LOCALE;
      options?.onFallback?.(DEFAULT_LOCALE);
    }
  }

  const utterance = new SpeechSynthesisUtterance(body);
  utterance.lang = tag;
  utterance.onend = () => options?.onEnd?.();
  utterance.onerror = () => options?.onEnd?.();

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export interface AudioCapabilities {
  engine: string;
  modelSize: string;
  modelLoaded: boolean;
  supportedCount: number;
  supported: string[];
  locales: Record<string, { whisper_language: string; supported: boolean | null }>;
  unsupportedInWhisper: Record<string, string>;
}

let capabilitiesPromise: Promise<AudioCapabilities | null> | null = null;

/** Cached GET /audio/languages. Resolves null when the backend is unreachable. */
export function getAudioCapabilities(): Promise<AudioCapabilities | null> {
  if (!capabilitiesPromise) {
    capabilitiesPromise = (async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/v1/audio/languages`);
        if (!res.ok) return null;
        const data = await res.json();
        return {
          engine: data?.engine ?? 'faster-whisper',
          modelSize: data?.model_size ?? '',
          modelLoaded: Boolean(data?.model_loaded),
          supportedCount: data?.supported_count ?? 0,
          supported: Array.isArray(data?.supported) ? data.supported : [],
          locales: data?.locales ?? {},
          unsupportedInWhisper: data?.unsupported_in_whisper ?? {},
        } as AudioCapabilities;
      } catch {
        return null;
      }
    })();
  }
  return capabilitiesPromise;
}

/**
 * Honest capability warning for `locale`, or null when nothing is wrong.
 *
 * Never fabricates support: if Whisper lacks the language, or the model could
 * not be loaded at all, the caller is told so the farmer is too.
 */
export async function speechSupportNotice(locale?: string): Promise<string | null> {
  const caps = await getAudioCapabilities();
  if (!caps) return null;

  if (caps.supportedCount === 0) {
    return 'The local speech model is unavailable — voice transcription is disabled until it loads.';
  }

  const primary = (locale || DEFAULT_LOCALE).split(/[-_]/)[0].toLowerCase();
  const entry = caps.locales[primary];
  const explicitlyUnsupported = primary in caps.unsupportedInWhisper;

  if (entry?.supported === false || explicitlyUnsupported) {
    const label =
      caps.unsupportedInWhisper[primary] || entry?.whisper_language || primary;
    return `${label} is not yet implemented by the local Whisper model — transcription will run with automatic language detection and may be inaccurate.`;
  }

  return null;
}
