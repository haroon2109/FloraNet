"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Layers, MapPin, Scan, Sparkles } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';

const LeafletFieldMap = dynamic(() => import('@/components/map/LeafletFieldMap'), {
  ssr: false,
  loading: () => <SkeletonCard className="h-[420px] w-full" />,
});

export default function FieldOverviewMap() {
  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col h-full min-h-[480px]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#168A45] animate-pulse" />
            <h3 className="text-[16px] font-bold text-[#102A20]">
              Geospatial Field Map Overview
            </h3>
          </div>
          <p className="text-[12px] text-[#607469] mt-0.5">
            Real-time OpenStreetMap & Sentinel-2 spectral NDVI parcel boundaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[#EAF5EC] text-[#075C32] rounded-lg text-[11.5px] font-bold border border-[#C4E7D0] flex items-center gap-1.5">
            <MapPin size={13} />
            <span>Interactive Leaflet Map</span>
          </span>
        </div>
      </div>

      {/* Real Leaflet OpenStreetMap Canvas */}
      <div className="flex-1 w-full min-h-[380px]">
        <LeafletFieldMap />
      </div>

    </div>
  );
}
