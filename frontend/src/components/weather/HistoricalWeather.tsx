"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const historicalData = [
  { value: 20 },
  { value: 22 },
  { value: 18 },
  { value: 25 },
  { value: 24 },
  { value: 28 },
  { value: 30 }
];

export default function HistoricalWeather() {
  return (
    <div className="bg-white border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.04)] h-full flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-start justify-between z-10 relative">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[15px] font-semibold text-[#102A2A]">Historical Weather</h2>
          <span className="text-[11px] text-[#647474]">Compare this week with last year</span>
        </div>
        <button className="text-[12px] font-medium text-[#087A45] flex items-center gap-1 hover:text-[#102A2A] transition-colors shrink-0">
          View history <ArrowRight size={14} />
        </button>
      </div>

      <div className="w-full h-[60px] mt-6 z-10 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historicalData}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#087A45" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#087A45', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#087A45', stroke: '#fff', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Subtle Background decoration */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#EAF6EE] rounded-full opacity-50 z-0"></div>
    </div>
  );
}
