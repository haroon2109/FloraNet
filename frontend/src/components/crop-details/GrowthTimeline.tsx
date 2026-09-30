"use client";

import React, { useState } from 'react';
import { Sprout, Sun, Droplets, FlaskConical, CheckCircle2 } from 'lucide-react';
import CropGrowthEngine2D from '@/components/crops/CropGrowthEngine2D';
import WhatsAppPrescriptionShare from '@/components/ui/WhatsAppPrescriptionShare';

interface StageDetail {
  index: number;
  title: string;
  daysRange: string;
  status: 'completed' | 'current' | 'upcoming';
  waterDemand: string;
  npkRecommendation: string;
  gddAccumulated: string;
  fieldAction: string;
}

/**
 * Generic maize phenological reference model (agronomy-textbook stage ranges,
 * cumulative GDD targets and standard nutrient splits). This is a static
 * knowledge reference for planning — NOT a live reading of any specific
 * field. Quantities follow published ICAR/extension guidance for hybrid
 * maize. The GDD values are typical cumulative targets, not observed ones.
 */
const PHENOLOGICAL_STAGES: StageDetail[] = [
  {
    index: 0,
    title: 'Sowing & Emergence',
    daysRange: 'Days 0–10',
    status: 'completed',
    waterDemand: '8–10 mm / week',
    npkRecommendation: 'Basal Dose: 20:40:20 NPK + Beejamrutha seed inoculation',
    gddAccumulated: '120 GDD',
    fieldAction: 'Maintain soil moisture at seed depth (5 cm) to secure uniform germination.',
  },
  {
    index: 1,
    title: 'Early Vegetative (V2–V4)',
    daysRange: 'Days 10–25',
    status: 'completed',
    waterDemand: '12–15 mm / week',
    npkRecommendation: 'First N-Split: 30 kg/acre Urea (46:0:0) + Zinc Sulphate',
    gddAccumulated: '350 GDD',
    fieldAction: 'First weeding cycle; scout for early shoot fly and cutworm vectors.',
  },
  {
    index: 2,
    title: 'Rapid Vegetative (V6)',
    daysRange: 'Days 25–45 (Current)',
    status: 'current',
    waterDemand: '18–22 mm / week',
    npkRecommendation: 'Second N-Split: 45 kg/acre Urea + 200 L/acre Jeevamrutha',
    gddAccumulated: '680 GDD',
    fieldAction: 'Peak nitrogen uptake period. Ensure root-zone moisture remains above 35%.',
  },
  {
    index: 3,
    title: 'Tasseling & Pollination',
    daysRange: 'Days 45–65',
    status: 'upcoming',
    waterDemand: '25–30 mm / week (Critical)',
    npkRecommendation: 'Foliar Spray: 13:0:45 Potassium Nitrate (1.5%) + Boron',
    gddAccumulated: '1100 GDD',
    fieldAction: 'Most moisture-sensitive stage. Prevent water stress to maximize kernel set.',
  },
  {
    index: 4,
    title: 'Grain Filling & Silking',
    daysRange: 'Days 65–85',
    status: 'upcoming',
    waterDemand: '15–18 mm / week',
    npkRecommendation: 'No nitrogen. Apply Potassium Schoenite for grain density.',
    gddAccumulated: '1450 GDD',
    fieldAction: 'Monitor earhead caterpillar; reduce irrigation as husks turn golden.',
  },
  {
    index: 5,
    title: 'Physiological Maturity',
    daysRange: 'Days 85–105',
    status: 'upcoming',
    waterDemand: '0–5 mm (Terminal dry down)',
    npkRecommendation: 'Harvest readiness. Terminal soil dry-down.',
    gddAccumulated: '1750 GDD',
    fieldAction: 'Check black layer at kernel base. Harvest when moisture drops to 14–16%.',
  },
];

