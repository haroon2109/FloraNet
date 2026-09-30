"use client";

import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  Droplets, 
  CheckCircle2, 
  Info, 
  ChevronRight,
  ShieldCheck,
  Compass,
  Sprout
} from 'lucide-react';
import { bricsSoilProfiles, BRICSSoilProfile } from '@/data/bricsSoilTaxonomy';

interface BRICSSoilTaxonomyExplorerProps {
  onSelectSoil?: (soil: BRICSSoilProfile) => void;
  selectedSoilId?: string;
}

export default function BRICSSoilTaxonomyExplorer({
  onSelectSoil,
  selectedSoilId = 'in-alluvial'
}: BRICSSoilTaxonomyExplorerProps) {
  const [selectedNation, setSelectedNation] = useState<'All' | 'Brazil' | 'Russia' | 'India' | 'China' | 'South Africa' | 'Egypt' | 'Ethiopia' | 'Iran' | 'UAE'>('India');
  const [activeSoil, setActiveSoil] = useState<BRICSSoilProfile>(
    bricsSoilProfiles.find(s => s.id === selectedSoilId) || bricsSoilProfiles[0]
  );

  const filteredSoils = selectedNation === 'All' 
    ? bricsSoilProfiles 
    : bricsSoilProfiles.filter(s => s.country === selectedNation);

  return (
    <div className="w-full bg-white border border-[#E1E8E4] rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[#F0F4F1]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#075C32] text-white flex items-center justify-center shadow-xs shrink-0">
            <Layers size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-[#102A20]">
                BRICS Soil Pedology & Stratum Intelligence
              </h3>
              <span className="bg-[#E8F5EB] text-[#075C32] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#CDE5D5]">
                Agronomic Registry
              </span>
            </div>
            <p className="text-[12px] text-[#55695F] mt-0.5">
              Major regional soil belts, pH chemistry, natural fertility envelopes, and prescriptive bio-amendments
            </p>
          </div>
        </div>

        {/* Nation Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#F5F8F6] p-1 rounded-xl border border-[#E2EBE5] overflow-x-auto hide-scrollbar">
          {(['India', 'Brazil', 'Russia', 'China', 'South Africa', 'Egypt', 'Ethiopia', 'Iran', 'UAE'] as const).map((nation) => (
            <button
              key={nation}
              type="button"
              onClick={() => {
                setSelectedNation(nation);
                const firstSoil = bricsSoilProfiles.find(s => s.country === nation);
                if (firstSoil) {
                  setActiveSoil(firstSoil);
                  onSelectSoil?.(firstSoil);
                }
              }}
              className={`px-3 py-1.5 text-[11.5px] font-bold rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedNation === nation
                  ? 'bg-[#075C32] text-white shadow-xs'
                  : 'text-[#50645B] hover:text-[#102A20] hover:bg-white/60'
              }`}
            >
              <span>
                {nation === 'Brazil' && '🇧🇷'}
                {nation === 'Russia' && '🇷🇺'}
                {nation === 'India' && '🇮🇳'}
                {nation === 'China' && '🇨🇳'}
                {nation === 'South Africa' && '🇿🇦'}
                {nation === 'Egypt' && '🇪🇬'}
                {nation === 'Ethiopia' && '🇪🇹'}
                {nation === 'Iran' && '🇮🇷'}
                {nation === 'UAE' && '🇦🇪'}
              </span>
              <span>{nation}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Soil Cards List (Left 40%) + Deep Inspector (Right 60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Soil Profiles List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[460px] overflow-y-auto pr-1 hide-scrollbar">
          {filteredSoils.map((soil) => {
            const isSelected = activeSoil.id === soil.id;
            return (
              <button
                key={soil.id}
                type="button"
                onClick={() => {
                  setActiveSoil(soil);
                  onSelectSoil?.(soil);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-[#F4FAF6] border-[#168A45] shadow-xs'
                    : 'bg-white hover:bg-[#F9FAF9] border-[#E3ECE6] text-[#102A20]'
                }`}
              >
                {/* Soil Stratum Swatch */}
                <div 
                  className="w-8 h-8 rounded-lg shrink-0 border border-black/10 shadow-2xs flex items-center justify-center"
                  style={{ backgroundColor: soil.hexColor }}
                >
                  <span className="text-white text-[10px] font-bold opacity-80">
                    {soil.phRange.split(' ')[0]}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-[13.5px] font-bold text-[#102A20] truncate">
                      {soil.name}
                    </h4>
                    {soil.percentageCoverage && (
                      <span className="text-[10px] font-semibold text-[#168A45] bg-[#E8F5EB] px-1.5 py-0.2 rounded shrink-0">
                        {soil.percentageCoverage}
                      </span>
                    )}
                  </div>

                  {soil.localName && (
                    <p className="text-[11px] text-[#61756B] truncate mt-0.5">
                      {soil.localName}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1.5 text-[10.5px] text-[#55695F]">
                    <span className="bg-[#EEF5F0] px-1.5 py-0.5 rounded font-semibold text-[#075C32]">
                      {soil.scientificClassification.split('/')[0].trim()}
                    </span>
                    <span>•</span>
                    <span className="truncate">{soil.fertilityLevel} Fertility</span>
                  </div>
                </div>

                <ChevronRight 
                  size={16} 
                  className={`mt-1 shrink-0 transition-transform ${
                    isSelected ? 'text-[#075C32] translate-x-0.5' : 'text-[#A0B0A7]'
                  }`} 
                />
              </button>
            );
          })}
        </div>

        {/* Right Column: Deep Agronomic Telemetry Inspector */}
        <div className="lg:col-span-7 bg-[#FAFCFA] border border-[#E3ECE6] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-[17px] font-bold text-[#102A20]">
                    {activeSoil.name}
                  </h4>
                  <span className="text-[11px] font-semibold text-[#075C32] bg-[#E8F5EB] px-2 py-0.5 rounded-full border border-[#CDE5D5]">
                    {activeSoil.category}
                  </span>
                </div>
                {activeSoil.localName && (
                  <p className="text-[12px] font-semibold text-[#55695F] mt-0.5">
                    Local Name: {activeSoil.localName} • {activeSoil.scientificClassification}
                  </p>
                )}
              </div>

              <div 
                className="px-3 py-1 rounded-xl text-white text-[11px] font-bold shadow-2xs shrink-0"
                style={{ backgroundColor: activeSoil.hexColor }}
              >
                {activeSoil.country}
              </div>
            </div>

            {/* Description */}
            <p className="text-[13px] text-[#405248] leading-relaxed mb-4">
              {activeSoil.description}
            </p>

            {/* Geographic Distribution Strip */}
            <div className="p-3 bg-white border border-[#E1E8E4] rounded-xl mb-4 flex items-start gap-2.5">
              <Compass size={16} className="text-[#075C32] shrink-0 mt-0.5" />
              <div className="text-[12px]">
                <span className="font-bold text-[#102A20]">Geographic Distribution: </span>
                <span className="text-[#55695F]">{activeSoil.location}</span>
              </div>
            </div>

            {/* 3 Metric Pills: pH Range, Fertility Level, Drainage */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-white border border-[#E1E8E4] rounded-xl text-center">
                <span className="text-[10px] font-bold text-[#7E9086] uppercase tracking-wider block">pH Envelope</span>
                <span className="text-[13px] font-bold text-[#102A20] mt-0.5 block">{activeSoil.phRange}</span>
              </div>

              <div className="p-3 bg-white border border-[#E1E8E4] rounded-xl text-center">
                <span className="text-[10px] font-bold text-[#7E9086] uppercase tracking-wider block">Fertility Level</span>
                <span className="text-[13px] font-bold text-[#168A45] mt-0.5 block">{activeSoil.fertilityLevel.split(' ')[0]}</span>
              </div>

              <div className="p-3 bg-white border border-[#E1E8E4] rounded-xl text-center">
                <span className="text-[10px] font-bold text-[#7E9086] uppercase tracking-wider block">Drainage Rate</span>
                <span className="text-[13px] font-bold text-[#102A20] mt-0.5 block">{activeSoil.drainage.split(' ')[0]}</span>
              </div>
            </div>

            {/* Best Suited Crops */}
            <div className="mb-4">
              <span className="text-[11px] font-bold text-[#55695F] uppercase tracking-wider block mb-1.5">
                High-Yield Agronomic Crops
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeSoil.bestCrops.map((crop) => (
                  <span 
                    key={crop}
                    className="px-2.5 py-1 bg-white border border-[#D5E3D8] text-[#102A20] text-[11.5px] font-semibold rounded-lg shadow-2xs flex items-center gap-1"
                  >
                    <Sprout size={12} className="text-[#168A45]" />
                    {crop}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Bio-Amendments & Regeneration Plan */}
            <div className="p-3.5 bg-[#EAF5EC]/70 border border-[#C4E7D0] rounded-xl">
              <div className="flex items-center gap-1.5 mb-1.5">
                <ShieldCheck size={14} className="text-[#075C32]" />
                <span className="text-[12px] font-bold text-[#075C32]">Prescriptive Bio-Amendments:</span>
              </div>
              <ul className="space-y-1 text-[11.5px] font-medium text-[#102A20]">
                {activeSoil.bioAmendments.map((amendment, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#168A45]" />
                    <span>{amendment}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
