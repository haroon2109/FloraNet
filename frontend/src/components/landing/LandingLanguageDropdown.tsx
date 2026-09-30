"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { useToast } from '@/context/toastContext';
import { bricsLanguageGroups, BRICSLanguage } from '@/data/bricsLanguages';
import { resolveLandingTranslationKey, TRANSLATED_CODES } from '@/data/landingTranslations';

/** Human label for the language a fallback actually renders in. */
const DISPLAY_NAME: Record<string, string> = {
  en: 'English', hi: 'Hindi', mr: 'Marathi', ta: 'Tamil', te: 'Telugu',
  bn: 'Bengali', as: 'Assamese', gu: 'Gujarati', kn: 'Kannada',
  ml: 'Malayalam', pa: 'Punjabi', ur: 'Urdu', or: 'Odia',
  'pt-BR': 'Português (Brasil)', ru: 'Русский', 'zh-CN': '简体中文',
  af: 'Afrikaans', nso: 'Sepedi', nr: 'isiNdebele', st: 'Sesotho',
  ss: 'siSwati', ts: 'Xitsonga', tn: 'Setswana', ve: 'Tshivenda',
  xh: 'isiXhosa', zu: 'isiZulu',
};

export default function LandingLanguageDropdown() {
  const { userProfile, updateUserProfile } = useFarm();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLangCode = userProfile?.language || 'en-IN';

  // Find currently active language object
  const currentLang = (() => {
    for (const group of bricsLanguageGroups) {
      const found = group.languages.find((l) => l.code === currentLangCode);
      if (found) return found;
    }
    return {
      code: 'en-IN',
      name: 'English',
      nativeName: 'English (India)',
      country: (userProfile?.country || 'India') as any,
      flag: userProfile?.countryFlag || '🇮🇳',
    };
  })();

  // If the current selection is a substitution, show it on the pill so the
  // user is never looking at a language the UI hasn't told them about.
  const currentResolution = resolveLandingTranslationKey(currentLangCode);
  const currentIsFallback = currentResolution.fallback;

  const isTranslated = (code: string) =>
    TRANSLATED_CODES.has(code) ||
    TRANSLATED_CODES.has(code.split('-')[0]) ||
    !resolveLandingTranslationKey(code).fallback;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;

    let selectedLang: BRICSLanguage | undefined;
    for (const group of bricsLanguageGroups) {
      const found = group.languages.find((l) => l.code === selectedCode);
      if (found) {
        selectedLang = found;
        break;
      }
    }

    if (selectedLang) {
      updateUserProfile({
        country: selectedLang.country,
        countryFlag: selectedLang.flag,
        language: selectedLang.code,
      });
      const resolved = resolveLandingTranslationKey(selectedLang.code);
      if (!resolved.fallback) {
        showToast(`Language switched to ${selectedLang.nativeName} (${selectedLang.flag})`, 'success');
      } else {
        // Honest fallback: name BOTH the language picked and the one shown.
        const actual = DISPLAY_NAME[resolved.key] || resolved.key;
        showToast(
          `${selectedLang.nativeName} translation isn't ready yet — this page is showing ${actual}.`,
          'info'
        );
      }
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Visual Pill Container with 100% overlay native select */}
      <div className="relative flex flex-col text-[13.5px] font-semibold text-[#304439] px-3.5 py-1.5 rounded-xl border border-[#D5E3D8] hover:border-[#168A45] bg-white hover:bg-[#EEF7F1] transition-all shadow-2xs select-none">
        
        {/* Visual Flag */}
        <span className="text-base leading-none shrink-0 pointer-events-none">
          {currentLang.flag}
        </span>
        
        {/* Visual Language Label */}
        <span className="truncate max-w-[130px] font-medium text-[#102A20] pointer-events-none">
          {mounted ? currentLang.nativeName.split(' ')[0] : 'English'}
        </span>

        {/* Fallback marker: never let a substitution pass unnoticed */}
        {currentIsFallback && (
          <span
            className="text-[9.5px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 border border-amber-300 rounded px-1 leading-tight"
            title={`Showing ${DISPLAY_NAME[currentResolution.key] || currentResolution.key} — ${currentLang.name} translation is not ready yet`}
          >
            {DISPLAY_NAME[currentResolution.key] || currentResolution.key}
          </span>
        )}

        {/* Visual Chevron */}
        <ChevronDown 
          size={14} 
          strokeWidth={2.2} 
          className="text-[#6D8176] shrink-0 pointer-events-none" 
        />

        {/* 100% Transparent Clickable Native Select covering the entire pill */}
        <select
          id="landing-language-select"
          aria-label="Select Language"
          value={currentLangCode}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 appearance-none bg-transparent"
        >
          {bricsLanguageGroups.map((group) => (
            <optgroup 
              key={group.nation} 
              label={`${group.flag} ${group.nation}`} 
              className="text-[#102A20] font-bold bg-white"
            >
              {group.languages.map((lang) => {
                const translated = isTranslated(lang.code);
                return (
                  <option
                    key={lang.code}
                    value={lang.code}
                    className="text-[#2D3E35] font-normal py-1"
                  >
                    {translated
                      ? `${lang.nativeName} (${lang.name})`
                      : `${lang.nativeName} (${lang.name}) — translation pending`}
                  </option>
                );
              })}
            </optgroup>
          ))}
        </select>

      </div>
    </div>
  );
}
