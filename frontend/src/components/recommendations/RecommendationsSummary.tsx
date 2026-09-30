"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const summaryData: any = { medium: '', low: '', high: '', total: '' };


const COLORS = ['#E5483F', '#F5A900', '#4EA7DF']; // High, Medium, Low

export default function RecommendationsSummary() {
  const chartData = [
    { name: 'High Priority', value: summaryData.high },
    { name: 'Medium Priority', value: summaryData.medium },
    { name: 'Low Priority', value: summaryData.low },
  ];

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      <h2 className="text-[15px] font-semibold text-[#102A20] mb-5">Recommendations Summary</h2>
      
      <div className="flex items-center">
        <div className="w-[140px] h-[140px] relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
                isAnimationActive={false}
              >
                {chartData.map((entry: any, index: any) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col">
            <span className="text-[28px] font-bold leading-none text-[#102A20]">{summaryData.total}</span>
            <span className="text-[11px] text-[#52645D] mt-0.5">Total</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3 pl-6">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-[#E5483F] mt-1 shrink-0"></div>
            <div>
              <div className="text-[12px] text-[#102A20] font-medium leading-none mb-1">High Priority</div>
              <div className="text-[11px] text-[#52645D] leading-none">{summaryData.high} (33%)</div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-[#F5A900] mt-1 shrink-0"></div>
            <div>
              <div className="text-[12px] text-[#102A20] font-medium leading-none mb-1">Medium Priority</div>
              <div className="text-[11px] text-[#52645D] leading-none">{summaryData.medium} (33%)</div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4EA7DF] mt-1 shrink-0"></div>
            <div>
              <div className="text-[12px] text-[#102A20] font-medium leading-none mb-1">Low Priority</div>
              <div className="text-[11px] text-[#52645D] leading-none">{summaryData.low} (33%)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
