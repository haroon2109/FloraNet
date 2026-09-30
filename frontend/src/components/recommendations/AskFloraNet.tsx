"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot } from 'lucide-react';

export default function AskFloraNet() {
  return (
    <div className="bg-white border border-[#E2E9E5] rounded-2xl p-4 shadow-[0_4px_18px_rgba(20,60,40,0.04)] mb-5">
      <div className="flex items-center justify-between gap-4">
        
        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-[#102A2A] mb-1">Ask FloraNet AI</h3>
          <p className="text-[12px] text-[#647474] leading-relaxed mb-3 font-medium">
            Not sure what to do next?<br />
            Ask FloraNet AI for personalized advice.
          </p>

          <Link
            href="/ai-assistant"
            className="px-4 py-1.5 bg-white border border-[#087A45] hover:bg-[#EAF6EE] text-[12px] font-bold text-[#087A45] rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Ask Now</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* AI Assistant Robot Mascot Illustration */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#EAF6EE] border border-[#C4E7D0] flex flex-col items-center justify-center text-[#087A45] shrink-0 p-2 relative shadow-xs">
          <Bot size={36} strokeWidth={2} className="text-[#087A45] animate-bounce-slow" />
          <span className="text-[9px] font-bold text-[#087A45] uppercase tracking-wider mt-0.5">FloraAI</span>
        </div>

      </div>
    </div>
  );
}
