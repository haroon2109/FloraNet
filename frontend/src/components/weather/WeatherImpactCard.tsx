import React from 'react';
import { ArrowRight, Droplets, Thermometer, Bug, Sprout, Leaf } from 'lucide-react';

const weatherImpacts: any = [];


const getImpactIcon = (iconName: string) => {
  switch (iconName) {
    case 'Droplets': return <Droplets size={18} className="text-[#4D9DE0]" />;
    case 'Thermometer': return <Thermometer size={18} className="text-[#087A45]" />;
    case 'Bug': return <Bug size={18} className="text-[#F2A900]" />;
    case 'Sprout': return <Sprout size={18} className="text-[#087A45]" />;
    case 'Leaf': return <Leaf size={18} className="text-[#087A45]" />;
    default: return <Leaf size={18} className="text-[#647474]" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Low': return 'text-[#087A45]';
    case 'Good': return 'text-[#087A45]';
    case 'Excellent': return 'text-[#087A45]';
    case 'Moderate': return 'text-[#F2A900]';
    default: return 'text-[#647474]';
  }
};

export default function WeatherImpactCard() {
  return (
    <div className="bg-white border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.04)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-semibold text-[#102A2A]">Weather Impact on Farm</h2>
        <button className="text-[12px] font-medium text-[#087A45] flex items-center gap-1 hover:text-[#102A2A] transition-colors">
          View details <ArrowRight size={14} />
        </button>
      </div>

      <div className="flex flex-col flex-1 justify-between gap-2">
        {weatherImpacts.map((impact: any, idx: any) => (
          <div key={impact.id} className={`flex items-center justify-between py-2 ${idx !== weatherImpacts.length - 1 ? 'border-b border-[#E2E9E5]/50' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F7FAF8] flex items-center justify-center border border-[#E2E9E5]/60">
                {getImpactIcon(impact.icon)}
              </div>
              <span className="text-[13px] font-medium text-[#102A2A]">{impact.label}</span>
            </div>
            <span className={`text-[13px] font-bold ${getStatusColor(impact.status)}`}>{impact.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
