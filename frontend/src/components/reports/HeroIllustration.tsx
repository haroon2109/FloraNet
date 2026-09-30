"use client";

import React from 'react';
import Image from 'next/image';

export default function HeroIllustration() {
  return (
    <div className="relative w-full h-[200px] sm:h-[240px] md:h-[260px] rounded-[24px] overflow-hidden mb-6 shadow-[0_4px_25px_rgba(7,92,50,0.05)] border border-[#DCE8DE] pointer-events-none">
      <Image 
        src="/images/home/hero_farm_landscape.jpg"
        alt="FloraNet Reports Landscape"
        fill
        priority
        className="object-cover object-center"
        sizes="(max-width: 1200px) 100vw, 1200px"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-[#F7F9F7]" />
    </div>
  );
}
