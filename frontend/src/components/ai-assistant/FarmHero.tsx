"use client";

import React from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { aiAssistantPageData } from '@/data/aiAssistantData';

interface FarmHeroProps {
  onPromptClick: (prompt: string) => void;
}

export default function FarmHero({ onPromptClick }: FarmHeroProps) {
  const { quickPrompts } = aiAssistantPageData;

  return (
    <div className="px-8 mb-6">
      
      {/* Farm Landscape Container */}
      <div className="relative w-full h-[200px] sm:h-[240px] md:h-[260px] rounded-[24px] overflow-hidden mb-5 shadow-[0_4px_25px_rgba(7,92,50,0.05)] border border-[#DCE8DE] pointer-events-none">
        <Image 
          src="/images/home/hero_farm_landscape.jpg"
          alt="FloraNet AI Agronomist Landscape"
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-[#F7F9F7]" />
      </div>

      {/* Quick AI Prompts Row */}
      <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar py-1">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPromptClick(prompt)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E1E7E3] hover:border-[#168A45] hover:bg-[#EAF6EE] rounded-full text-[13px] font-semibold text-[#102A20] shadow-xs hover:shadow-md transition-all shrink-0 group cursor-pointer"
          >
            <Sparkles size={14} className="text-[#168A45] group-hover:scale-110 transition-transform" strokeWidth={2} />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
