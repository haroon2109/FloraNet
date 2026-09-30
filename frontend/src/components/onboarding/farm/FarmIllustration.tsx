import React from 'react';
import Image from 'next/image';
import { Satellite, ChartNoAxesCombined, Globe2 } from 'lucide-react';

const features = [
  {
    Icon: Satellite,
    title: 'Accurate Insights',
    description: 'Location and crop data power\nprecise AI recommendations.',
  },
  {
    Icon: ChartNoAxesCombined,
    title: 'Higher Productivity',
    description: 'Data-driven guidance to improve\nyields and reduce costs.',
  },
  {
    Icon: Globe2,
    title: 'Sustainable Future',
    description: 'Smart farming today for a better\nplanet tomorrow.',
  },
];

export default function FarmIllustration() {
  return (
    <div className="relative w-full h-full lg:rounded-r-[20px] overflow-hidden hidden lg:flex flex-col min-h-[700px] bg-[#C8DCC8]">

      {/* ── Background Illustration ── */}
      <Image
        src="/images/onboarding_illustration_v2.jpg"
        alt="Agri-tech female farmer with tablet in greenhouse agricultural fields"
        fill
        className="object-cover object-center"
        priority
        quality={95}
      />

      {/* ── Top-Right Foliage ── */}
      <div className="absolute top-0 right-0 w-[55%] pointer-events-none z-10">
        <Image
          src="/images/foliage_top.png"
          alt=""
          width={600}
          height={350}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* ── Headline (upper-left, over bright sky) ── */}
      <div className="relative z-20 pt-12 pl-10 pr-8 max-w-[380px]">
        <h2 className="text-[38px] font-bold text-[#103629] leading-[1.15] tracking-tight mb-4">
          Better data.<br />
          Better outcomes.
        </h2>
        <p className="text-[15px] text-[#1a3a28] leading-[1.6] font-medium">
          The more we know about your farm,<br />
          the better we can help you grow<br />
          sustainably.
        </p>
      </div>

      {/* ── Feature Info Card (middle, overlaying landscape) ── */}
      <div className="relative z-20 mt-8 ml-10 mr-6">
        <div className="bg-white/96 backdrop-blur-md rounded-[20px] px-7 py-6 shadow-[0_10px_30px_rgba(20,50,35,0.10)] border border-white/80 max-w-[380px]">
          {features.map((feature: any, idx: any) => (
            <React.Fragment key={idx}>
              <div className="flex items-start gap-4">
                <div className="min-w-[44px] h-[44px] bg-[#EFF7F1] rounded-full flex items-center justify-center flex-shrink-0">
                  <feature.Icon className="w-5 h-5 text-[#2F8F4E]" strokeWidth={1.7} />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#12251D] leading-snug">{feature.title}</h4>
                  <p className="text-[13px] text-[#5A6961] leading-snug mt-0.5 whitespace-pre-line">
                    {feature.description}
                  </p>
                </div>
              </div>
              {idx < features.length - 1 && (
                <div className="w-full h-px bg-[#EEF3EF] my-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

    </div>
  );
}
