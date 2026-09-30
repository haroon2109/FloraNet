"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { Menu, X } from 'lucide-react';
import LandingLanguageDropdown from '@/components/landing/LandingLanguageDropdown';
import PilotRegistrationModal from '@/components/landing/PilotRegistrationModal';
import { useFarm } from '@/context/farmContext';
import { getLandingTranslation } from '@/data/landingTranslations';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pilotModalOpen, setPilotModalOpen] = useState(false);
  const { userProfile } = useFarm();

  const currentLangCode = userProfile?.language || 'en-IN';
  const t = getLandingTranslation(currentLangCode);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F9F7]/90 backdrop-blur-md border-b border-[#E6EFE8]">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8 h-[72px] flex items-center justify-between">
        
        {/* Left: Brand Logo & Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logo className="w-8 h-8" withText={true} textColor="text-[#102A20]" />
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-[14.5px] font-medium text-[#485951]">
          <Link href="/home" className="hover:text-[#075C32] transition-colors">
            {t.nav.product}
          </Link>
          <Link href="/crop-details" className="hover:text-[#075C32] transition-colors">
            {t.nav.solutions}
          </Link>
          <Link href="/resources" className="hover:text-[#075C32] transition-colors">
            {t.nav.resources}
          </Link>
          <a href="#brics-impact" className="hover:text-[#075C32] transition-colors">
            {t.nav.bricsImpact}
          </a>
          <a href="#solutions" className="hover:text-[#075C32] transition-colors">
            {t.nav.pricing}
          </a>
          <Link href="/interop" className="hover:text-[#075C32] transition-colors">
            {t.nav.aboutUs}
          </Link>
        </nav>

        {/* Right: Language Selector + Pilot CTA + Primary CTA */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Interactive Multilingual Selector Dropdown */}
          <LandingLanguageDropdown />

          {/* Join Pilot Button */}
          <button
            type="button"
            onClick={() => setPilotModalOpen(true)}
            className="text-[13.5px] font-bold text-[#075C32] hover:text-[#054324] hover:bg-[#EAF5EC] px-3.5 py-2 rounded-xl transition-all border border-[#C4E7D0] cursor-pointer"
          >
            {t.nav.joinPilot}
          </button>

          {/* Get Started Button */}
          <Link
            href="/signup"
            className="bg-[#075C32] hover:bg-[#064E2A] text-white text-[14px] font-bold px-4 py-2 rounded-xl transition-all shadow-xs hover:scale-105"
          >
            {t.nav.getStarted}
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-[#2D3E35] hover:bg-black/5"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E6EFE8] px-6 py-5 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-4 text-[15px] font-medium text-[#2D3E35]">
            <Link 
              href="/home" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#075C32] transition-colors py-1"
            >
              {t.nav.product}
            </Link>
            <Link 
              href="/crop-details" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#075C32] transition-colors py-1"
            >
              {t.nav.solutions}
            </Link>
            <Link 
              href="/resources" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#075C32] transition-colors py-1"
            >
              {t.nav.resources}
            </Link>
            <a 
              href="#brics-impact" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#075C32] transition-colors py-1"
            >
              {t.nav.bricsImpact}
            </a>
            <a 
              href="#solutions" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#075C32] transition-colors py-1"
            >
              {t.nav.pricing}
            </a>
            <Link 
              href="/interop" 
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#075C32] transition-colors py-1"
            >
              {t.nav.aboutUs}
            </Link>
          </div>

          <div className="pt-5 mt-4 border-t border-[#EEF3F0] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#55695F]">Language:</span>
              <LandingLanguageDropdown />
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setPilotModalOpen(true);
              }}
              className="text-[14px] font-bold text-[#075C32] border border-[#C4E7D0] bg-[#EAF5EC] py-2.5 rounded-xl text-center cursor-pointer"
            >
              {t.nav.joinPilot}
            </button>

            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-[#075C32] text-white text-center text-[14px] font-bold py-3 rounded-xl shadow-xs"
            >
              {t.nav.getStarted}
            </Link>
          </div>
        </div>
      )}

      {/* Institutional Pilot Registration Modal */}
      <PilotRegistrationModal
        isOpen={pilotModalOpen}
        onClose={() => setPilotModalOpen(false)}
      />
    </header>
  );
}
