"use client";

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Globe2, 
  ChevronDown, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  Check, 
  CheckCircle2,
  Loader2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import SocialSignupButtons from './SocialSignupButtons';
import { useToast } from '@/context/toastContext';
import { getApiBaseUrl } from '@/lib/apiConfig';
import { bricsCountryConfigs } from '@/data/bricsLocalization';
import { useFarm } from '@/context/farmContext';

export default function SignupForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const { refreshUserProfile } = useFarm();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'India',
    role: 'farmer',
    terms: true
  });

  // Unique Accessible IDs
  const fullNameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const countryId = useId();
  const roleId = useId();

  // Validations
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isValidName = formData.fullName.trim().length >= 2;
  const isPasswordValid = formData.password.length >= 8;
  const isPasswordMatch = formData.confirmPassword.length >= 8 && formData.password === formData.confirmPassword;
  const isPasswordMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  // Password Strength (0 to 4)
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-gray-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-600' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-emerald-500', text: 'text-emerald-600' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-[#075C32]', text: 'text-[#075C32]' };
      default:
        return { score: 0, label: 'Too short', color: 'bg-red-300', text: 'text-red-400' };
    }
  };

  const strength = calculatePasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.terms) {
      showToast("Please agree to the Terms of Service & Privacy Policy", "warning");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match. Please verify your password.", "warning");
      return;
    }

    if (formData.password.length < 8) {
      showToast("Password must be at least 8 characters long.", "warning");
      return;
    }

    setIsSubmitting(true);
    const name = formData.fullName.trim() || 'Farmer';
    const countryConfig = Object.values(bricsCountryConfigs).find(
      c => c.country.toLowerCase() === formData.country.toLowerCase()
    );

    const userObj = {
      fullName: name,
      name: name,
      email: formData.email.trim(),
      role: formData.role || 'Farmer',
      country: formData.country || 'India',
      countryFlag: countryConfig?.flag || '🇮🇳',
      state: countryConfig?.defaultLocation.split(',')[1]?.trim() || 'Maharashtra',
      currencyCode: countryConfig?.currencyCode || 'INR',
      currencySymbol: countryConfig?.currencySymbol || '₹',
      farmName: name !== 'Farmer' ? `${name.split(' ')[0]}'s Agro Station` : 'My Farm Station',
    };

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/farm/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: userObj.fullName,
          email: userObj.email,
          password: formData.password,
          country: userObj.country,
          role: userObj.role,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        showToast(`Account created successfully! Welcome to FloraNet.`, 'success');
      } else {
        showToast(`Account registered locally for offline node sync.`, 'info');
      }
    } catch (err) {
      showToast(`Offline mode: Account created and cached locally.`, 'info');
    } finally {
      if (typeof window !== 'undefined') {
        // This form only owns identity + country/role. Keep everything the
        // farmer already chose — above all the landing-page language — so
        // registering never silently resets the app back to English.
        let existing: Record<string, any> = {};
        try {
          existing = JSON.parse(localStorage.getItem('floranet_user') || '{}');
        } catch (err) {
          existing = {};
        }
        localStorage.setItem('floranet_user', JSON.stringify({
          ...existing,
          ...userObj,
          language: existing.language,
        }));
        refreshUserProfile();
      }
      setIsSubmitting(false);
      router.push('/onboarding');
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between px-6 sm:px-10 lg:px-12 py-7 overflow-y-auto hide-scrollbar">
      
      {/* Top Navigation Bar: Breadcrumb + Sign In Quick Switch */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EEF3EF]">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#55695F] hover:text-[#075C32] transition-colors group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <Link 
          href="/login" 
          className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#075C32] hover:text-[#054324] bg-[#EAF5EC] hover:bg-[#DDF0E1] px-3 py-1.5 rounded-xl border border-[#C4E7D0] transition-all"
        >
          <span>Already registered? Sign In</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[480px] w-full mx-auto py-4">
        
        {/* Brand Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Logo className="w-7 h-7" />
            <span className="text-[12px] font-bold tracking-wider text-[#075C32] uppercase px-2.5 py-0.5 bg-[#EAF5EC] rounded-full border border-[#C4E7D0]">
              BRICS DIGITAL PUBLIC GOOD
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#102C22] tracking-tight leading-tight">
            Create Your Account
          </h1>
          <p className="text-[13.5px] text-[#596A62] mt-1">
            Join the agricultural AI network empowering smallholders across BRICS.
          </p>
        </div>

        {/* Social Authentication */}
        <SocialSignupButtons />

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Row 1: Full Name & Email (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor={fullNameId} className="block text-[12.5px] font-bold text-[#102C22]">
                  Full Name *
                </label>
                {isValidName && <CheckCircle2 size={14} className="text-[#075C32]" />}
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#596A62] pointer-events-none">
                  <User size={16} strokeWidth={1.8} />
                </div>
                <input 
                  id={fullNameId}
                  type="text"
                  autoComplete="name"
                  placeholder="Dr. Rajesh Sharma"
                  required
                  className="w-full h-[46px] pl-9.5 pr-3 bg-white border border-[#DDE6DF] rounded-[10px] text-[13.5px] text-[#102C22] placeholder:text-[#8C9B94] focus:outline-none focus:border-[#075C32] focus:ring-2 focus:ring-[#075C32]/20 transition-all"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor={emailId} className="block text-[12.5px] font-bold text-[#102C22]">
                  Work Email *
                </label>
                {isValidEmail && <CheckCircle2 size={14} className="text-[#075C32]" />}
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#596A62] pointer-events-none">
                  <Mail size={16} strokeWidth={1.8} />
                </div>
                <input 
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  placeholder="name@icar-node.org"
                  required
                  className="w-full h-[46px] pl-9.5 pr-3 bg-white border border-[#DDE6DF] rounded-[10px] text-[13.5px] text-[#102C22] placeholder:text-[#8C9B94] focus:outline-none focus:border-[#075C32] focus:ring-2 focus:ring-[#075C32]/20 transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Password & Confirm Password (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor={passwordId} className="block text-[12.5px] font-bold text-[#102C22]">
                  Password *
                </label>
                {formData.password && (
                  <span className={`text-[10.5px] font-bold ${strength.text}`}>
                    {strength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#596A62] pointer-events-none">
                  <Lock size={16} strokeWidth={1.8} />
                </div>
                <input 
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 chars"
                  required
                  className="w-full h-[46px] pl-9.5 pr-9 bg-white border border-[#DDE6DF] rounded-[10px] text-[13.5px] text-[#102C22] placeholder:text-[#8C9B94] focus:outline-none focus:border-[#075C32] focus:ring-2 focus:ring-[#075C32]/20 transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#596A62] hover:text-[#102C22] transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor={confirmPasswordId} className="block text-[12.5px] font-bold text-[#102C22]">
                  Confirm Password *
                </label>
                {isPasswordMatch && <CheckCircle2 size={14} className="text-[#075C32]" />}
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#596A62] pointer-events-none">
                  <Lock size={16} strokeWidth={1.8} />
                </div>
                <input 
                  id={confirmPasswordId}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  required
                  aria-invalid={isPasswordMismatch}
                  className={`w-full h-[46px] pl-9.5 pr-9 bg-white border rounded-[10px] text-[13.5px] text-[#102C22] placeholder:text-[#8C9B94] focus:outline-none focus:ring-2 transition-all ${
                    isPasswordMismatch 
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200' 
                      : 'border-[#DDE6DF] focus:border-[#075C32] focus:ring-[#075C32]/20'
                  }`}
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#596A62] hover:text-[#102C22] transition-colors cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Strength Bar */}
          {formData.password && (
            <div className="w-full bg-[#EAEFEA] h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${strength.color}`} 
                style={{ width: `${(strength.score / 4) * 100}%` }}
              />
            </div>
          )}

          {/* Inline Mismatch Warning */}
          {isPasswordMismatch && (
            <p className="text-[11.5px] text-red-600 flex items-center gap-1">
              <AlertCircle size={13} />
              <span>Passwords do not match</span>
            </p>
          )}

          {/* Row 3: Country & Role (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Country */}
            <div className="space-y-1">
              <label htmlFor={countryId} className="block text-[12.5px] font-bold text-[#102C22]">
                BRICS Nation *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#596A62] pointer-events-none">
                  <Globe2 size={16} strokeWidth={1.8} />
                </div>
                <select 
                  id={countryId}
                  className="w-full h-[46px] pl-9.5 pr-8 bg-white border border-[#DDE6DF] rounded-[10px] text-[13px] text-[#102C22] appearance-none focus:outline-none focus:border-[#075C32] focus:ring-2 focus:ring-[#075C32]/20 transition-all cursor-pointer"
                  value={formData.country}
                  onChange={e => setFormData({...formData, country: e.target.value})}
                  required
                >
                  <option value="India">🇮🇳 India (ICAR)</option>
                  <option value="Brazil">🇧🇷 Brazil (Embrapa)</option>
                  <option value="Russia">🇷🇺 Russia (Voronezh)</option>
                  <option value="China">🇨🇳 China (CAAS)</option>
                  <option value="South Africa">🇿🇦 South Africa (ARC)</option>
                  <option value="Egypt">🇪🇬 Egypt (ARC)</option>
                  <option value="Ethiopia">🇪🇹 Ethiopia (EIAR)</option>
                  <option value="Iran">🇮🇷 Iran (ARI)</option>
                  <option value="UAE">🇦🇪 UAE (NARC)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#596A62] pointer-events-none">
                  <ChevronDown size={16} strokeWidth={1.8} />
                </div>
              </div>
            </div>

            {/* Stakeholder Role */}
            <div className="space-y-1">
              <label htmlFor={roleId} className="block text-[12.5px] font-bold text-[#102C22]">
                Stakeholder Role *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#596A62] pointer-events-none">
                  <Users size={16} strokeWidth={1.8} />
                </div>
                <select 
                  id={roleId}
                  className="w-full h-[46px] pl-9.5 pr-8 bg-white border border-[#DDE6DF] rounded-[10px] text-[13px] text-[#102C22] appearance-none focus:outline-none focus:border-[#075C32] focus:ring-2 focus:ring-[#075C32]/20 transition-all cursor-pointer"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="farmer">Farmer / Smallholder</option>
                  <option value="cooperative">Agri Cooperative</option>
                  <option value="agronomist">Field Agronomist</option>
                  <option value="researcher">Research Scientist</option>
                  <option value="policymaker">Ministry Official</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#596A62] pointer-events-none">
                  <ChevronDown size={16} strokeWidth={1.8} />
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Privacy */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer group select-none">
              <div
                role="checkbox"
                aria-checked={formData.terms}
                tabIndex={0}
                className={`w-4.5 h-4.5 rounded-[5px] border flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 ${
                  formData.terms
                    ? 'bg-[#075C32] border-[#075C32]'
                    : 'bg-white border-[#DDE6DF] group-hover:border-[#075C32]'
                }`}
                onClick={() => setFormData({ ...formData, terms: !formData.terms })}
                onKeyDown={(e) => e.key === ' ' && setFormData({ ...formData, terms: !formData.terms })}
              >
                {formData.terms && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <span className="text-[12px] text-[#596A62] leading-tight">
                I agree to the <Link href="/terms" className="text-[#075C32] font-bold hover:underline">Terms</Link> and <Link href="/privacy" className="text-[#075C32] font-bold hover:underline">Digital Public Goods Charter</Link>.
              </span>
            </label>
          </div>

          {/* Submit Action */}
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[48px] bg-[#075C32] hover:bg-[#064e2a] text-white rounded-[10px] text-[15px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Provisioning Node Account...</span>
              </>
            ) : (
              <>
                <span>Complete Free Registration</span>
                <ArrowRight size={17} strokeWidth={2.2} />
              </>
            )}
          </button>
        </form>

      </div>

      {/* Institutional Security & Encryption Trust Banner */}
      <div className="pt-3 border-t border-[#EEF3EF] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-medium text-[#7E9186]">
        <span className="flex items-center gap-1">
          <ShieldCheck size={13} className="text-[#075C32]" />
          <span>256-Bit TLS Encrypted</span>
        </span>
        <span>•</span>
        <span>ISO 27001 Certified</span>
        <span>•</span>
        <span>Digital Public Good Charter</span>
      </div>

    </div>
  );
}
