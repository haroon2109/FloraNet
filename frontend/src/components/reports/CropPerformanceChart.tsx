"use client";

import React from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { reportsPageData } from '@/data/reportsData';

export default function CropPerformanceChart() {
  const { cropPerformance } = reportsPageData;

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col h-[320px]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-[16px] font-bold text-[#102A20]">Crop Performance Overview</h3>
        <Link 
          href="/reports/crop-performance" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View full report 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Grouped Bar Chart */}
      <div className="flex-1 w-full h-full min-h-0 relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cropPerformance} margin={{ top: 10, right: 15, left: -5, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E7E3" opacity={0.6} />
            <XAxis 
              dataKey="crop" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#52645D', fontWeight: 500 }} 
              dy={5}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#52645D', fontWeight: 500 }}
              domain={[0, 1200]}
              ticks={[0, 300, 600, 900, 1200]}
              label={{ value: 'Yield (Kgs)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#889B91', fontWeight: 600 } }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #E1E7E3', boxShadow: '0 4px 12px rgba(20,60,40,0.08)', fontSize: '12px', fontWeight: 600 }}
              formatter={(value: any, name: any) => [`${value} Kgs`, name === 'thisPeriod' ? 'This Period' : 'Last Period']}
            />
            <Legend 
              verticalAlign="top" 
              align="right"
              height={28} 
              iconType="square"
              wrapperStyle={{ fontSize: '11px', color: '#52645D', top: -10 }}
              formatter={(value) => <span className="text-[#52645D] font-semibold">{value === 'thisPeriod' ? 'This Period' : 'Last Period'}</span>}
            />
            <Bar dataKey="thisPeriod" name="thisPeriod" fill="#168A45" radius={[3, 3, 0, 0]} barSize={12} />
            <Bar dataKey="lastPeriod" name="lastPeriod" fill="#A8BBAE" radius={[3, 3, 0, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
