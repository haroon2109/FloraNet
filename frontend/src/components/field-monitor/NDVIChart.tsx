"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';

const ndviChartData: any = [];


export default function NDVIChart() {
  return (
    <div className="bg-white border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.04)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-[#102A2A]">NDVI Trend (Last 30 Days)</h2>
        <button className="text-[12px] font-medium text-[#087A45] flex items-center gap-1 hover:text-[#102A2A] transition-colors">
          View full analytics <ArrowRight size={14} />
        </button>
      </div>

      <div className="relative flex-1 min-h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ndviChartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNDVI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#087A45" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#087A45" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E9E5" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#647474' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#647474' }} 
              domain={[0, 1]} 
              ticks={[0, 0.25, 0.5, 0.75, 1]}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E9E5', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#087A45" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorNDVI)" 
              activeDot={{ r: 6, fill: '#087A45', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Current Value overlay */}
        <div className="absolute top-0 right-2 flex flex-col items-end">
          <span className="text-[18px] font-bold text-[#102A2A] leading-none">0.72</span>
          <span className="text-[11px] text-[#647474]">May 12</span>
        </div>
      </div>
    </div>
  );
}
