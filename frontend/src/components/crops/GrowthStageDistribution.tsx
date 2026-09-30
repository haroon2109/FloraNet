"use client";

import React from 'react';
import Link from 'next/link';
import { Sprout, Leaf, Flower2, Layers, Sun } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { GrowthStageItem } from '@/types/crops';

const STAGE_ORDER = ['Initial', 'Vegetative', 'Flowering', 'Podding', 'Maturity'];

export default function GrowthStageDistribution() {
  const { fields } = useFarm();

  // Count real registered fields per growth stage (normalized casing).
  const growthStages: GrowthStageItem[] = fields.length > 0
    ? STAGE_ORDER.map((stage) => ({
        stage: stage as GrowthStageItem['stage'],
        count: fields.filter(
          (f) => (f.growthStage || '').toLowerCase() === stage.toLowerCase()
        ).length,
      }))
    : [];

  const renderStageIcon = (stage: string) => {
    switch (stage) {
      case 'Initial':
        return <Sprout size={18} className="text-[#168A45]" strokeWidth={2} />;
      case 'Vegetative':
        return <Leaf size={18} className="text-[#168A45]" strokeWidth={2} />;
      case 'Flowering':
        return <Flower2 size={18} className="text-[#168A45]" strokeWidth={2} />;
      case 'Podding':
        return <Layers size={18} className="text-[#168A45]" strokeWidth={2} />;
      case 'Maturity':
        return <Sun size={18} className="text-[#D97706]" strokeWidth={2} />;
      default:
        return <Sprout size={18} className="text-[#168A45]" strokeWidth={2} />;
    }
  };

  return (
    <div className="bg-white border border-[#E1E8E2] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-[#102A20]">Growth Stage Distribution</h3>
        <Link 
          href="/crop-details" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          2.5D Simulator
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Horizontal Stages Row */}
      {fields.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-[#607469] mb-4">
          No crops registered yet — stage counts appear when a farm plot is registered on the backend.
        </p>
      ) : (
        <div className="grid grid-cols-5 gap-2 mb-4 text-center">
          {growthStages.map((gs) => (
            <Link
              key={gs.stage}
              href="/crop-details"
              className="flex flex-col items-center gap-1.5 p-2 bg-[#F9FBF9] hover:bg-[#F0F7F2] rounded-xl border border-[#F0F4F1] hover:border-[#C4E7D0] transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-[#EAF5EC] flex items-center justify-center border border-[#D5E6D8] group-hover:scale-105 transition-transform">
                {renderStageIcon(gs.stage)}
              </div>
              <span className="text-[11px] font-semibold text-[#52645D] leading-tight truncate w-full">
                {gs.stage}
              </span>
              <span className="text-[13px] font-bold text-[#102A20]">
                {gs.count}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Soft Green Notification Panel with Live Simulator Trigger */}
      <Link 
        href="/crop-details"
        className="bg-[#EEF7F0] hover:bg-[#E2F2E6] border border-[#D5E6D8] rounded-xl p-3 flex items-center justify-between text-[12px] font-semibold text-[#075C32] transition-colors group cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Sprout size={16} strokeWidth={2.2} className="shrink-0" />
          <span>Launch 2.5D Root &amp; Canopy Growth Simulator</span>
        </div>
        <span className="text-[13px] font-bold group-hover:translate-x-1 transition-transform">→</span>
      </Link>

    </div>
  );
}
