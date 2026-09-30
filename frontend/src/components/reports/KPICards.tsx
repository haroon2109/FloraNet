"use client";

import React from 'react';
import { LayoutGrid, Sprout, Map, IndianRupee, TrendingUp } from 'lucide-react';
import { reportsPageData } from '@/data/reportsData';
import { ReportKPIMetric } from '@/types/reports';

export default function KPICards() {
  const { kpis } = reportsPageData;

  const renderIcon = (type: ReportKPIMetric['iconType']) => {
    switch (type) {
      case 'fields':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#168A45] shrink-0 border border-[#D5E6D8]">
            <LayoutGrid size={18} strokeWidth={2} />
          </div>
        );
      case 'crops':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#168A45] shrink-0 border border-[#D5E6D8]">
            <Sprout size={18} strokeWidth={2.2} />
          </div>
        );
      case 'area':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#168A45] shrink-0 border border-[#D5E6D8]">
            <Map size={18} strokeWidth={2} />
          </div>
        );
      case 'expenses':
        return (
          <div className="w-9 h-9 rounded-full bg-[#FEF7E0] flex items-center justify-center text-[#D97706] shrink-0 border border-[#FCE8B2]">
            <IndianRupee size={18} strokeWidth={2.2} />
          </div>
        );
      case 'yield':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#168A45] shrink-0 border border-[#D5E6D8]">
            <Sprout size={18} strokeWidth={2.2} />
          </div>
        );
      case 'profit':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#168A45] shrink-0 border border-[#D5E6D8]">
            <TrendingUp size={18} strokeWidth={2.2} />
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6 z-20 relative">
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
            <div className="flex items-baseline gap-1">
              <span className="text-[20px] sm:text-[22px] font-bold text-[#102A20] leading-tight tracking-tight">
                {kpi.value}
              </span>
              {kpi.unit && (
                <span className="text-[12px] font-semibold text-[#52645D]">{kpi.unit}</span>
              )}
            </div>

            <div className="mt-1 text-[11px] font-medium">
              {kpi.change ? (
                <span className="text-[#188A45] font-semibold">{kpi.change}</span>
              ) : (
                <span className="text-[#52645D]">{kpi.subtext}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
