"use client";

import React from 'react';
import Image from 'next/image';

export default function HeroBackground() {
  return (
    <div className="relative w-full h-[220px] sm:h-[260px] md:h-[280px] rounded-[24px] overflow-hidden mb-6 shadow-[0_4px_25px_rgba(7,92,50,0.05)] border border-[#DCE8DE] pointer-events-none">
      {/* Farm Landscape Image */}
      <Image 
        src="/images/home/hero_farm_landscape.jpg"
        alt="FloraNet Farm Landscape"
        fill
        priority
        className="object-cover object-center"
        sizes="(max-width: 1200px) 100vw, 1200px"
      />

      {/* Gradient Ambient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-[#F7F9F7]" />

      {/* Subtle SVG Animated Layer */}
      <div className="absolute inset-0 overflow-hidden aria-hidden:true">
        
        {/* Animated Windmill */}
        <div className="absolute top-12 right-1/3 w-10 h-16 opacity-75">
          <svg viewBox="0 0 100 160" fill="none" stroke="#2F5441">
            {/* Tower */}
            <path d="M 45 160 L 48 80 L 52 80 L 55 160 Z" fill="#2F5441" opacity="0.3" />
            {/* Rotating Blades */}
            <g className="windmill-blades origin-[50px_80px]">
              <line x1="50" y1="80" x2="50" y2="30" stroke="#2F5441" strokeWidth="4" />
              <line x1="50" y1="80" x2="50" y2="130" stroke="#2F5441" strokeWidth="4" />
              <line x1="50" y1="80" x2="0" y2="80" stroke="#2F5441" strokeWidth="4" />
              <line x1="50" y1="80" x2="100" y2="80" stroke="#2F5441" strokeWidth="4" />
            </g>
          </svg>
        </div>

        {/* Floating Clouds */}
        <div className="cloud-animated absolute top-4 left-10 w-24 h-8 opacity-60">
          <svg viewBox="0 0 100 40" fill="white">
            <path d="M 20 30 A 12 12 0 0 1 30 14 A 16 16 0 0 1 60 12 A 14 14 0 0 1 80 22 A 10 10 0 0 1 84 30 Z" />
          </svg>
        </div>

        {/* Flying Birds */}
        <div className="birds-animated absolute top-8 right-1/4 opacity-40">
          <svg width="40" height="20" viewBox="0 0 48 24" fill="none" stroke="#2F5441" strokeWidth="1.5">
            <path d="M 2 12 Q 8 4 14 12 Q 20 4 26 12" />
            <path d="M 24 16 Q 28 10 32 16 Q 36 10 40 16" />
          </svg>
        </div>

      </div>

      <style jsx>{`
        @keyframes windmillRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

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

        .windmill-blades {
          animation: windmillRotate 25s linear infinite;
        }

        .cloud-animated {
          animation: cloudDrift 50s infinite ease-in-out;
        }

        .birds-animated {
          animation: birdFloat 35s infinite ease-in-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .windmill-blades,
          .cloud-animated,
          .birds-animated {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
