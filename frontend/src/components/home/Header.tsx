"use client";

import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-[64px] px-6 sm:px-8 flex items-center justify-end bg-transparent z-30">
      <div className="flex items-center gap-5">
        <button 
          type="button"
          aria-label="Search" 
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#102A20] hover:text-[#075C32] hover:bg-white/80 transition-colors"
        >
          <Search size={20} strokeWidth={1.8} />
        </button>

        <button 
          type="button"
          aria-label="Notifications" 
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#102A20] hover:text-[#075C32] hover:bg-white/80 transition-colors relative"
        >
          <Bell size={20} strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-[17px] h-[17px] bg-[#075C32] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#F7F9F7]">
            3
          </span>
        </button>

        <button 
          type="button"
          aria-label="User Account" 
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#102A20] hover:text-[#075C32] hover:bg-white/80 transition-colors"
        >
          <User size={20} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
