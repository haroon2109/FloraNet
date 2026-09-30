import React from 'react';
import { MapPin, Droplets, Thermometer, Clock } from 'lucide-react';

const fieldSummaryInfo: any = { name: '', location: '', healthScore: '', healthTrend: '', metrics: '', crop: '', healthStatus: '', area: '' };


export default function FieldSummary() {
  return (
    <div className="relative z-10 -mt-[120px] px-8 w-full max-w-[1600px] mx-auto mb-6">
      <div className="bg-white rounded-[20px] shadow-[0_4px_18px_rgba(20,60,40,0.04)] border border-[#E2E9E5] p-6 flex flex-col xl:flex-row gap-8 w-full">
        
        {/* Left: Aerial Image and Name */}
        <div className="flex items-start gap-6 flex-1 min-w-0">
          {/* Mock Field Aerial Photo via CSS art */}
          <div className="w-[180px] h-[120px] rounded-xl bg-[#2E5E3D] shrink-0 border border-[#E2E9E5] relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7FB08A] to-[#2E5E3D]"></div>
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20 transform rotate-[-15deg]"></div>
            <div className="absolute top-0 left-1/3 w-[1px] h-full bg-white/20 transform rotate-[15deg]"></div>
            <div className="absolute top-0 left-2/3 w-[1px] h-full bg-white/20 transform rotate-[15deg]"></div>
          </div>
          
          <div className="flex flex-col py-2 justify-center">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-[28px] font-bold text-[#102A2A] leading-tight">{fieldSummaryInfo.name}</h2>
              <span className="px-3 py-1 bg-[#EAF6EE] text-[#087A45] text-[12px] font-semibold rounded-md border border-[#087A45]/20">
                {fieldSummaryInfo.healthStatus}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-[14px] text-[#102A2A] font-medium mb-2">
              {fieldSummaryInfo.crop} <span className="text-[#647474]">•</span> {fieldSummaryInfo.area}
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#647474]">
              <MapPin size={14} />
              {fieldSummaryInfo.location}
            </div>
          </div>
        </div>

        <div className="hidden xl:block w-[1px] h-[120px] bg-[#E2E9E5]"></div>

        {/* Right: Health Score & Metrics */}
        <div className="flex flex-col sm:flex-row gap-10 shrink-0 py-2">
          
          {/* Health Score */}
          <div className="flex flex-col min-w-[150px]">
            <span className="text-[12px] font-medium text-[#647474] mb-3">Field Health Score</span>
            <div className="flex items-center gap-4">
              <div className="relative w-[64px] h-[64px]">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#E2E9E5" strokeWidth="10" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#087A45" strokeWidth="10" strokeDasharray="282.7" strokeDashoffset={`${282.7 - (282.7 * fieldSummaryInfo.healthScore / 100)}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
                  <span className="text-[20px] font-bold text-[#102A2A] leading-none">{fieldSummaryInfo.healthScore}</span>
                  <span className="text-[9px] text-[#647474] leading-none mt-0.5">/100</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-[#087A45] mb-1">{fieldSummaryInfo.healthStatus}</span>
                <span className="text-[11px] font-semibold text-[#087A45]">
                  {fieldSummaryInfo.healthTrend}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden sm:block w-[1px] h-[80px] self-center bg-[#E2E9E5]"></div>

          {/* Quick Metrics */}
          <div className="flex gap-10 self-center">
            
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-medium text-[#647474]">Soil Moisture</span>
              <div className="flex items-center gap-2">
                <Droplets size={16} className="text-[#4D9DE0]" />
                <span className="text-[18px] font-bold text-[#102A2A] leading-none">{fieldSummaryInfo.metrics.soilMoisture}</span>
              </div>
              <span className="text-[12px] text-[#647474]">Optimal</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-medium text-[#647474]">Temperature</span>
              <div className="flex items-center gap-2">
                <Thermometer size={16} className="text-[#E84C3D]" />
                <span className="text-[18px] font-bold text-[#102A2A] leading-none">{fieldSummaryInfo.metrics.soilTemp}</span>
              </div>
              <span className="text-[12px] text-[#647474]">Optimal</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-medium text-[#647474]">Last Updated</span>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#647474]" />
                <span className="text-[18px] font-bold text-[#102A2A] leading-none">{fieldSummaryInfo.metrics.lastUpdated}</span>
              </div>
              <span className="text-[12px] text-[#647474]">Today</span>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
