import React from 'react';
import { ArrowRight, Leaf, Droplets, IndianRupee, Globe } from 'lucide-react';

const impactMetrics: any = [];


const getIcon = (iconStr: string) => {
  switch (iconStr) {
    case 'leaf': return <Leaf size={18} className="text-[#168A45]" />;
    case 'water': return <Droplets size={18} className="text-[#4EA7DF]" fill="#DBEAFE" />;
    case 'rupee': return <IndianRupee size={18} className="text-[#F5A900]" />;
    case 'globe': return <Globe size={18} className="text-[#168A45]" />;
    default: return <Leaf size={18} />;
  }
};

const getIconBg = (iconStr: string) => {
  switch (iconStr) {
    case 'leaf': return 'bg-[#EAF5EC]';
    case 'water': return 'bg-[#F0F9FF]';
    case 'rupee': return 'bg-[#FFF7E6]';
    case 'globe': return 'bg-[#EAF5EC]';
    default: return 'bg-[#EAF5EC]';
  }
};

export default function ImpactOverview() {
  return (
    <div className="bg-white border border-[#E1E7E3] rounded-xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-semibold text-[#102A20]">Impact Overview</h2>
        <button className="text-[11px] font-medium text-[#168A45] flex items-center gap-1">
          View all <ArrowRight size={12} />
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {impactMetrics.map((metric: any) => (
          <div key={metric.id} className="flex flex-col items-center text-center group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-105 ${getIconBg(metric.icon)}`}>
              {getIcon(metric.icon)}
            </div>
            <div className="text-[18px] font-bold text-[#102A20] leading-none mb-1">{metric.value}</div>
            <div className="text-[10px] text-[#52645D] font-medium leading-tight whitespace-pre-line">{metric.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
