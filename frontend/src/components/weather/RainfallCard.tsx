"use client";

import React from 'react';
import { CloudRain } from 'lucide-react';

import { BarChart, Bar, ResponsiveContainer } from 'recharts';

const rainfallData: any = { today: '', chartData: '', trend: '', seasonTotal: '' };

export default function RainfallCard() {
  return (
    <div className="bg-white border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.04)] flex flex-col justify-between h-full">
      <h2 className="text-[15px] font-semibold text-[#102A2A] mb-4">Rainfall (Today)</h2>
      
      <div className="flex items-center gap-4 mb-4">
        <CloudRain size={40} strokeWidth={1.5} className="text-[#4D9DE0]" />
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-[32px] font-bold text-[#102A2A] leading-none tracking-tight">{rainfallData.today}</span>
            <span className="text-[14px] font-semibold text-[#102A2A]">mm</span>
          </div>
          <span className="text-[13px] text-[#647474] mt-1">No rain</span>
        </div>
      </div>

      <div className="h-[1px] w-full bg-[#E2E9E5] mb-4"></div>

      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] text-[#647474] mb-0.5">Season Total</span>
          <span className="text-[16px] font-bold text-[#102A2A]">{rainfallData.seasonTotal} mm</span>
          <span className="text-[11px] font-semibold text-[#087A45] mt-2">{rainfallData.trend}</span>
        </div>

        <div className="w-[60px] h-[35px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rainfallData.chartData}>
              <Bar dataKey="value" fill="#087A45" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
