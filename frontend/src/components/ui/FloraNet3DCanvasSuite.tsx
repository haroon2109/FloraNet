"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Globe, Layers, Scan, Sparkles } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';

const DigitalGlobe3D = dynamic(() => import('@/components/3d/DigitalGlobe3D'), {
  ssr: false,
  loading: () => <SkeletonCard className="h-[420px]" />,
});

const SoilCoreSlice3D = dynamic(() => import('@/components/3d/SoilCoreSlice3D'), {
  ssr: false,
  loading: () => <SkeletonCard className="h-[420px]" />,
});

const HolographicPlantTwin3D = dynamic(() => import('@/components/3d/HolographicPlantTwin3D'), {
  ssr: false,
  loading: () => <SkeletonCard className="h-[420px]" />,
});

export default function FloraNet3DCanvasSuite() {
  const [activeTab, setActiveTab] = useState<'globe' | 'soil' | 'plant'>('globe');

  return (
    <div className="w-full bg-white border border-[#E1E7E3] rounded-[32px] p-6 sm:p-8 shadow-[0_4px_30px_rgba(7,92,50,0.06)] mb-10">
      
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={20} className="text-[#168A45]" />
            <h2 className="text-[20px] sm:text-[24px] font-bold text-[#102A2A]">
              FloraNet 3D Canvas Suite
            </h2>
          </div>
          <p className="text-[13px] font-medium text-[#647474]">
            Interactive 3D WebGL Digital Twin components for spatial agricultural intelligence.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F9F6] border border-[#E1E7E3] rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('globe')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
              activeTab === 'globe'
                ? 'bg-[#075C32] text-white shadow-xs'
                : 'text-[#52645D] hover:bg-white hover:text-[#102A20]'
            }`}
          >
            <Globe size={15} />
            <span>1. BRICS Earth</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('soil')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
              activeTab === 'soil'
                ? 'bg-[#075C32] text-white shadow-xs'
                : 'text-[#52645D] hover:bg-white hover:text-[#102A20]'
            }`}
          >
            <Layers size={15} />
            <span>2. Soil Core Slice</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plant')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
              activeTab === 'plant'
                ? 'bg-[#075C32] text-white shadow-xs'
                : 'text-[#52645D] hover:bg-white hover:text-[#102A20]'
            }`}
          >
            <Scan size={15} />
            <span>3. Holographic Twin</span>
          </button>
        </div>
      </div>

      {/* Dynamic 3D View Render */}
      <div className="w-full">
        {activeTab === 'globe' && <DigitalGlobe3D />}
        {activeTab === 'soil' && <SoilCoreSlice3D />}
        {activeTab === 'plant' && <HolographicPlantTwin3D />}
      </div>

    </div>
  );
}
