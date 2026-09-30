"use client";

import React from 'react';
import { ArrowRight, Droplets, Thermometer, Sun, Wind } from 'lucide-react';

import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const sensorDataList: any = [];

const getSensorIcon = (name: string) => {
  switch (name) {
    case 'Droplets': return <Droplets size={16} className="text-[#4D9DE0]" />;
    case 'Thermometer': return <Thermometer size={16} className="text-[#E84C3D]" />;
    case 'Sun': return <Sun size={16} className="text-[#F2A900]" />;
    case 'Wind': return <Wind size={16} className="text-[#4D9DE0]" />;
    default: return <Droplets size={16} className="text-[#647474]" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Optimal': return 'text-[#087A45]';
    case 'Warm': return 'text-[#E84C3D]';
    case 'Moderate': return 'text-[#F2A900]';
    case 'Light': return 'text-[#087A45]';
    default: return 'text-[#647474]';
  }
};

export default function SensorPanel() {
  return (
    <div className="bg-white border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.04)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[16px] font-semibold text-[#102A2A]">Field Sensors</h2>
        <span className="text-[12px] font-semibold text-[#087A45] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#087A45] animate-pulse"></span>
          Live Data
        </span>
      </div>
      
      <div className="flex flex-col gap-1">
        {sensorDataList.map((sensor: any, idx: any) => (
          <div key={sensor.id} className={`flex items-center py-3.5 ${idx !== sensorDataList.length - 1 ? 'border-b border-[#E2E9E5]/60' : ''}`}>
             
             {/* Icon */}
             <div className="w-8 shrink-0 flex items-center justify-center">
               {getSensorIcon(sensor.icon)}
             </div>

             {/* Info */}
             <div className="flex flex-col flex-1 min-w-[120px]">
               <span className="text-[12px] text-[#647474]">{sensor.name}</span>
               <div className="flex items-center gap-2">
                 <span className="text-[15px] font-bold text-[#102A2A]">{sensor.value}</span>
                 <span className={`text-[11px] font-semibold ${getStatusColor(sensor.status)}`}>{sensor.status}</span>
               </div>
             </div>

             {/* Sparkline */}
             <div className="w-[70px] h-[30px] shrink-0">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={sensor.trend.map((val: any, i: any) => ({ value: val, index: i }))}>
                   <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                   <Line 
                     type="monotone" 
                     dataKey="value" 
                     stroke="#087A45" 
                     strokeWidth={2} 
                     dot={false}
                     isAnimationActive={false}
                   />
                 </LineChart>
               </ResponsiveContainer>
             </div>

          </div>
        ))}
      </div>

      <button className="mt-auto pt-4 text-[13px] font-semibold text-[#087A45] flex items-center justify-center gap-1 hover:text-[#102A2A] transition-colors w-full">
        View all sensor data <ArrowRight size={14} />
      </button>
    </div>
  );
}
