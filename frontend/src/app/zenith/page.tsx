"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import ZenithFooter from '@/components/zenith/ZenithFooter';

// All 3D components loaded client-side only (WebGL + SSR unsafe)
const ZenithHero        = dynamic(() => import('@/components/zenith/ZenithHero'),        { ssr: false, loading: () => <SectionSkeleton h={600} /> });
const ZenithCorridors   = dynamic(() => import('@/components/zenith/ZenithCorridors'),   { ssr: false, loading: () => <SectionSkeleton h={540} /> });
const ZenithSoilExplorer= dynamic(() => import('@/components/zenith/ZenithSoilExplorer'),{ ssr: false, loading: () => <SectionSkeleton h={540} /> });
const ZenithDiagnostics = dynamic(() => import('@/components/zenith/ZenithDiagnostics'), { ssr: false, loading: () => <SectionSkeleton h={600} /> });

function SectionSkeleton({ h }: { h: number }) {
  return (
    <div className="w-full animate-pulse rounded-3xl" style={{ height: h, background: 'linear-gradient(135deg, #0a1f0d 0%, #04100a 100%)' }}>
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-emerald-600/50">
          <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span className="text-[12px] font-bold tracking-widest uppercase">Loading 3D Scene…</span>
        </div>
      </div>
    </div>
  );
}

export default function ZenithPage() {
  return (
    <main className="w-full overflow-x-hidden" style={{ background: '#010805', fontFamily: "'Inter', sans-serif" }}>
      {/* 1. Hero: Farm Diorama + Nav + CTA */}
      <ZenithHero />

      {/* 2. BRICS Multi-Polar Corridor Ring */}
      <ZenithCorridors />

      {/* 3. Digital Soil Core Strata Inspector */}
      <ZenithSoilExplorer />

      {/* 4. Holographic Plant Digital Twin + Gemini Diagnostics */}
      <ZenithDiagnostics />

      {/* 5. Features Grid + CTA + Footer */}
      <ZenithFooter />
    </main>
  );
}
