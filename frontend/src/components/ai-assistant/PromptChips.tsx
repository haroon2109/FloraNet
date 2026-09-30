import React from 'react';
import { Sprout } from 'lucide-react';

const quickPrompts: any = [];


interface PromptChipsProps {
  onPromptClick: (prompt: string) => void;
}

export default function PromptChips({ onPromptClick }: PromptChipsProps) {
  return (
    <div className="flex flex-nowrap overflow-x-auto gap-3 pb-4 scrollbar-hide snap-x">
      {quickPrompts.map((prompt: any, idx: any) => (
        <button 
          key={idx}
          onClick={() => onPromptClick(prompt)}
          className="snap-start flex items-center gap-2 bg-white border border-[#E4EAE7] px-4 py-2.5 rounded-full shadow-[0_4px_20px_rgba(20,60,40,0.04)] hover:-translate-y-0.5 hover:border-[#16834D]/30 transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-[#16834D]/30"
        >
          <Sprout size={14} className="text-[#16834D]" />
          <span className="text-[13px] font-medium text-[#102A2A] whitespace-nowrap">{prompt}</span>
        </button>
      ))}
    </div>
  );
}
