import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function WeatherStationCard() {
  return (
    <div className="bg-white border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.04)] flex flex-col h-full relative overflow-hidden">
      <h2 className="text-[15px] font-semibold text-[#102A2A] mb-4 z-10 relative">Weather Station</h2>
      
      <div className="flex flex-col z-10 relative mt-2">
        <span className="text-[18px] font-bold text-[#087A45] mb-1">Online</span>
        <span className="text-[13px] text-[#647474]">All systems normal</span>
      </div>

      <button className="mt-auto px-4 py-2 bg-white border border-[#087A45]/30 rounded-lg text-[12px] font-semibold text-[#087A45] hover:bg-[#EAF6EE] transition-colors flex items-center justify-center gap-2 w-max z-10 relative">
        View Station Data <ArrowRight size={14} />
      </button>

      {/* Station Illustration (CSS Art) */}
      <div className="absolute right-[-10px] bottom-[-20px] w-[140px] h-[160px] z-0 opacity-90">
         <div className="relative w-full h-full">
            {/* Pole */}
            <div className="absolute bottom-0 left-[60px] w-[6px] h-[140px] bg-[#D1D5D4] rounded-t-sm"></div>
            
            {/* Top Anemometer */}
            <div className="absolute top-[20px] left-[60px] w-[2px] h-[20px] bg-[#A1A1AA]"></div>
            <div className="absolute top-[20px] left-[45px] w-[35px] h-[2px] bg-[#A1A1AA]"></div>
            <div className="absolute top-[16px] left-[45px] w-[8px] h-[8px] bg-[#FAFAF8] rounded-full border border-[#D1D5D4]"></div>
            <div className="absolute top-[16px] left-[73px] w-[8px] h-[8px] bg-[#FAFAF8] rounded-full border border-[#D1D5D4]"></div>
            
            {/* Sensor Box 1 */}
            <div className="absolute top-[60px] left-[53px] w-[20px] h-[30px] bg-[#FAFAF8] rounded-sm border border-[#D1D5D4] flex flex-col justify-evenly p-[2px]">
              <div className="w-full h-[2px] bg-[#D1D5D4]"></div>
              <div className="w-full h-[2px] bg-[#D1D5D4]"></div>
              <div className="w-full h-[2px] bg-[#D1D5D4]"></div>
            </div>

            {/* Arm & Sensor Box 2 */}
            <div className="absolute top-[100px] left-[30px] w-[30px] h-[4px] bg-[#D1D5D4]"></div>
            <div className="absolute top-[90px] left-[15px] w-[15px] h-[25px] bg-[#FAFAF8] rounded-sm border border-[#D1D5D4] flex flex-col justify-evenly p-[2px]">
              <div className="w-full h-[2px] bg-[#D1D5D4]"></div>
              <div className="w-full h-[2px] bg-[#D1D5D4]"></div>
            </div>
         </div>
      </div>
    </div>
  );
}
