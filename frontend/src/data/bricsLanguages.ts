/**
 * BRICS Languages — REAL reference data (all 9 member nations)
 *
 * Sources (official):
 *  - Brazil: Portuguese sole official (Constituição Federal Art. 13) — ISO 639-1: pt (pt-BR)
 *  - Russia: Russian state language (Const. Art. 68) — ISO 639-1: ru
 *  - India:  All 22 Eighth Schedule constitutional languages + English for federal
 *            purposes (Official Languages Act 1963) — ISO 639 codes (hi, bn, te, mr, ta…)
 *  - China:  Standard Chinese / Putonghua (national) — ISO 639: zh (zh-CN/zh-TW scripts)
 *  - South Africa: 12 official languages since 2023 incl. South African Sign Language
 *            (Constitution s.6 as amended) — ISO 639 codes (zu, xh, af, nso, tn, st, ts, ss, ve, nr)
 *  - Egypt: Arabic (Constitution Art. 2) — ISO 639-1: ar
 *  - Ethiopia: Amharic, federal working language; regional states recognize
 *            additional official languages — ISO 639-1: am
 *  - Iran: Persian (Farsi) (Constitution Art. 15) — ISO 639-1: fa
 *  - UAE: Arabic (Const. Art. 7) — ISO 639-1: ar (ar-AE for the Emirati locale)
 */

export interface BRICSLanguage {
  code: string;
  name: string;
  nativeName: string;
  country:
    | 'Brazil' | 'Russia' | 'India' | 'China' | 'South Africa'
    | 'Egypt' | 'Ethiopia' | 'Iran' | 'UAE'
    | 'Global';
  flag: string;
  isOfficialFederal?: boolean;
}

export interface BRICSNationLanguages {
  nation: string;
  flag: string;
  officialDescription: string;
  languages: BRICSLanguage[];
}

