import React from 'react';
import { Sunrise, Sunset } from 'lucide-react';

export default function SunriseSunsetCard() {
  return (
    <div className="bg-white border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.04)] flex flex-col h-full">
      <h2 className="text-[15px] font-semibold text-[#102A2A] mb-5">Sunrise & Sunset</h2>
      
      <div className="flex flex-col gap-6 flex-1 justify-center">
        
        {/* Sunrise */}
        <div className="flex items-center gap-4">
          <div className="w-[45px] h-[45px] shrink-0">
             <Sunrise size={45} strokeWidth={1.5} className="text-[#F2A900]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[18px] font-bold text-[#102A2A] leading-none mb-1">6:05 AM</span>
            <span className="text-[12px] text-[#647474]">Sunrise</span>
          </div>
        </div>

        {/* Sunset */}
        <div className="flex items-center gap-4">
          <div className="w-[45px] h-[45px] shrink-0">
             <Sunset size={45} strokeWidth={1.5} className="text-[#E84C3D]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[18px] font-bold text-[#102A2A] leading-none mb-1">7:12 PM</span>
            <span className="text-[12px] text-[#647474]">Sunset</span>
          </div>
        </div>

      </div>
    </div>
  );
}