export default function GrowthTimeline() {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(2); // Default to V6 Current
  const currentStage = PHENOLOGICAL_STAGES[selectedStageIdx];

  return (
    <div className="space-y-6 mb-6">
      
      {/* 1. Interactive 2.5D SVG Crop Growth Engine */}
      <CropGrowthEngine2D cropName="Reference Model (Maize)" initialStageIndex={selectedStageIdx} />

      {/* 2. Interactive Phenological Growth Scrubber & Milestone Timeline */}
      <div className="bg-white border border-[#E1E8E4] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)]">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#168A45] animate-pulse" />
              <h3 className="text-[16px] font-bold text-[#102A20]">
                Phenological Lifecycle Scrubber
              </h3>
            </div>
            <p className="text-[12px] text-[#607469] mt-0.5 font-medium">
              Click or scrub any maize growth stage to see textbook water, GDD and nutrition benchmarks for planning (not live field readings).
            </p>
          </div>

          <span className="text-[12px] font-bold text-[#075C32] bg-[#EAF5EC] px-3 py-1 rounded-full border border-[#C4E7D0] w-fit">
            {currentStage.daysRange}
          </span>
        </div>

        {/* Horizontal Lifecycle Node Scrubber */}
        <div className="relative mb-6 pt-2">
          
          {/* Connector Line Background */}
          <div className="absolute top-[28px] left-[5%] right-[5%] h-1 bg-[#E1E8E4] z-0" />
          
          {/* Active Connector Progress Line */}
          <div 
            className="absolute top-[28px] left-[5%] h-1 bg-[#168A45] z-0 transition-all duration-300"
            style={{ width: `${(selectedStageIdx / (PHENOLOGICAL_STAGES.length - 1)) * 90}%` }}
          />

          <div className="grid grid-cols-6 gap-2 text-center relative z-10">
            {PHENOLOGICAL_STAGES.map((stage, idx) => {
              const isSelected = selectedStageIdx === idx;
              const isPast = idx < 2;

              return (
                <button
                  key={stage.title}
                  type="button"
                  onClick={() => setSelectedStageIdx(idx)}
                  className="flex flex-col items-center group cursor-pointer focus:outline-none"
                >
                  {/* Node Circle */}
                  <div 
                    className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 border transition-all ${
                      isSelected
                        ? 'bg-[#075C32] text-white border-[#075C32] ring-4 ring-[#EAF5EC] scale-115 shadow-sm'
                        : isPast
                        ? 'bg-[#EAF5EC] text-[#075C32] border-[#C4E7D0]'
                        : 'bg-white text-[#889B91] border-[#E1E8E4] group-hover:border-[#075C32]'
                    }`}
                  >
                    {idx === 5 ? (
                      <Sun size={16} strokeWidth={2} />
                    ) : (
                      <Sprout size={16} strokeWidth={2} />
                    )}
                  </div>

                  {/* Stage Title */}
                  <h4 className={`text-[11px] font-bold leading-tight transition-colors ${
                    isSelected ? 'text-[#075C32]' : 'text-[#2D3E35] group-hover:text-[#075C32]'
                  }`}>
                    {stage.title.split(' ')[0]}
                  </h4>

                  {/* Days */}
                  <span className={`text-[9.5px] mt-0.5 font-semibold ${
                    isSelected ? 'text-[#075C32]' : 'text-[#889B91]'
                  }`}>
                    {stage.daysRange.split(' ')[0]} {stage.daysRange.split(' ')[1]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Stage Telemetry & Action Projection Card */}
        <div className="bg-[#F8FAF9] rounded-2xl p-4 sm:p-5 border border-[#E1E8E2] space-y-4 animate-in fade-in duration-150">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8EFEA] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#075C32] bg-[#EAF5EC] px-2 py-0.5 rounded-md">
                Reference Model · Stage {selectedStageIdx + 1} of 6
              </span>
              <h4 className="text-[15px] font-bold text-[#102A20] mt-1">
                {currentStage.title} ({currentStage.daysRange.replace(' (Current)', '')})
              </h4>
            </div>              <WhatsAppPrescriptionShare 
              title={`Phenological Protocol: ${currentStage.title}`}
              field="Reference Model (Maize)"
              prescription={currentStage.fieldAction}
              actionItems={[
                `Water Requirement: ${currentStage.waterDemand}`,
                `NPK Nutrition: ${currentStage.npkRecommendation}`,
                `GDD Metric: ${currentStage.gddAccumulated}`
              ]}
              variant="pill"
            />
          </div>

          {/* 3 Telemetry Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-xl border border-[#E1E8E2] shadow-2xs">
              <div className="flex items-center gap-1.5 text-[#075C32] text-[11px] font-bold mb-1">
                <Droplets size={13} />
                <span>Water Demand</span>
              </div>
              <span className="text-[13px] font-bold text-[#102A20]">{currentStage.waterDemand}</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E1E8E2] shadow-2xs">
              <div className="flex items-center gap-1.5 text-[#075C32] text-[11px] font-bold mb-1">
                <FlaskConical size={13} />
                <span>Nutritional Dosing</span>
              </div>
              <span className="text-[12px] font-bold text-[#102A20] line-clamp-2">{currentStage.npkRecommendation}</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E1E8E2] shadow-2xs">
              <div className="flex items-center gap-1.5 text-[#075C32] text-[11px] font-bold mb-1">
                <Sun size={13} />
                <span>Cumulative GDD</span>
              </div>
              <span className="text-[13px] font-bold text-[#102A20]">{currentStage.gddAccumulated}</span>
            </div>
          </div>

          {/* Action Protocol Text */}
          <div className="p-3 bg-[#EAF5EC] rounded-xl border border-[#C4E7D0] text-[12.5px] font-medium text-[#102A20] flex items-start gap-2">
            <CheckCircle2 size={16} className="text-[#075C32] shrink-0 mt-0.5" />
            <span>{currentStage.fieldAction}</span>
          </div>

        </div>

      </div>
    </div>
  );
}
