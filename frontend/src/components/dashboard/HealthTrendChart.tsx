"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardData } from '@/data/dashboardData';

export default function HealthTrendChart() {
  const { healthTrend } = dashboardData;

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col h-[320px]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-[16px] font-bold text-[#102A20]">Farm Health Trend</h3>
        
        <button 
          type="button"
          className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E1E7E3] rounded-lg text-[12px] font-semibold text-[#102A20] hover:bg-[#F4F9F5] transition-colors"
        >
          <span>Last 5 Weeks</span>
          <ChevronDown size={14} className="text-[#52645D]" />
        </button>
      </div>

      <div className="flex-1 w-full h-full min-h-0 relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={healthTrend} margin={{ top: 20, right: 35, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHealthScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#168A45" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#168A45" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E7E3" opacity={0.6} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#52645D', fontWeight: 500 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#52645D', fontWeight: 500 }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              cursor={{ stroke: '#168A45', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #E1E7E3', boxShadow: '0 4px 12px rgba(20,60,40,0.08)', fontSize: '12px', fontWeight: 600 }}
              formatter={(value: any) => [`${value} / 100`, 'Health Score']}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#168A45" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorHealthScore)" 
              activeDot={{ r: 6, fill: '#168A45', stroke: '#fff', strokeWidth: 2 }}
              dot={{ r: 3.5, fill: '#168A45', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Floating End-point Score Badge */}
        <div className="absolute top-[38px] right-2 bg-[#168A45] text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs pointer-events-none">
          85
        </div>
      </div>
    </div>
  );
}
