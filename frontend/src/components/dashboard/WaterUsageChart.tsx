"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardData } from '@/data/dashboardData';

export default function WaterUsageChart() {
  const { waterUsage } = dashboardData;

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col h-[280px]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-[16px] font-bold text-[#102A20]">Water Usage Trend</h3>
        
        <button 
          type="button"
          className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E1E7E3] rounded-lg text-[12px] font-semibold text-[#102A20] hover:bg-[#F4F9F5] transition-colors"
        >
          <span>Last 6 Weeks</span>
          <ChevronDown size={14} className="text-[#52645D]" />
        </button>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full h-full min-h-0 relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={waterUsage} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E7E3" opacity={0.6} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#52645D', fontWeight: 500 }} 
              dy={5}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#52645D', fontWeight: 500 }}
              tickFormatter={(value) => `${value / 1000}K`}
              domain={[0, 20000]}
              ticks={[0, 5000, 10000, 15000, 20000]}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #E1E7E3', boxShadow: '0 4px 12px rgba(20,60,40,0.08)', fontSize: '12px', fontWeight: 600 }}
              formatter={(value: any, name: any) => [`${value.toLocaleString()} L`, name === 'thisPeriod' ? 'This Period' : 'Last Period']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={28} 
              iconType="square"
              wrapperStyle={{ fontSize: '11px', color: '#52645D', paddingTop: '6px' }}
              formatter={(value) => <span className="text-[#52645D] font-semibold">{value === 'thisPeriod' ? 'This Period' : 'Last Period'}</span>}
            />
            <Bar dataKey="thisPeriod" name="This Period" fill="#168A45" radius={[3, 3, 0, 0]} barSize={10} />
            <Bar dataKey="lastPeriod" name="Last Period" fill="#E1E7E3" radius={[3, 3, 0, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
