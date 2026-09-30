"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const rainChartData: any = [];

export default function RainfallChart() {
  return (
    <div className="bg-white border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.04)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-semibold text-[#102A2A]">Rainfall Trend (mm)</h2>
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E9E5] rounded-lg text-[11px] font-medium text-[#102A2A] hover:bg-[#F7FAF8] transition-colors">
          Last 7 Days <ChevronDown size={14} className="text-[#647474]" />
        </button>
      </div>

      <div className="relative flex-1 min-h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={16}>
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
              domain={[0, 20]} 
              ticks={[0, 5, 10, 15, 20]}
            />
            <Tooltip 
              cursor={{ fill: '#F7FAF8' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E9E5', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
            />
            <Bar dataKey="value" name="Rainfall" fill="#4D9DE0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
