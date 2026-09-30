"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Brain, Leaf, Droplets, CloudSun, TrendingUp, Sparkles, Play } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { getLandingTranslation } from '@/data/landingTranslations';
import { BrazilFlag, RussiaFlag, IndiaFlag, ChinaFlag, SouthAfricaFlag } from '@/components/ui/BRICSFlagIcon';

export default function HeroSection() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const { userProfile } = useFarm();
  const t = getLandingTranslation(userProfile?.language || 'en');

  const bricsCountries = [
    {
      name: 'Brazil',
      flagSvg: <BrazilFlag className="w-7 h-7" />,
    },
    {
      name: 'Russia',
      flagSvg: <RussiaFlag className="w-7 h-7" />,
    },
    {
      name: 'India',
      flagSvg: <IndiaFlag className="w-7 h-7" />,
    },
    {
      name: 'China',
      flagSvg: <ChinaFlag className="w-7 h-7" />,
    },
    {
      name: 'South Africa',
      flagSvg: <SouthAfricaFlag className="w-7 h-7" />,
    },
  ];

  return (
    <section className="w-full pt-8 pb-14 md:pt-14 md:pb-20 relative overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Main Typography & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            {/* Top Eyebrow Badge */}
            <div className="flex items-center gap-2 mb-4 w-fit px-3 py-1 bg-[#EAF5EC] border border-[#C4E7D0] rounded-full text-[#075C32] text-[12px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#168A45] animate-pulse" />
              <span>{t.hero.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-[40px] sm:text-[48px] md:text-[54px] lg:text-[56px] font-bold text-[#102A20] tracking-tight leading-[1.08] mb-5">
              {t.hero.titlePart1}<br />
              <span className="text-[#075C32]">{t.hero.titlePart2}</span><br />
              {t.hero.titlePart3}
            </h1>

            {/* Subtitle Paragraph */}
            <p className="text-[16px] md:text-[17px] text-[#4A5D54] leading-[1.6] mb-8 max-w-[490px]">
              {t.hero.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mb-3.5">
              <Link
                href="/signup"
                className="bg-[#075C32] hover:bg-[#064E2A] text-white text-[15px] font-bold px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-[0_2px_10px_rgba(7,92,50,0.2)] hover:shadow-[0_4px_16px_rgba(7,92,50,0.3)] hover:scale-105"
              >
                <span>{t.hero.ctaGetStarted}</span>
                <ArrowRight size={17} strokeWidth={2.2} />
              </Link>

              <Link
                href="/home"
                className="bg-white hover:bg-[#F2F6F3] border border-[#D5E1D8] text-[#075C32] text-[15px] font-bold px-6 py-3.5 rounded-xl transition-all shadow-xs flex items-center gap-2 hover:scale-105"
              >
                <Play size={15} className="fill-[#075C32]" />
                <span>{t.hero.ctaLiveDemo}</span>
              </Link>
            </div>

            {/* Micro Tagline */}
            <p className="text-[13px] text-[#71847B] font-medium mb-9">
              ⚡ Instant live sandbox available · No sign-in required
            </p>

            {/* Trusted Across BRICS Partner Flags */}
            <div>
              <p className="text-[11px] font-bold tracking-wider text-[#8A9B93] uppercase mb-3">
                {t.hero.trustedBy}
              </p>
              <div className="flex items-center gap-6 sm:gap-7">
                {bricsCountries.map((c) => (
                  <div key={c.name} className="flex flex-col items-center gap-1.5 group cursor-default">
                    <div className="transition-transform group-hover:scale-110">
                      {c.flagSvg}
                    </div>
                    <span className="text-[11.5px] font-medium text-[#506259]">
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 3D Isometric Farm Island with Orbit & 5 Intelligence Badges */}
          <div className="lg:col-span-6 flex items-center justify-center relative min-h-[460px] sm:min-h-[520px] md:min-h-[560px]">
            
            {/* Background Radial Glow with breathing animation */}
            <div className="absolute w-[460px] h-[460px] rounded-full bg-radial from-[#CDEBD4]/70 via-[#E4F5E8]/30 to-transparent blur-3xl pointer-events-none animate-pulse" />

            {/* Ambient Rotating Circular Orbit Ring */}
            <div className="absolute w-[360px] sm:w-[420px] md:w-[460px] h-[360px] sm:h-[420px] md:h-[460px] rounded-full border border-dashed border-[#A8CEB3] pointer-events-none animate-[spin_80s_linear_infinite]" />

            {/* Central Farm Miniature Ecosystem Image */}
            <div className="relative w-[300px] sm:w-[360px] md:w-[410px] h-[300px] sm:h-[360px] md:h-[410px] rounded-full overflow-hidden shadow-[0_20px_60px_rgba(7,92,50,0.18)] border-4 border-white bg-[#DCEDE0]">
              <img
                src="/images/landing/hero_farm_isometric.jpg"
                alt="FloraNet Illustrated Isometric Agricultural World"
                loading="eager"
                draggable={false}
                width={410}
                height={410}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', maxWidth: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
              />
            </div>

            {/* NODE 1: TOP - AI Insights */}
            <div 
              onMouseEnter={() => setActiveNode('ai')}
              onMouseLeave={() => setActiveNode(null)}
              className="absolute -top-3 sm:top-0 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center group cursor-pointer"
            >
              <div className="bg-white border border-[#E0EBE2] shadow-[0_4px_16px_rgba(16,42,32,0.08)] rounded-full p-2.5 group-hover:scale-115 group-hover:bg-[#075C32] transition-all">
                <Brain size={18} className="text-[#075C32] group-hover:text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[11.5px] font-bold text-[#102A20] mt-1 bg-white/95 px-2.5 py-0.5 rounded-full border border-[#E5EFE8] shadow-2xs">
                AI Agronomist
              </span>
              {activeNode === 'ai' && (
                <div className="absolute top-12 z-20 bg-[#102A20] text-emerald-300 text-[11px] p-2.5 rounded-xl shadow-xl border border-[#168A45]/40 w-52 text-center animate-in fade-in zoom-in-95">
                  <p className="font-bold">Multi-Persona RAG Engine</p>
                  <p className="text-white text-[10px]">Verified BRICS Agronomy Corpora (ICAR · Embrapa · ARC · CAAS)</p>
                </div>
              )}
            </div>

            {/* NODE 2: LEFT TOP - Smart Farming */}
            <div 
              onMouseEnter={() => setActiveNode('satellite')}
              onMouseLeave={() => setActiveNode(null)}
              className="absolute top-[22%] -left-2 sm:left-2 md:left-4 z-10 flex flex-col items-center group cursor-pointer"
            >
              <div className="bg-white border border-[#E0EBE2] shadow-[0_4px_16px_rgba(16,42,32,0.08)] rounded-full p-2.5 group-hover:scale-115 group-hover:bg-[#075C32] transition-all">
                <Leaf size={18} className="text-[#075C32] group-hover:text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[11.5px] font-bold text-[#102A20] mt-1 bg-white/95 px-2.5 py-0.5 rounded-full border border-[#E5EFE8] shadow-2xs">
                Sentinel-2 NDVI
              </span>
              {activeNode === 'satellite' && (
                <div className="absolute top-12 z-20 bg-[#102A20] text-emerald-300 text-[11px] p-2.5 rounded-xl shadow-xl border border-[#168A45]/40 w-52 text-center animate-in fade-in zoom-in-95">
                  <p className="font-bold">Sentinel-2 NDVI Canopy Health</p>
                  <p className="text-white text-[10px]">10m Resolution Multispectral Imagery</p>
                </div>
              )}
            </div>

            {/* NODE 3: LEFT - Resource Optimization */}
            <div 
              onMouseEnter={() => setActiveNode('water')}
              onMouseLeave={() => setActiveNode(null)}
              className="absolute bottom-[20%] -left-3 sm:left-0 md:left-2 z-10 flex flex-col items-center group cursor-pointer"
            >
              <div className="bg-white border border-[#E0EBE2] shadow-[0_4px_16px_rgba(16,42,32,0.08)] rounded-full p-2.5 group-hover:scale-115 group-hover:bg-[#075C32] transition-all">
                <Droplets size={18} className="text-[#075C32] group-hover:text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[11.5px] font-bold text-[#102A20] mt-1 bg-white/95 px-2.5 py-0.5 rounded-full border border-[#E5EFE8] shadow-2xs">
                LoRa Irrigation
              </span>
              {activeNode === 'water' && (
                <div className="absolute bottom-12 z-20 bg-[#102A20] text-emerald-300 text-[11px] p-2.5 rounded-xl shadow-xl border border-[#168A45]/40 w-52 text-center animate-in fade-in zoom-in-95">
                  <p className="font-bold">LoRa Valve Irrigation Control</p>
                  <p className="text-white text-[10px]">Live Soil-Moisture Triggered Pulses</p>
                </div>
              )}
            </div>

            {/* NODE 4: RIGHT TOP - Climate Resilience */}
            <div 
              onMouseEnter={() => setActiveNode('weather')}
              onMouseLeave={() => setActiveNode(null)}
              className="absolute top-[22%] -right-2 sm:right-2 md:right-4 z-10 flex flex-col items-center group cursor-pointer"
            >
              <div className="bg-white border border-[#E0EBE2] shadow-[0_4px_16px_rgba(16,42,32,0.08)] rounded-full p-2.5 group-hover:scale-115 group-hover:bg-[#075C32] transition-all">
                <CloudSun size={18} className="text-[#075C32] group-hover:text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[11.5px] font-bold text-[#102A20] mt-1 bg-white/95 px-2.5 py-0.5 rounded-full border border-[#E5EFE8] shadow-2xs">
                Micro-Climates
              </span>
              {activeNode === 'weather' && (
                <div className="absolute top-12 z-20 bg-[#102A20] text-emerald-300 text-[11px] p-2.5 rounded-xl shadow-xl border border-[#168A45]/40 w-52 text-center animate-in fade-in zoom-in-95">
                  <p className="font-bold">{userProfile?.state || 'Maharashtra'}, {userProfile?.country || 'India'}</p>
                  <p className="text-white text-[10px]">Live Open-Meteo Micro-Climate Feeds</p>
                </div>
              )}
            </div>

            {/* NODE 5: RIGHT - Sustainable Growth */}
            <div 
              onMouseEnter={() => setActiveNode('mandi')}
              onMouseLeave={() => setActiveNode(null)}
              className="absolute bottom-[20%] -right-3 sm:right-0 md:right-2 z-10 flex flex-col items-center group cursor-pointer"
            >
              <div className="bg-white border border-[#E0EBE2] shadow-[0_4px_16px_rgba(16,42,32,0.08)] rounded-full p-2.5 group-hover:scale-115 group-hover:bg-[#075C32] transition-all">
                <TrendingUp size={18} className="text-[#075C32] group-hover:text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[11.5px] font-bold text-[#102A20] mt-1 bg-white/95 px-2.5 py-0.5 rounded-full border border-[#E5EFE8] shadow-2xs">
                BRICS Mandi
              </span>
              {activeNode === 'mandi' && (
                <div className="absolute bottom-12 z-20 bg-[#102A20] text-emerald-300 text-[11px] p-2.5 rounded-xl shadow-xl border border-[#168A45]/40 w-52 text-center animate-in fade-in zoom-in-95">
                  <p className="font-bold">{userProfile?.currencySymbol || '₹'} Commodity Arbitrage</p>
                  <p className="text-white text-[10px]">Live Spot Price Exchange Feeds</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
