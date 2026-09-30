"use client";

import React from 'react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const tempChartData: any = [];

export default function TemperatureChart() {
  return (
    <div className="bg-white border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.04)] h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <h2 className="text-[15px] font-semibold text-[#102A2A]">Temperature Trend (°C)</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
             <div className="w-2 h-2 rounded-full bg-[#E84C3D]"></div>
             <span className="text-[11px] font-medium text-[#647474]">Max Temp</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-2 h-2 rounded-full bg-[#4D9DE0]"></div>
             <span className="text-[11px] font-medium text-[#647474]">Min Temp</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={tempChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              domain={[0, 40]} 
              ticks={[0, 10, 20, 30, 40]}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E9E5', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
              itemStyle={{ color: '#102A2A', fontWeight: 600 }}
            />
            <Line 
              type="monotone" 
              dataKey="maxTemp" 
              name="Max Temp"
              stroke="#E84C3D" 
              strokeWidth={2} 
              activeDot={{ r: 5, fill: '#E84C3D', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="minTemp" 
              name="Min Temp"
              stroke="#4D9DE0" 
              strokeWidth={2} 
              activeDot={{ r: 5, fill: '#4D9DE0', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
