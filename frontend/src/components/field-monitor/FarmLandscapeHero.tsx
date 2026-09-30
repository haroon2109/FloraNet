"use client";

import React from 'react';
import Image from 'next/image';

export default function FarmLandscapeHero() {
  return (
    <div className="relative w-full h-[200px] sm:h-[240px] md:h-[260px] rounded-[24px] overflow-hidden mb-6 shadow-[0_4px_25px_rgba(7,92,50,0.05)] border border-[#DCE8DE] pointer-events-none">
      {/* Farm Landscape Background */}
      <Image 
        src="/images/home/hero_farm_landscape.jpg"
        alt="FloraNet Field Monitor Landscape"
        fill
        priority
        className="object-cover object-center"
        sizes="(max-width: 1200px) 100vw, 1200px"
      />

      {/* Gradient Ambient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-[#F7F9F7]" />

      {/* SVG Animation & Environmental Layer */}
      <div className="absolute inset-0 overflow-hidden aria-hidden:true">
        
        {/* Animated Flying Drone */}
        <div className="drone-animated absolute top-6 right-1/3 opacity-85">
          <svg width="48" height="28" viewBox="0 0 60 35" fill="none" stroke="#2F5441" strokeWidth="1.8">
            <ellipse cx="30" cy="18" rx="12" ry="6" fill="#102A20" opacity="0.8" />
            <line x1="12" y1="12" x2="48" y2="24" stroke="#168A45" strokeWidth="2" />
            <line x1="48" y1="12" x2="12" y2="24" stroke="#168A45" strokeWidth="2" />
            {/* Propellers */}
            <circle cx="12" cy="12" r="6" stroke="#168A45" strokeDasharray="3 3" />
            <circle cx="48" cy="12" r="6" stroke="#168A45" strokeDasharray="3 3" />
            <circle cx="12" cy="24" r="6" stroke="#168A45" strokeDasharray="3 3" />
            <circle cx="48" cy="24" r="6" stroke="#168A45" strokeDasharray="3 3" />
          </svg>
        </div>

        {/* IoT Weather Station Pole in Field */}
        <div className="absolute bottom-6 left-1/3 w-8 h-20 opacity-75">
          <svg viewBox="0 0 40 100" fill="none" stroke="#2F5441" strokeWidth="2">
            <line x1="20" y1="100" x2="20" y2="20" stroke="#102A20" strokeWidth="3" />
            <circle cx="20" cy="20" r="6" fill="#168A45" />
            <line x1="8" y1="30" x2="32" y2="30" />
            <circle cx="8" cy="30" r="3" fill="#D97706" />
            <circle cx="32" cy="30" r="3" fill="#D97706" />
          </svg>
        </div>

        {/* Floating Clouds */}
        <div className="cloud-animated absolute top-4 left-10 w-24 h-8 opacity-60">
          <svg viewBox="0 0 100 40" fill="white">
            <path d="M 20 30 A 12 12 0 0 1 30 14 A 16 16 0 0 1 60 12 A 14 14 0 0 1 80 22 A 10 10 0 0 1 84 30 Z" />
          </svg>
        </div>

        {/* Flying Birds */}
        <div className="birds-animated absolute top-8 left-1/4 opacity-40">
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

        @keyframes droneFloat {
          0% { transform: translate(0px, 0px); }
          50% { transform: translate(-20px, 8px); }
          100% { transform: translate(0px, 0px); }
        }

        @keyframes birdFloat {
          0% { transform: translate(0px, 0px); }
          50% { transform: translate(15px, -6px); }
          100% { transform: translate(0px, 0px); }
        }

        .cloud-animated {
          animation: cloudDrift 50s infinite ease-in-out;
        }

        .drone-animated {
          animation: droneFloat 18s infinite ease-in-out;
        }

        .birds-animated {
          animation: birdFloat 35s infinite ease-in-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .cloud-animated,
          .drone-animated,
          .birds-animated {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
