"use client";

import React from 'react';
import Image from 'next/image';

export default function HeroIllustration() {
  return (
    <div className="relative w-full h-[200px] sm:h-[240px] md:h-[260px] rounded-[24px] overflow-hidden mb-6 shadow-[0_4px_25px_rgba(7,92,50,0.05)] border border-[#DCE8DE] pointer-events-none">
      {/* Farm Landscape Background */}
      <Image 
        src="/images/home/hero_farm_landscape.jpg"
        alt="FloraNet Crops Farm Landscape"
        fill
        priority
        className="object-cover object-center"
        sizes="(max-width: 1200px) 100vw, 1200px"
      />

      {/* Gradient Ambient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-[#F7F9F7]" />

      {/* Environmental SVG Animation Layer */}
      <div className="absolute inset-0 overflow-hidden aria-hidden:true">
        {/* Floating Clouds */}
        <div className="cloud-animated absolute top-4 left-10 w-24 h-8 opacity-60">
          <svg viewBox="0 0 100 40" fill="white">
            <path d="M 20 30 A 12 12 0 0 1 30 14 A 16 16 0 0 1 60 12 A 14 14 0 0 1 80 22 A 10 10 0 0 1 84 30 Z" />
          </svg>
        </div>

        {/* Flying Birds Silhouette */}
        <div className="birds-animated absolute top-8 right-1/4 opacity-40">
          <svg width="40" height="20" viewBox="0 0 48 24" fill="none" stroke="#2F5441" strokeWidth="1.5">
            <path d="M 2 12 Q 8 4 14 12 Q 20 4 26 12" />
            <path d="M 24 16 Q 28 10 32 16 Q 36 10 40 16" />
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes cloudDrift {
          0% { transform: translateX(0px); }
          50% { transform: translateX(50px); }
          100% { transform: translateX(0px); }
        }

        @keyframes birdFloat {
          0% { transform: translate(0px, 0px); }
          50% { transform: translate(-15px, -6px); }
          100% { transform: translate(0px, 0px); }
        }

        .cloud-animated {
          animation: cloudDrift 50s infinite ease-in-out;
        }

        .birds-animated {
          animation: birdFloat 35s infinite ease-in-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .cloud-animated,
          .birds-animated {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
