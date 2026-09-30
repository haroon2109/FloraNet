"use client";

import React from 'react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reportsPageData } from '@/data/reportsData';

export default function ProfitTrendChart() {
  const { profitTrend } = reportsPageData;

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col h-[320px]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-[16px] font-bold text-[#102A20]">Profit Trend (7 Days)</h3>
        <Link 
          href="/reports/profit" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View full report 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Chart Area */}
      <div className="flex-1 w-full h-full min-h-0 relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={profitTrend} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProfitTrend" x1="0" y1="0" x2="0" y2="1">
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
              dy={5}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#52645D', fontWeight: 500 }}
              tickFormatter={(val) => `${val / 1000}K`}
              domain={[0, 120000]}
              ticks={[0, 20000, 40000, 60000, 80000, 100000, 120000]}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #E1E7E3', boxShadow: '0 4px 12px rgba(20,60,40,0.08)', fontSize: '12px', fontWeight: 600 }}
              formatter={(value: any) => [`₹ ${Number(value).toLocaleString()}`, 'Profit']}
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="#168A45" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#colorProfitTrend)"
              dot={{ r: 4, fill: '#168A45', stroke: '#fff', strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
