import React from 'react';
import { Camera, Droplets, Thermometer, ShieldCheck, Share2, ChevronRight } from 'lucide-react';

const actions = [
  { id: 'a1', label: 'Add Field Observation', icon: Camera },
  { id: 'a2', label: 'Schedule Irrigation', icon: Droplets },
  { id: 'a3', label: 'Add Fertilizer', icon: Thermometer },
  { id: 'a4', label: 'Field Report', icon: ShieldCheck },
  { id: 'a5', label: 'Share Field Insights', icon: Share2 }
];

export default function QuickActions() {
  return (
    <div className="bg-white border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.04)] h-full flex flex-col">
      <h2 className="text-[15px] font-semibold text-[#102A2A] mb-4">Quick Actions</h2>
      
      <div className="flex flex-col h-full justify-between">
        {actions.map((action: any, idx: any) => {
          const Icon = action.icon;
          return (
            <button 
              key={action.id} 
              className={`flex items-center justify-between py-3 ${idx !== actions.length - 1 ? 'border-b border-[#E2E9E5]/60' : ''} hover:bg-[#F7FAF8] -mx-2 px-2 rounded-lg transition-colors group`}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-[#647474] group-hover:text-[#087A45] transition-colors" />
                <span className="text-[13px] font-medium text-[#102A2A] group-hover:text-[#087A45] transition-colors">{action.label}</span>
              </div>
              <ChevronRight size={16} className="text-[#647474] group-hover:translate-x-0.5 transition-transform" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
