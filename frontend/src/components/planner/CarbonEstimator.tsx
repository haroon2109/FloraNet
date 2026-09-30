"use client";

import React, { useState } from "react";
import { Leaf, Sprout, TrendingUp, Info } from "lucide-react";

export default function CarbonEstimator() {
  const [hectares, setHectares] = useState<number>(10);
  const [practice, setPractice] = useState<string>("cover-crop");

  // Multipliers representing estimated metric tons of CO2e sequestered per hectare/year
  const multipliers: Record<string, number> = {
    "cover-crop": 2.5,
    "zero-tillage": 1.2,
    "biochar": 4.8,
    "agroforestry": 6.2
  };

  const currentMultiplier = multipliers[practice];
  const totalSequestered = (hectares * currentMultiplier).toFixed(1);

  return (
    <div className="bg-white rounded-[20px] p-6 border border-[#E8EFEA] shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">Carbon Sequestration Estimator</h2>
          <p className="text-[13px] text-[#6B7280] font-medium">FAO Guidelines SOC Estimation Model</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Controls */}
        <div className="flex-1 flex flex-col gap-5 border-r border-[#E8EFEA] pr-0 md:pr-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[14px] font-bold text-[#374151]">Farm Size (Hectares)</label>
              <span className="text-[14px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{hectares} ha</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="500" 
              value={hectares} 
              onChange={(e) => setHectares(parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#374151]">Primary Regenerative Practice</label>
            <select 
              value={practice}
              onChange={(e) => setPractice(e.target.value)}
              className="w-full bg-[#F9FAFB] border border-[#D1D5DB] text-[#111827] text-[14px] rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 font-medium"
            >
              <option value="cover-crop">Green Manure Cover Cropping</option>
              <option value="zero-tillage">Zero Tillage (Plantio Direto)</option>
              <option value="biochar">Biochar Application</option>
              <option value="agroforestry">Agroforestry Integration</option>
            </select>
          </div>
        </div>

        {/* Output */}
        <div className="flex-1 flex flex-col items-center justify-center bg-[#F0FDF4] rounded-[16px] p-6 border border-[#DCFCE7]">
          <span className="text-[13px] font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> Projected Sequestration
          </span>
          <div className="flex items-baseline gap-2 text-emerald-600">
            <span className="text-[42px] font-black leading-none tracking-tight">{totalSequestered}</span>
            <span className="text-[16px] font-bold">tCO₂e / yr</span>
          </div>
          
          <div className="mt-4 flex items-start gap-2 bg-white px-3 py-2 rounded-[10px] border border-emerald-100 shadow-sm w-full">
            <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#4B5563] leading-snug font-medium">
              This equates to removing approximately <span className="font-bold text-emerald-700">{Math.round(parseFloat(totalSequestered) * 0.217)} passenger vehicles</span> from the road annually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
