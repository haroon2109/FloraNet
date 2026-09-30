"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLiveWeather } from '@/hooks/useLiveWeather';

export default function RainfallTrend() {
  const { weather, status } = useLiveWeather();
  const rainTrend = weather?.rain_trend || [];

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col h-[300px]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-[16px] font-bold text-[#102A20]">Rainfall Trend</h3>
        
        <button 
          type="button"
          className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E1E7E3] rounded-lg text-[12px] font-semibold text-[#102A20] hover:bg-[#F5F9F6] transition-colors"
        >
          <span>Last 7 Days</span>
          <ChevronDown size={14} className="text-[#52645D]" />
        </button>
      </div>

      {status === 'loading' && (
        <p className="flex-1 flex items-center justify-center text-[13px] text-[#607469]">Fetching live observed rainfall…</p>
      )}

      {status === 'unavailable' && (
        <p className="flex-1 flex items-center justify-center text-[13px] text-[#607469]">
          Live rainfall history unavailable — backend unreachable. No substitute series is shown.
        </p>
      )}

      {status === 'live' && rainTrend.length === 0 && (
        <p className="flex-1 flex items-center justify-center text-[13px] text-[#607469]">No observed rainfall data in the live feed yet.</p>
      )}

      {status === 'live' && rainTrend.length > 0 && (
        <>
          {/* Chart Area */}
          <div className="flex-1 w-full h-full min-h-0 relative -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rainTrend} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
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
                  tickFormatter={(val) => `${val} mm`}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E1E7E3', boxShadow: '0 4px 12px rgba(20,60,40,0.08)', fontSize: '12px', fontWeight: 600 }}
                  formatter={(value: any) => [`${value} mm`, 'Rainfall']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={24} 
                  iconType="square"
                  wrapperStyle={{ fontSize: '11px', color: '#52645D', paddingTop: '4px' }}
                  formatter={() => <span className="text-[#52645D] font-semibold">Rainfall (mm)</span>}
                />
                <Bar dataKey="rainfall" name="Rainfall" fill="#168A45" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

    </div>
  );
}
