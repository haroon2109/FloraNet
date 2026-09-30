import React from 'react';
import Image from "next/image";
import { Sparkles, Scan, Droplets } from 'lucide-react';
import FeatureHighlights from "./FeatureHighlights";

export default function SignupIllustration() {
  return (
    <div className="w-full h-full relative flex flex-col lg:rounded-r-[22px] overflow-hidden bg-[#C8DCC8] min-h-[500px] lg:min-h-full">

      {/* Background Image */}
      <Image
        src="/images/login_illustration.jpg"
        alt="Farmer with tablet in green agricultural fields"
        fill
        className="object-cover object-center"
        priority
        quality={95}
      />

      {/* Top-Right Foliage Overlay */}
      <div className="absolute top-0 right-0 w-[55%] pointer-events-none z-10">
        <Image
          src="/images/foliage_top.png"
          alt=""
          width={600}
          height={350}
          className="w-full h-auto object-contain opacity-90"
        />
      </div>

      {/* Floating Ambient HUD Badge 1: Top Right */}
      <div className="absolute top-6 right-6 z-20 hidden xl:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/80 shadow-[0_8px_20px_rgba(16,44,34,0.12)] animate-in fade-in duration-300">
        <div className="w-6 h-6 rounded-full bg-[#EAF5EC] text-[#075C32] flex items-center justify-center">
          <Sparkles size={13} />
        </div>
        <span className="text-[12px] font-bold text-[#102C22]">14,800+ Active Farmers</span>
      </div>

      {/* Floating Ambient HUD Badge 2: Middle Right */}
      <div className="absolute top-[38%] right-8 z-20 hidden 2xl:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/80 shadow-[0_8px_20px_rgba(16,44,34,0.12)] animate-in fade-in duration-300">
        <div className="w-6 h-6 rounded-full bg-[#EAF5EC] text-[#075C32] flex items-center justify-center">
          <Scan size={13} />
        </div>
        <span className="text-[12px] font-bold text-[#102C22]">Sentinel-2 NDVI Active</span>
      </div>

      {/* Header Quote */}
      <div className="relative z-20 pt-10 lg:pt-12 pl-8 lg:pl-12 pr-8 max-w-lg">
        <div className="flex gap-[5px] mb-3">
          <div className="w-[13px] h-[18px] bg-[#0D3023] rounded-[3px]" />
          <div className="w-[13px] h-[18px] bg-[#0D3023] rounded-[3px]" />
        </div>
        <h2 className="text-[30px] lg:text-[34px] font-bold text-[#0D3023] leading-[1.18] tracking-tight">
          A better tomorrow<br />
          starts with smarter<br />
          farming today.
        </h2>
        <p className="text-[14px] text-[#244234] font-medium mt-2">
          Autonomous agricultural telemetry grounded across 5 BRICS research institutes.
        </p>
      </div>

      {/* Bottom Feature Card */}
      <div className="relative z-20 mt-auto pb-8 lg:pb-10 px-5 lg:px-8 w-full flex justify-center lg:justify-end">
        <FeatureHighlights />
      </div>

    </div>
  );
}
