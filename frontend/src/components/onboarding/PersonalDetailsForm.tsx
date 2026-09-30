"use client";

import React, { useState } from 'react';
import { User, Mail, Phone, Globe2, Map, Languages, ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import RoleSelector from './RoleSelector';
import { useRouter } from 'next/navigation';
import { getDivisionsForCountry, normalizeCountryName } from '@/data/bricsDivisions';
import { useFarm } from '@/context/farmContext';
import { normalizeLanguageCode } from '@/lib/uiLanguage';

export default function PersonalDetailsForm() {
  const router = useRouter();
  const { refreshUserProfile } = useFarm();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneCountryCode: '+91',
    phoneNumber: '',
    country: 'India',
    state: '',
    language: '',
    role: 'farmer',
    termsAccepted: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const normalizedCountry = normalizeCountryName(formData.country);
  const divisions = normalizedCountry ? getDivisionsForCountry(normalizedCountry) : [];

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('floranet_user') || '{}');
        if (stored.fullName || stored.email) {
          const rawCountry = stored.country || 'India';
          const normCountry = normalizeCountryName(rawCountry) || 'India';
          setFormData(prev => ({ 
            ...prev, 
            ...stored,
            country: normCountry,
            state: stored.state || prev.state,
            language: stored.language ? normalizeLanguageCode(stored.language) : prev.language,
          }));
        }
      } catch (err) {}
    }
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.state.trim() && formData.country) newErrors.state = 'State/Province is required';
    if (!formData.language.trim()) newErrors.language = 'Language is required';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('floranet_user') || '{}');
        localStorage.setItem('floranet_user', JSON.stringify({
          ...existing,
          ...formData,
          name: formData.fullName,
          // Canonical code — the same value the landing dropdown writes.
          language: normalizeLanguageCode(formData.language),
        }));
        // The form writes localStorage directly, so tell the shared context to
        // re-read it — otherwise the session keeps the pre-onboarding profile.
        refreshUserProfile();
      }
      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/onboarding/farm');
      }, 400);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-[20px] max-w-[480px]">
      
      {/* Full Name */}
      <div className="space-y-[8px]">
        <label className="block text-[14px] font-medium text-[#102A20]">Full Name</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6A63]">
            <User size={20} strokeWidth={1.8} />
          </div>
          <input 
            type="text"
            placeholder="Enter your full name"
            className={`w-full h-[50px] pl-[44px] pr-4 bg-white border ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32]'} rounded-[10px] text-[15px] text-[#102A20] placeholder:text-[#8C9B94] focus:outline-none focus:ring-1 transition-all`}
            value={formData.fullName}
            onChange={e => setFormData({...formData, fullName: e.target.value})}
          />
        </div>
        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
      </div>

      {/* Email */}
      <div className="space-y-[8px]">
        <label className="block text-[14px] font-medium text-[#102A20]">Email Address</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6A63]">
            <Mail size={20} strokeWidth={1.8} />
          </div>
          <input 
            type="email"
            placeholder="Enter your email"
            className={`w-full h-[50px] pl-[44px] pr-4 bg-white border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32]'} rounded-[10px] text-[15px] text-[#102A20] placeholder:text-[#8C9B94] focus:outline-none focus:ring-1 transition-all`}
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      {/* Phone Number */}
      <div className="space-y-[8px]">
        <label className="block text-[14px] font-medium text-[#102A20]">Phone Number</label>
        <div className="flex h-[50px] bg-white border border-[#DDE6DF] rounded-[10px] focus-within:border-[#075C32] focus-within:ring-1 focus-within:ring-[#075C32] transition-all overflow-hidden">
          <div className="flex items-center gap-2 px-3 border-r border-[#DDE6DF] bg-slate-50 cursor-pointer">
            <Phone size={18} className="text-[#5B6A63]" strokeWidth={1.8} />
            <span className="text-[18px]">🇮🇳</span>
            <span className="text-[14px] text-[#102A20] font-medium">+91</span>
            <ChevronDown size={16} className="text-[#5B6A63]" strokeWidth={1.8} />
          </div>
          <input 
            type="tel"
            placeholder="Enter your phone number"
            className="flex-1 px-4 text-[15px] text-[#102A20] placeholder:text-[#8C9B94] focus:outline-none bg-transparent"
            value={formData.phoneNumber}
            onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
          />
        </div>
        {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
      </div>

      {/* Country */}
      <div className="space-y-[8px]">
        <label className="block text-[14px] font-medium text-[#102A20]">Country</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6A63]">
            <Globe2 size={20} strokeWidth={1.8} />
          </div>
          <select 
            className={`w-full h-[50px] pl-[44px] pr-[44px] bg-white border ${errors.country ? 'border-red-500 focus:ring-red-500' : 'border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32]'} rounded-[10px] text-[15px] text-[#102A20] appearance-none focus:outline-none focus:ring-1 transition-all`}
            value={normalizedCountry || formData.country}
            onChange={e => setFormData({...formData, country: e.target.value, state: ''})}
          >
            <option value="" disabled className="text-[#8C9B94]">Select your country</option>
            <option value="India">🇮🇳 India</option>
            <option value="Brazil">🇧🇷 Brazil</option>
            <option value="Russia">🇷🇺 Russia</option>
            <option value="China">🇨🇳 China</option>
            <option value="South Africa">🇿🇦 South Africa</option>
            <option value="Egypt">🇪🇬 Egypt</option>
            <option value="Ethiopia">🇪🇹 Ethiopia</option>
            <option value="Iran">🇮🇷 Iran</option>
            <option value="UAE">🇦🇪 UAE</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5B6A63] pointer-events-none">
            <ChevronDown size={20} strokeWidth={1.8} />
          </div>
        </div>
        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
      </div>

      {/* State / Province */}
      <div className="space-y-[8px]">
        <label className="block text-[14px] font-medium text-[#102A20]">State / Province / Federal Division</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6A63]">
            <Map size={20} strokeWidth={1.8} />
          </div>
          <select 
            className={`w-full h-[50px] pl-[44px] pr-[44px] bg-white border ${errors.state ? 'border-red-500 focus:ring-red-500' : 'border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32]'} rounded-[10px] text-[15px] text-[#102A20] appearance-none focus:outline-none focus:ring-1 transition-all`}
            value={formData.state}
            onChange={e => setFormData({...formData, state: e.target.value})}
          >
            <option value="" disabled className="text-[#8C9B94]">
              {normalizedCountry ? `Select division in ${normalizedCountry}` : 'Select a country first'}
            </option>
            {divisions.map((div) => (
              <option key={div.name} value={div.name}>
                {div.name} ({div.type})
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5B6A63] pointer-events-none">
            <ChevronDown size={20} strokeWidth={1.8} />
          </div>
        </div>
        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
      </div>

      {/* Preferred Language */}
      <div className="space-y-[8px]">
        <label className="block text-[14px] font-medium text-[#102A20]">Preferred Language</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6A63]">
            <Languages size={20} strokeWidth={1.8} />
          </div>
          <select 
            className={`w-full h-[50px] pl-[44px] pr-[44px] bg-white border ${errors.language ? 'border-red-500 focus:ring-red-500' : 'border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32]'} rounded-[10px] text-[15px] text-[#102A20] appearance-none focus:outline-none focus:ring-1 transition-all`}
            value={formData.language}
            onChange={e => setFormData({...formData, language: e.target.value})}
          >
            <option value="" disabled className="text-[#8C9B94]">Select your preferred language</option>
            <optgroup label="🇧🇷 Brazil">
              <option value="pt-BR">Português (Brasil)</option>
            </optgroup>
            <optgroup label="🇷🇺 Russia">
              <option value="ru">Русский (Russian)</option>
            </optgroup>
            <optgroup label="🇮🇳 India (Official & 22 Scheduled)">
              <option value="en-IN">English (India)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
              <option value="ur">اردو (Urdu)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="or">ଓଡ଼ିଆ (Odia)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
              <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
              <option value="as">অসমীয়া (Assamese)</option>
              <option value="mai">मैथिली (Maithili)</option>
              <option value="sat">ᱥᱟᱱᱛᱟᱲᱤ (Santali)</option>
              <option value="ks">कॉशुर / کٲشُر (Kashmiri)</option>
              <option value="ne">नेपाली (Nepali)</option>
              <option value="sd">سنڌي / सिन्धी (Sindhi)</option>
              <option value="kok">कोंकणी (Konkani)</option>
              <option value="doi">डोगरी (Dogri)</option>
              <option value="mni">মৈতৈলোন্ (Manipuri)</option>
              <option value="brx">बर' (Bodo)</option>
              <option value="sa">संस्कृतम् (Sanskrit)</option>
            </optgroup>
            <optgroup label="🇨🇳 China">
              <option value="zh-CN">简体中文 (Mandarin Simplified)</option>
              <option value="zh-TW">繁體中文 (Mandarin Traditional)</option>
            </optgroup>
            <optgroup label="🇪🇬 Egypt">
              <option value="ar">العربية (Arabic)</option>
            </optgroup>
            <optgroup label="🇪🇹 Ethiopia">
              <option value="am">አማርኛ (Amharic)</option>
            </optgroup>
            <optgroup label="🇮🇷 Iran">
              <option value="fa">فارسی (Persian/Farsi)</option>
            </optgroup>
            <optgroup label="🇦🇪 UAE">
              <option value="ar-AE">العربية (Arabic - UAE)</option>
            </optgroup>
            <optgroup label="🇿🇦 South Africa (12 Official Languages)">
              <option value="en-ZA">English (South Africa)</option>
              <option value="zu">isiZulu (Zulu)</option>
              <option value="xh">isiXhosa (Xhosa)</option>
              <option value="af">Afrikaans</option>
              <option value="nso">Sepedi (Northern Sotho)</option>
              <option value="tn">Setswana (Tswana)</option>
              <option value="st">Sesotho (Southern Sotho)</option>
              <option value="ts">Xitsonga (Tsonga)</option>
              <option value="ss">siSwati (Swati)</option>
              <option value="ve">Tshivenda (Venda)</option>
              <option value="nr">isiNdebele (Ndebele)</option>
              <option value="sasl">South African Sign Language (SASL)</option>
            </optgroup>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5B6A63] pointer-events-none">
            <ChevronDown size={20} strokeWidth={1.8} />
          </div>
        </div>
        {errors.language && <p className="text-red-500 text-xs mt-1">{errors.language}</p>}
      </div>

      {/* Role Selection */}
      <RoleSelector 
        value={formData.role} 
        onChange={(val: any) => setFormData({...formData, role: val})} 
      />

      {/* Terms */}
      <div className="pt-2 pb-5">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            role="checkbox"
            aria-checked={formData.termsAccepted}
            tabIndex={0}
            className={`w-5 h-5 mt-0.5 rounded-[5px] border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
              formData.termsAccepted
                ? 'bg-[#075C32] border-[#075C32]'
                : errors.termsAccepted
                ? 'border-red-400 bg-white'
                : 'border-[#B8C8BC] bg-white group-hover:border-[#075C32]'
            }`}
            onClick={() => setFormData({ ...formData, termsAccepted: !formData.termsAccepted })}
            onKeyDown={(e) => e.key === ' ' && setFormData({ ...formData, termsAccepted: !formData.termsAccepted })}
          >
            {formData.termsAccepted && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-[14px] text-[#5B6A63] leading-snug">
            I agree to the{' '}
            <Link href="/terms" className="text-[#075C32] font-semibold hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#075C32] font-semibold hover:underline">Privacy Policy</Link>
          </span>
        </label>
        {errors.termsAccepted && !formData.termsAccepted && (
          <p className="text-red-500 text-xs mt-1 ml-8">You must accept the terms</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full h-[52px] bg-[#075C32] hover:bg-[#064e2a] text-white rounded-[10px] text-[16px] font-medium relative flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={isSubmitting || !formData.termsAccepted}
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>Continue</span>
            <ArrowRight size={20} strokeWidth={2} className="absolute right-5" />
          </>
        )}
      </button>

      <div className="mt-[24px] text-center pb-8">
        <p className="text-[15px] text-[#5B6A63]">
          Already have an account? <Link href="/login" className="text-[#075C32] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>

    </form>
  );
}
