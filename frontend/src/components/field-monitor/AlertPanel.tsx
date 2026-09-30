import React from 'react';
import { ArrowRight, AlertTriangle, Droplets, Info } from 'lucide-react';

const fieldAlerts: any = [];


const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'high': return { bg: 'bg-[#FEF2F2]', border: 'border-[#FCA5A5]', icon: <AlertTriangle size={16} className="text-[#E84C3D]" /> };
    case 'medium': return { bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', icon: <Droplets size={16} className="text-[#F2A900]" /> };
    case 'info': return { bg: 'bg-[#F0F9FF]', border: 'border-[#BAE6FD]', icon: <Info size={16} className="text-[#4D9DE0]" /> };
    default: return { bg: 'bg-gray-50', border: 'border-gray-200', icon: <Info size={16} className="text-gray-500" /> };
  }
};

export default function AlertPanel() {
  return (
    <div className="bg-white border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.04)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[16px] font-semibold text-[#102A2A]">Field Alerts</h2>
        <button className="text-[12px] font-medium text-[#087A45] flex items-center gap-1 hover:text-[#102A2A] transition-colors">
          View all <ArrowRight size={14} />
        </button>
      </div>
      
      <div className="flex flex-col gap-4">
        {fieldAlerts.map((alert: any) => {
          const styles = getSeverityStyles(alert.severity);
          return (
            <div key={alert.id} className="flex gap-4 items-start pb-4 border-b border-[#E2E9E5]/60 last:border-0 last:pb-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${styles.bg} border ${styles.border}`}>
                {styles.icon}
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[13px] font-semibold text-[#102A2A] mb-1 leading-tight">{alert.title}</span>
                <span className="text-[12px] text-[#647474] leading-snug mb-1.5">{alert.description}</span>
              </div>
              <span className="text-[10px] font-medium text-[#647474] shrink-0 mt-0.5">{alert.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
