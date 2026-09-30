"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { dashboardData } from '@/data/dashboardData';

export default function FieldDistributionChart() {
  const { fieldDistribution } = dashboardData;

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col h-[320px]">
      <h3 className="text-[16px] font-bold text-[#102A20] mb-3 shrink-0">Field Health Distribution</h3>
      
      <div className="flex-1 flex items-center justify-between min-h-0">
        
        {/* Donut Chart Container */}
        <div className="relative w-1/2 h-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fieldDistribution}
                innerRadius="68%"
                outerRadius="92%"
                paddingAngle={3}
                dataKey="count"
                stroke="none"
              >
                {fieldDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any, props: any) => [`${value} fields (${props.payload.percentage}%)`, props.payload.category]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E1E7E3', boxShadow: '0 4px 12px rgba(20,60,40,0.08)', fontSize: '12px', fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[26px] font-bold text-[#102A20] leading-none">6</span>
            <span className="text-[12px] font-medium text-[#52645D] mt-0.5">Fields</span>
          </div>
        </div>

        {/* Legend Panel */}
        <div className="w-1/2 pl-4 flex flex-col gap-3 justify-center">
          {fieldDistribution.map((item) => (
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
    </div>
  );
}