export const bricsLanguageGroups: BRICSNationLanguages[] = [
  {
    nation: 'Brazil',
    flag: '🇧🇷',
    officialDescription: 'Portuguese is the sole official language of the Federative Republic of Brazil.',
    languages: [
      { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', country: 'Brazil', flag: '🇧🇷', isOfficialFederal: true }
    ]
  },
  {
    nation: 'Russia',
    flag: '🇷🇺',
    officialDescription: 'Russian is the official state language throughout the Russian Federation.',
    languages: [
      { code: 'ru', name: 'Russian', nativeName: 'Русский', country: 'Russia', flag: '🇷🇺', isOfficialFederal: true }
    ]
  },
  {
    nation: 'India',
    flag: '🇮🇳',
    officialDescription: 'Hindi and English are used for official federal purposes. The Constitution recognizes 22 Eighth Schedule languages across states.',
    languages: [
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', country: 'India', flag: '🇮🇳', isOfficialFederal: true },
      { code: 'en-IN', name: 'English (India)', nativeName: 'English (India)', country: 'India', flag: '🇮🇳', isOfficialFederal: true },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', country: 'India', flag: '🇮🇳' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', country: 'India', flag: '🇮🇳' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी', country: 'India', flag: '🇮🇳' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', country: 'India', flag: '🇮🇳' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', country: 'India', flag: '🇮🇳' },
      { code: 'ur', name: 'Urdu', nativeName: 'اردو', country: 'India', flag: '🇮🇳' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', country: 'India', flag: '🇮🇳' },
      { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', country: 'India', flag: '🇮🇳' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', country: 'India', flag: '🇮🇳' },
      { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', country: 'India', flag: '🇮🇳' },
      { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', country: 'India', flag: '🇮🇳' },
      { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', country: 'India', flag: '🇮🇳' },
      { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', country: 'India', flag: '🇮🇳' },
      { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर / کٲشُر', country: 'India', flag: '🇮🇳' },
      { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', country: 'India', flag: '🇮🇳' },
      { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي / सिन्धी', country: 'India', flag: '🇮🇳' },
      { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', country: 'India', flag: '🇮🇳' },
      { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', country: 'India', flag: '🇮🇳' },
      { code: 'mni', name: 'Manipuri (Meitei)', nativeName: 'মৈতৈলোন্', country: 'India', flag: '🇮🇳' },
      { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', country: 'India', flag: '🇮🇳' },
      { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', country: 'India', flag: '🇮🇳' }
    ]
  },
  {
    nation: 'China',
    flag: '🇨🇳',
    officialDescription: 'Mandarin Chinese (Standard Chinese / Putonghua) is the sole official national language.',
    languages: [
      { code: 'zh-CN', name: 'Mandarin Chinese (Simplified)', nativeName: '简体中文 (普通话)', country: 'China', flag: '🇨🇳', isOfficialFederal: true },
      { code: 'zh-TW', name: 'Mandarin Chinese (Traditional)', nativeName: '繁體中文 (國語)', country: 'China', flag: '🇨🇳' }
    ]
  },
  {
    nation: 'Egypt',
    flag: '🇪🇬',
    officialDescription: 'Arabic is the sole official language of the Arab Republic of Egypt.',
    languages: [
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', country: 'Egypt', flag: '🇪🇬', isOfficialFederal: true }
    ]
  },
  {
    nation: 'Ethiopia',
    flag: '🇪🇹',
    officialDescription: 'Amharic is the working language of the Federal Democratic Republic of Ethiopia; individual regional states recognize additional official languages.',
    languages: [
      { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', country: 'Ethiopia', flag: '🇪🇹', isOfficialFederal: true }
    ]
  },
  {
    nation: 'Iran',
    flag: '🇮🇷',
    officialDescription: 'Persian (Farsi) is the official language of the Islamic Republic of Iran.',
    languages: [
      { code: 'fa', name: 'Persian (Farsi)', nativeName: 'فارسی', country: 'Iran', flag: '🇮🇷', isOfficialFederal: true }
    ]
  },
  {
    nation: 'UAE',
    flag: '🇦🇪',
    officialDescription: 'Arabic is the official language of the United Arab Emirates.',
    languages: [
      { code: 'ar-AE', name: 'Arabic (UAE)', nativeName: 'العربية (الإمارات)', country: 'UAE', flag: '🇦🇪', isOfficialFederal: true }
    ]
  },
  {
    nation: 'South Africa',
    flag: '🇿🇦',
    officialDescription: 'South Africa recognizes 12 official languages to reflect its diverse heritage, including South African Sign Language.',
    languages: [
      { code: 'en-ZA', name: 'English (South Africa)', nativeName: 'English (SA)', country: 'South Africa', flag: '🇿🇦', isOfficialFederal: true },
      { code: 'zu', name: 'isiZulu', nativeName: 'isiZulu (Zulu)', country: 'South Africa', flag: '🇿🇦', isOfficialFederal: true },
      { code: 'xh', name: 'isiXhosa', nativeName: 'isiXhosa (Xhosa)', country: 'South Africa', flag: '🇿🇦', isOfficialFederal: true },
      { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', country: 'South Africa', flag: '🇿🇦', isOfficialFederal: true },
      { code: 'nso', name: 'Sepedi', nativeName: 'Sepedi (Northern Sotho)', country: 'South Africa', flag: '🇿🇦', isOfficialFederal: true },
      { code: 'tn', name: 'Setswana', nativeName: 'Setswana (Tswana)', country: 'South Africa', flag: '🇿🇦', isOfficialFederal: true },
      { code: 'st', name: 'Sesotho', nativeName: 'Sesotho (Southern Sotho)', country: 'South Africa', flag: '🇿🇦', isOfficialFederal: true },
      { code: 'ts', name: 'Xitsonga', nativeName: 'Xitsonga (Tsonga)', country: 'South Africa', flag: '🇿🇦', isOfficialFederal: true },
      { code: 'ss', name: 'siSwati', nativeName: 'siSwati (Swati)', country: 'South Africa', flag: '🇿🇦', isOfficialFederal: true },
      { code: 've', name: 'Tshivenda', nativeName: 'Tshivenda (Venda)', country: 'South Africa', flag: '🇿🇦', isOfficialFederal: true },
      { code: 'nr', name: 'isiNdebele', nativeName: 'isiNdebele (Ndebele)', country: 'South Africa', flag: '🇿🇦', isOfficialFederal: true },
      { code: 'sasl', name: 'South African Sign Language', nativeName: 'SASL (Sign Language)', country: 'South Africa', flag: '🇿🇦', isOfficialFederal: true }
    ]
  }
];

export const allBRICSLanguages: BRICSLanguage[] = bricsLanguageGroups.flatMap(g => g.languages);
