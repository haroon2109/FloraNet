"use client";

import React, { useState } from "react";
import Logo from '@/components/ui/Logo';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ShieldCheck, ArrowRight, Check } from "lucide-react";
import SocialLoginButtons from "./SocialLoginButtons";
import { useFarm } from '@/context/farmContext';

export default function LoginForm() {
  const router = useRouter();
  const { refreshUserProfile } = useFarm();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('floranet_user') || '{}');
        const derivedName = existing.fullName || (email ? email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Farmer');
        localStorage.setItem('floranet_user', JSON.stringify({
          ...existing,
          email,
          fullName: derivedName,
          name: derivedName,
          farmName: existing.farmName || (derivedName !== 'Farmer' ? `${derivedName.split(' ')[0]}'s Farm` : 'My Farm'),
        }));
      } catch (err) {}
      // Same-tab writes don't fire the storage event — re-read explicitly so
      // the header/profile render the freshly signed-in account.
      refreshUserProfile();
    }
    router.push('/home');
  };

  return (
    <div className="w-full h-full flex flex-col min-h-screen md:min-h-full">
      {/* Scrollable Content */}
      <div className="flex-1 flex flex-col px-8 md:px-12 lg:px-14 pt-12 md:pt-14 pb-8 overflow-y-auto">
        <div className="w-full max-w-[420px] mx-auto flex flex-col flex-1">

          {/* Branding */}
          <div className="mb-10 md:mb-12">
            <div className="flex items-center gap-2 mb-2">
              <Logo className="w-8 h-8" withText={true} textColor="text-[#12251D]" />
            </div>
            <p className="text-[14px] text-[#5A6961] font-normal mt-1.5">
              Intelligence for Every Farm. Impact for Our Planet.
            </p>
          </div>

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-[38px] md:text-[40px] font-bold text-[#12251D] leading-tight mb-3 tracking-tight">
              Welcome Back!
            </h1>
            <p className="text-[16px] text-[#5A6961] leading-relaxed">
              Sign in to continue your journey<br />
              toward smarter and sustainable farming.
            </p>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col">

            {/* Social + Divider */}
            <SocialLoginButtons />

            {/* Email */}
            <div className="flex flex-col mb-5">
              <label className="text-[14px] font-semibold text-[#12251D] mb-2">
                Email address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-[18px] h-[18px] text-[#9BAAA2]" strokeWidth={1.7} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full h-[54px] pl-11 pr-4 bg-white border border-[#DCE5DE] rounded-[10px] text-[15px] text-[#12251D] placeholder-[#A8B5AF] outline-none focus:border-[#075C32] focus:ring-2 focus:ring-[#075C32]/10 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col mb-5">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="text-[14px] font-semibold text-[#12251D]">
                  Password
                </label>
                <Link href="#" className="text-[14px] font-semibold text-[#075C32] hover:text-[#064a28] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-[18px] h-[18px] text-[#9BAAA2]" strokeWidth={1.7} />
                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full h-[54px] pl-11 pr-4 bg-white border border-[#DCE5DE] rounded-[10px] text-[15px] text-[#12251D] placeholder-[#A8B5AF] outline-none focus:border-[#075C32] focus:ring-2 focus:ring-[#075C32]/10 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Remember / Secure */}
            <div className="flex items-center justify-between mb-7">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  role="checkbox"
                  aria-checked={rememberMe}
                  tabIndex={0}
                  className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-colors cursor-pointer ${
                    rememberMe
                      ? "bg-[#075C32] border-[#075C32]"
                      : "bg-white border-[#B8C8BC] hover:border-[#075C32]"
                  }`}
                  onClick={() => setRememberMe(!rememberMe)}
                  onKeyDown={(e) => e.key === " " && setRememberMe(!rememberMe)}
                >
                  {rememberMe && <Check className="w-3 h-3 text-white" strokeWidth={3.5} />}
                </div>
                <span className="text-[14px] text-[#12251D]">Remember me</span>
              </label>

              <div className="flex items-center gap-1.5 text-[#075C32]">
                <span className="text-[14px]">Secure login</span>
                <ShieldCheck className="w-[17px] h-[17px]" strokeWidth={1.8} />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              id="login-submit"
              type="submit"
              className="w-full h-[54px] bg-[#075C32] hover:bg-[#064a28] text-white rounded-[10px] font-semibold text-[16px] flex items-center justify-center relative transition-colors mb-6 cursor-pointer"
            >
              <span>Sign In</span>
              <ArrowRight className="absolute right-5 w-5 h-5" strokeWidth={2} />
            </button>

            {/* Create Account */}
            <div className="text-center text-[15px] text-[#5A6961] mb-10">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#075C32] font-semibold hover:text-[#064a28] transition-colors">
                Create one
              </Link>
            </div>

          </form>

          {/* New to FloraNet Card */}
          <div className="w-full bg-[#F6FAF6] border border-[#E0E9E1] rounded-[18px] p-6 flex items-start gap-4 mb-12">
            <div className="min-w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center border border-[#E0E9E1] shadow-sm flex-shrink-0">
              <Logo className="w-6 h-6" withText={false} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[16px] font-bold text-[#12251D] mb-1.5">New to FloraNet?</h3>
              <p className="text-[14px] text-[#5A6961] leading-relaxed mb-3.5">
                Create an account and start using<br />
                AI-powered tools to improve your<br />
                farm productivity.
              </p>
              <Link
                href="/signup"
                className="text-[14px] font-semibold text-[#075C32] flex items-center gap-1 hover:text-[#064a28] transition-colors group w-fit"
              >
                Get Started{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="px-8 md:px-12 lg:px-14 pb-8">
        <div className="w-full max-w-[420px] mx-auto flex items-center gap-2 text-[13px] text-[#9BAAA2] flex-wrap">
          <Link href="#" className="hover:text-[#12251D] transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link href="#" className="hover:text-[#12251D] transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link href="#" className="hover:text-[#12251D] transition-colors">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
