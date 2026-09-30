import React from 'react';
import { ArrowRight, Droplets, Thermometer, Leaf, Search } from 'lucide-react';

const fieldActivities: any = [];


const getActivityIcon = (iconName: string) => {
  switch (iconName) {
    case 'Droplets': return <Droplets size={14} className="text-[#4D9DE0]" />;
    case 'Thermometer': return <Thermometer size={14} className="text-[#647474]" />;
    case 'Leaf': return <Leaf size={14} className="text-[#087A45]" />;
    case 'Search': return <Search size={14} className="text-[#087A45]" />;
    default: return <Droplets size={14} className="text-[#647474]" />;
  }
};

const getActivityBg = (iconName: string) => {
  switch (iconName) {
    case 'Droplets': return 'bg-[#F0F9FF] border-[#BAE6FD]';
    case 'Thermometer': return 'bg-[#F7FAF8] border-[#E2E9E5]';
    case 'Leaf': return 'bg-[#EAF6EE] border-[#86EFAC]';
    case 'Search': return 'bg-[#EAF6EE] border-[#86EFAC]';
    default: return 'bg-gray-100 border-gray-200';
  }
};

export default function FieldActivities() {
  return (
    <div className="bg-white border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.04)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-semibold text-[#102A2A]">Field Activities</h2>
        <button className="text-[12px] font-medium text-[#087A45] flex items-center gap-1 hover:text-[#102A2A] transition-colors">
          View all <ArrowRight size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-5 relative">
        {/* Timeline line */}
        <div className="absolute top-2 left-4 bottom-2 w-[1px] bg-[#E2E9E5] -z-10"></div>

        {fieldActivities.map((activity: any) => (
          <div key={activity.id} className="flex gap-4 items-start">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-white relative z-10 ${getActivityBg(activity.icon)}`}>
              {getActivityIcon(activity.icon)}
            </div>
            <div className="flex flex-col pt-1">
              <span className="text-[13px] font-semibold text-[#102A2A] mb-0.5 leading-snug">{activity.title}</span>
              <span className="text-[11px] text-[#647474]">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
