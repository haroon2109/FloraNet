"use client";

import React from 'react';
import Link from 'next/link';
import { Radio, Droplets, Leaf, CloudRain, Wind, Signal } from 'lucide-react';
import { fieldMonitorData } from '@/data/fieldMonitorData';
import { IoTSensorItem } from '@/types/fieldMonitor';

export default function SensorStatus() {
  const { sensors } = fieldMonitorData;

  const renderSensorIcon = (type: IoTSensorItem['iconType']) => {
    switch (type) {
      case 'weather':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
            <Radio size={16} strokeWidth={2.2} />
          </div>
        );
      case 'soil':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
            <Droplets size={16} strokeWidth={2.2} fill="#1A73E8" fillOpacity={0.2} />
          </div>
        );
      case 'leaf':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
            <Leaf size={16} strokeWidth={2.2} />
          </div>
        );
      case 'rain':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
            <CloudRain size={16} strokeWidth={2.2} />
          </div>
        );
      case 'wind':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
            <Wind size={16} strokeWidth={2.2} />
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-[#E1E8E2] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-[15px] font-bold text-[#102A20]">IoT Sensor Status</h3>
        <Link 
          href="/sensors" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View all 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Sensor Rows List */}
      <div className="space-y-3">
        {sensors.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl border border-[#F0F4F1] bg-[#FAFCFA] hover:bg-[#F5F9F6] transition-colors">
            
            <div className="flex items-center gap-3">
              {renderSensorIcon(s.iconType)}
              <div>
                <h4 className="text-[13px] font-bold text-[#102A20] leading-tight">{s.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-[#EAF5EC] text-[#168A45] text-[10px] font-bold border border-[#C4E7D0]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#168A45]" />
                    {s.status}
                  </span>
                  <span className="text-[11px] text-[#52645D]">{s.lastUpdated}</span>
                </div>
              </div>
            </div>

            <Signal size={15} className="text-[#168A45] shrink-0" strokeWidth={2.2} />

          </div>
        ))}
      </div>

    </div>
  );
}
