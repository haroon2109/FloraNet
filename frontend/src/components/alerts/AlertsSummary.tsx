"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { alertsPageData } from '@/data/alertsData';

export default function AlertsSummary() {
  const { summaryDistribution } = alertsPageData;
  const totalAlerts = summaryDistribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white border border-[#E1E8E2] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <h3 className="text-[16px] font-bold text-[#102A20] mb-4">Alerts Summary</h3>

      {/* Donut Chart & Legend Container */}
      <div className="flex items-center justify-between">
        
        {/* Donut Chart */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={summaryDistribution}
                innerRadius="68%"
                outerRadius="92%"
                paddingAngle={3}
                dataKey="count"
                stroke="none"
              >
                {summaryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [`${value} alerts (${(props as { payload?: { percentage?: number } })?.payload?.percentage ?? 0}%)`, String(name)]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E1E7E3', boxShadow: '0 4px 12px rgba(20,60,40,0.08)', fontSize: '12px', fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text — computed from live summary data; no fabricated totals */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[24px] font-bold text-[#102A20] leading-none">{totalAlerts}</span>
            <span className="text-[10px] font-medium text-[#52645D] mt-0.5 leading-tight">Total Alerts</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 pl-4 flex flex-col gap-2.5 justify-center">
          {summaryDistribution.map((item) => (
            <div key={item.category} className="flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
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
