"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLiveWeather } from '@/hooks/useLiveWeather';

export default function TemperatureTrend() {
  const { weather, status } = useLiveWeather();
  const tempTrend = weather?.temp_trend || [];

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col h-[300px]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-[16px] font-bold text-[#102A20]">Temperature Trend</h3>
        
        <button 
          type="button"
          className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E1E7E3] rounded-lg text-[12px] font-semibold text-[#102A20] hover:bg-[#F5F9F6] transition-colors"
        >
          <span>Last 7 Days</span>
          <ChevronDown size={14} className="text-[#52645D]" />
        </button>
      </div>

      {status === 'loading' && (
        <p className="flex-1 flex items-center justify-center text-[13px] text-[#607469]">Fetching live observed temperatures…</p>
      )}

      {status === 'unavailable' && (
        <p className="flex-1 flex items-center justify-center text-[13px] text-[#607469]">
          Live temperature history unavailable — backend unreachable. No substitute series is shown.
        </p>
      )}

      {status === 'live' && tempTrend.length === 0 && (
        <p className="flex-1 flex items-center justify-center text-[13px] text-[#607469]">No observed temperature data in the live feed yet.</p>
      )}

      {status === 'live' && tempTrend.length > 0 && (
        <>
          {/* Chart Area */}
          <div className="flex-1 w-full h-full min-h-0 relative -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tempTrend} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTempRange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#168A45" stopOpacity={0.2} />
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
                  tickFormatter={(val) => `${val}°C`}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E1E7E3', boxShadow: '0 4px 12px rgba(20,60,40,0.08)', fontSize: '12px', fontWeight: 600 }}
                  formatter={(value: any, name: any) => [`${value}°C`, name === 'max_temp' ? 'Max Temp' : 'Min Temp']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={24} 
                  iconType="plainline"
                  wrapperStyle={{ fontSize: '11px', color: '#52645D', paddingTop: '4px' }}
                  formatter={(value) => <span className="text-[#52645D] font-semibold">{value === 'max_temp' ? 'Max Temp (°C)' : 'Min Temp (°C)'}</span>}
                />
                <Area type="monotone" dataKey="max_temp" stroke="none" fill="url(#colorTempRange)" />
                <Line type="monotone" dataKey="max_temp" name="max_temp" stroke="#168A45" strokeWidth={2.5} dot={{ r: 3.5, fill: '#168A45' }} connectNulls />
                <Line type="monotone" dataKey="min_temp" name="min_temp" stroke="#168A45" strokeWidth={1.8} strokeDasharray="4 4" dot={{ r: 3, fill: '#168A45' }} connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

    </div>
  );
}
