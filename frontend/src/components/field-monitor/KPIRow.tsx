"use client";

import React from 'react';
import { Activity, Droplets, Thermometer, CloudRain, Radio } from 'lucide-react';
import { fieldMonitorData } from '@/data/fieldMonitorData';
import { FieldMonitorKPIMetric } from '@/types/fieldMonitor';

export default function KPIRow() {
  const { kpis } = fieldMonitorData;

  const renderIcon = (type: FieldMonitorKPIMetric['iconType']) => {
    switch (type) {
      case 'health':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#168A45] shrink-0 border border-[#D5E6D8]">
            <Activity size={18} strokeWidth={2.2} />
          </div>
        );
      case 'moisture':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EBF3FE] flex items-center justify-center text-[#1A73E8] shrink-0 border border-[#D0E2FB]">
            <Droplets size={18} strokeWidth={2.2} fill="#1A73E8" className="fill-[#1A73E8]/20" />
          </div>
        );
      case 'temperature':
        return (
          <div className="w-9 h-9 rounded-full bg-[#FEF7E0] flex items-center justify-center text-[#D97706] shrink-0 border border-[#FCE8B2]">
            <Thermometer size={18} strokeWidth={2.2} />
          </div>
        );
      case 'rainfall':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EBF3FE] flex items-center justify-center text-[#1A73E8] shrink-0 border border-[#D0E2FB]">
            <CloudRain size={18} strokeWidth={2.2} />
          </div>
        );
      case 'sensors':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#168A45] shrink-0 border border-[#D5E6D8]">
            <Radio size={18} strokeWidth={2.2} />
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6 z-20 relative">
      {kpis.map((kpi) => (
        <div 
          key={kpi.id} 
          className="bg-white rounded-xl p-4 border border-[#E1E7E3] shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col justify-between hover:shadow-[0_4px_16px_rgba(20,60,40,0.08)] transition-shadow"
        >
          <div className="flex items-center gap-2.5 mb-2">
            {renderIcon(kpi.iconType)}
            <h4 className="text-[12px] font-semibold text-[#52645D] leading-snug truncate">{kpi.title}</h4>
          </div>

          <div>
            <div className="text-[20px] sm:text-[22px] font-bold text-[#102A20] leading-tight tracking-tight mb-1">
              {kpi.value}
            </div>

            <div className="flex items-center gap-1 text-[11px] font-medium">
              {kpi.comparisonType === 'positive' ? (
                <span className="text-[#188A45] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#188A45]" />
                  {kpi.comparison}
                </span>
              ) : kpi.comparisonType === 'negative' ? (
                <span className="text-[#E84A3C] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E84A3C]" />
                  {kpi.comparison}
                </span>
              ) : (
                <span className="text-[#52645D] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#889B91]" />
                  {kpi.comparison}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
