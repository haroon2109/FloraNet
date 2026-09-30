"use client";

import React from 'react';
import Link from 'next/link';
import { Sprout, MapPin, Activity, TrendingUp, TriangleAlert, Plus, Calendar } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { CropKPIMetric } from '@/types/crops';
import { healthStatusFor } from '@/components/crops/CropsTable';

export default function KPIGrid() {
  const { fields } = useFarm();

  // All KPI values derived from the REAL registered field list.
  const kpis: CropKPIMetric[] = fields.length > 0 ? [
    {
      id: 'kpi-1',
      title: 'Total Crops',
      value: String(fields.length),
      secondary: 'Registered on backend',
      iconType: 'crops',
    },
    {
      id: 'kpi-2',
      title: 'Total Area',
      value: `${fields
        .map((f) => parseFloat(f.area) || 0)
        .reduce((a, b) => a + b, 0)
        .toFixed(1)} acres`,
      secondary: 'Across all fields',
      iconType: 'area',
    },
    {
      id: 'kpi-3',
      title: 'Avg. Health Score',
      value: `${Math.round(fields.reduce((acc, f) => acc + (f.healthScore || 0), 0) / fields.length)} /100`,
      secondary: 'Live field registry',
      comparisonType: 'positive',
      iconType: 'health',
    },
    {
      id: 'kpi-4',
      title: 'High Performing',
      value: String(fields.filter((f) => healthStatusFor(f.healthScore) === 'Good').length),
      secondary: 'Score 80+ (live)',
      comparisonType: 'positive',
      iconType: 'trend',
    },
    {
      id: 'kpi-5',
      title: 'Needs Attention',
      value: String(fields.filter((f) => healthStatusFor(f.healthScore) === 'Needs Attention').length),
      secondary: 'Score below 60 (live)',
      comparisonType: 'neutral',
      iconType: 'warning',
    },
  ] : [];

  const renderIcon = (type: CropKPIMetric['iconType']) => {
    switch (type) {
      case 'crops':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#168A45] shrink-0 border border-[#D5E6D8]">
            <Sprout size={18} strokeWidth={2.2} />
          </div>
        );
      case 'area':
        return (
          <div className="w-9 h-9 rounded-lg bg-[#EAF5EC] flex items-center justify-center text-[#168A45] shrink-0 border border-[#D5E6D8]">
            <MapPin size={18} strokeWidth={2} />
          </div>
        );
      case 'health':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#168A45] shrink-0 border border-[#D5E6D8]">
            <Activity size={18} strokeWidth={2.2} />
          </div>
        );
      case 'trend':
        return (
          <div className="w-9 h-9 rounded-lg bg-[#EAF5EC] flex items-center justify-center text-[#168A45] shrink-0 border border-[#D5E6D8]">
            <TrendingUp size={18} strokeWidth={2} />
          </div>
        );
      case 'warning':
        return (
          <div className="w-9 h-9 rounded-full bg-[#FEF7E0] flex items-center justify-center text-[#D97706] shrink-0 border border-[#FCE8B2]">
            <TriangleAlert size={18} strokeWidth={2.2} />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 mb-6 z-20 relative">
      
      {/* 5 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 flex-1">
        {kpis.length === 0 && (
          <div className="col-span-2 sm:col-span-3 lg:col-span-5 bg-white rounded-xl p-5 border border-[#E1E7E3] text-center">
            <p className="text-[13px] font-bold text-[#102A20]">No crops registered yet</p>
            <p className="text-[12px] text-[#607469] mt-1">
              KPIs appear when a farm plot is registered on the backend — no demo figures are shown.
            </p>
          </div>
        )}
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
                  <span className="text-[#188A45] font-semibold">{kpi.secondary}</span>
                ) : (
                  <span className="text-[#52645D]">{kpi.secondary}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Action Buttons */}
      <div className="flex flex-row lg:flex-col justify-end gap-2.5 shrink-0">
        <button
          type="button"
          className="flex-1 lg:flex-initial px-5 py-2.5 bg-[#075C32] hover:bg-[#054324] text-white text-[13px] font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group"
        >
          <Plus size={16} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Add Crop</span>
        </button>

        <Link
          href="/crops/calendar"
          className="flex-1 lg:flex-initial px-4 py-2 bg-white border border-[#E1E7E3] hover:bg-[#F5F9F6] text-[#102A20] text-[13px] font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
        >
          <Calendar size={15} className="text-[#52645D]" strokeWidth={1.8} />
          <span>Crop Calendar</span>
        </Link>
      </div>

    </div>
  );
}
