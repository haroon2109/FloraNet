"use client";

import React from 'react';
import { Download, LayoutGrid } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useFarm } from '@/context/farmContext';
import { CropHealthCategory } from '@/types/crops';
import { healthStatusFor } from '@/components/crops/CropsTable';

export default function CropHealthOverview() {
  const { fields } = useFarm();

  // Aggregate real registered fields into the health categories.
  const counts = { Good: 0, Watch: 0, 'Needs Attention': 0 };
  fields.forEach((f) => {
    counts[healthStatusFor(f.healthScore)] += 1;
  });
  const total = fields.length;

  const healthDistribution: CropHealthCategory[] = total > 0
    ? ([
        { category: 'Healthy' as const, count: counts.Good, percentage: Math.round((counts.Good / total) * 100), color: '#168A45' },
        { category: 'Watch' as const, count: counts.Watch, percentage: Math.round((counts.Watch / total) * 100), color: '#F5A900' },
        { category: 'Needs Attention' as const, count: counts['Needs Attention'], percentage: Math.round((counts['Needs Attention'] / total) * 100), color: '#E84A3C' },
      ] as CropHealthCategory[]).filter((d) => d.count > 0)
    : [];

  return (
    <div className="bg-white border border-[#E1E8E2] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header with Export Button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-[#102A20]">Crop Health Overview</h3>
        
        <div className="flex items-center gap-2">
          <button 
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E1E7E3] rounded-lg text-[11px] font-semibold text-[#102A20] hover:bg-[#F5F9F6] transition-colors"
          >
            <span>Export</span>
            <Download size={13} className="text-[#52645D]" />
          </button>
          
          <button 
            type="button"
            aria-label="View grid"
            className="w-7 h-7 rounded-lg bg-[#EAF5EC] border border-[#D5E6D8] flex items-center justify-center text-[#168A45]"
          >
            <LayoutGrid size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {total === 0 ? (
        <p className="py-10 text-center text-[13px] text-[#607469]">
          No crops registered yet — distribution appears when a farm plot is registered on the backend.
        </p>
      ) : (
        <>
          {/* Donut Chart & Legend Container */}
          <div className="flex items-center justify-between">
            
            {/* Recharts Donut Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthDistribution}
                    innerRadius="68%"
                    outerRadius="92%"
                    paddingAngle={3}
                    dataKey="count"
                    stroke="none"
                  >
                    {healthDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => [`${value} crops (${props.payload.percentage}%)`, props.payload.category]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E1E7E3', boxShadow: '0 4px 12px rgba(20,60,40,0.08)', fontSize: '12px', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[26px] font-bold text-[#102A20] leading-none">{total}</span>
                <span className="text-[12px] font-medium text-[#52645D] mt-0.5">Crops</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex-1 pl-4 flex flex-col gap-3 justify-center">
              {healthDistribution.map((item) => (
                <div key={item.category} className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-[#102A20] truncate">{item.category}</span>
                  </div>
                  <span className="font-medium text-[#52645D] shrink-0">
                    {item.count} <span className="text-[11px] text-[#889B91]">({item.percentage}%)</span>
                  </span>
                </div>
              ))}
            </div>

          </div>
        </>
      )}

    </div>
  );
}
