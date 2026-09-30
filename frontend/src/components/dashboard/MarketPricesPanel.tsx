"use client";

import React from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { dashboardData } from '@/data/dashboardData';

export default function MarketPricesPanel() {
  const { marketPrices } = dashboardData;

  return (
    <div className="mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A20] flex items-center gap-1.5">
          <TrendingUp size={16} className="text-[#168A45]" strokeWidth={2.2} />
          Market Prices
        </h3>
        <Link 
          href="/market-prices" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View all 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Commodity Columns Grid */}
      <div className="bg-white rounded-2xl border border-[#E1E8E2] shadow-[0_2px_12px_rgba(20,60,40,0.04)] p-4">
        <div className="grid grid-cols-3 divide-x divide-[#F0F4F1]">
          {marketPrices.map((mp, idx) => {
            const chartData = mp.sparkline.map((v, i) => ({ i, v }));
            return (
              <div 
                key={mp.id} 
                className={`flex flex-col ${idx === 0 ? 'pr-2' : idx === 1 ? 'px-2' : 'pl-2'}`}
              >
                <span className="text-[11px] font-semibold text-[#52645D] mb-0.5 truncate">
                  {mp.commodity}
                </span>
                
                <div className="flex items-baseline flex-wrap gap-0.5 mb-1">
                  <span className="text-[13px] sm:text-[14px] font-bold text-[#102A20] leading-none tracking-tight">
                    {mp.price}
                  </span>
                  <span className="text-[10px] font-medium text-[#52645D]">
                    {mp.unit}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 text-[#168A45] text-[11px] font-bold mb-1.5">
                  <ArrowUp size={11} strokeWidth={2.5} />
                  <span>{mp.change.replace('↑ ', '')}</span>
                </div>

                {/* Micro Sparkline */}
                <div className="h-6 w-full opacity-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Line 
                        type="monotone" 
                        dataKey="v" 
                        stroke="#168A45" 
                        strokeWidth={1.8} 
                        dot={false} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
