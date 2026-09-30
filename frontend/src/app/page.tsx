"use client";

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import ImpactStats from '@/components/landing/ImpactStats';
import PlatformSolutions from '@/components/landing/PlatformSolutions';
import InteractiveSandbox from '@/components/landing/InteractiveSandbox';
import BRICSImpact from '@/components/landing/BRICSImpact';
import FAQSection from '@/components/landing/FAQSection';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';
import BackToTopFab from '@/components/ui/BackToTopFab';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F9F7] font-sans text-[#102A20] selection:bg-[#EEF7F0] selection:text-[#075C32] w-full overflow-x-hidden">
      {/* Sticky Top Navigation */}
      <Navbar />
      
      {/* Main Landing Sections */}
      <main className="w-full flex flex-col items-center pt-[72px]">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Horizontal Credibility Metrics Strip */}
        <ImpactStats />

        {/* 3. One Platform. Every Solution. */}
        <PlatformSolutions />

        {/* 4. Interactive Live Sandbox (Digital Twin, NDVI Radar, AI Advisor, Mandi) */}
        <InteractiveSandbox />

        {/* 5. BRICS Impact Section (5 Country Illustration Cards) */}
        <BRICSImpact />

        {/* 6. Frequently Asked Questions Accordion */}
        <FAQSection />

        {/* 7. Final CTA Section */}
        <FinalCTA />
      </main>

      {/* 4-Column Institutional Footer */}
      <Footer />

      {/* Floating Back to Top Button */}
      <BackToTopFab />
    </div>
  );
}
