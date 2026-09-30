"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { getLandingTranslation } from '@/data/landingTranslations';

export default function FinalCTA() {
  const { userProfile } = useFarm();
  const t = getLandingTranslation(userProfile?.language || 'en');

  return (
    <section className="w-full pb-20 md:pb-28">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8">
        
        {/* Large Rounded CTA Block */}
        <div className="relative bg-[#EBF3ED] border border-[#D7E6DC] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(7,92,50,0.06)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* LEFT COLUMN: Text & Button */}
            <div className="lg:col-span-6 p-8 sm:p-10 md:p-12 lg:pr-6 z-10">
              <p className="text-[11.5px] font-bold tracking-wider text-[#075C32] uppercase mb-2">
                THE FUTURE IS GROWING
              </p>
              <h2 className="text-[30px] sm:text-[34px] md:text-[36px] font-bold text-[#102A20] tracking-tight leading-[1.15] mb-4">
                {t.finalCta.title}
              </h2>
              <p className="text-[15px] sm:text-[16px] text-[#4A5D54] leading-[1.6] mb-8 max-w-[460px]">
                {t.finalCta.description}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/signup"
                  className="bg-[#075C32] hover:bg-[#064E2A] text-white text-[15px] font-bold px-6 py-3.5 rounded-xl transition-all inline-flex items-center gap-2 shadow-[0_2px_10px_rgba(7,92,50,0.2)] hover:shadow-[0_4px_16px_rgba(7,92,50,0.3)] hover:scale-105"
                >
                  <span>{t.finalCta.ctaButton}</span>
                  <ArrowRight size={17} strokeWidth={2.2} />
                </Link>

                <Link
                  href="/home"
                  className="bg-white hover:bg-[#F2F6F3] border border-[#CDE0D3] text-[#075C32] text-[15px] font-bold px-6 py-3.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-2 hover:scale-105"
                >
                  <span>{t.finalCta.demoButton}</span>
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: Real Agronomists Photo + Sleek Floating Telemetry HUD */}
            <div className="lg:col-span-6 relative w-full h-[320px] sm:h-[360px] md:h-[400px] lg:h-[420px]">
              <img
                src="/images/landing/final_cta_farmers.jpg"
                alt="FloraNet modern sustainable farming future"
                loading="lazy"
                draggable={false}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
              />
              {/* Soft Gradient Overlay for seamless blending with text */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#EBF3ED] via-[#EBF3ED]/30 to-transparent lg:block hidden" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#EBF3ED] via-transparent to-transparent lg:hidden block" />

              {/* Floating Holographic AgAI Telemetry HUD Card (as in reference) */}
              <div className="absolute bottom-6 right-6 z-20 bg-white/85 backdrop-blur-md border border-white/70 shadow-[0_8px_32px_rgba(7,92,50,0.14)] rounded-[14px] p-3.5 w-[220px] sm:w-[240px] text-left hidden sm:block">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E1EDE4]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#168A45] animate-pulse" />
                    <span className="text-[12px] font-bold text-[#102A20]">FloraNet AgAI</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#075C32] bg-[#E8F5EB] px-1.5 py-0.5 rounded">Live</span>
                </div>
                
                <div className="space-y-1.5 text-[11.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#55695F]">Field Registry</span>
                    <span className="font-bold text-[#075C32]">Live Backend</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#55695F]">Weather Feed</span>
                    <span className="font-bold text-[#102A20]">Open-Meteo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#55695F]">Soil Data</span>
                    <span className="font-bold text-[#168A45]">ISRIC SoilGrids</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#55695F]">Hazard Alerts</span>
                    <span className="font-bold text-[#102A20]">NASA EONET</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
