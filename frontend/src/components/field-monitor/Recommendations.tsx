import React from 'react';
import { ArrowRight, Leaf, ShieldCheck, Sprout } from 'lucide-react';

const recommendations: any = [];


const getIcon = (type: string) => {
  switch (type) {
    case 'leaf': return <Leaf size={16} />;
    case 'agriculture': return <Sprout size={16} />;
    case 'shield': return <ShieldCheck size={16} />;
    default: return <Leaf size={16} />;
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'leaf': return 'bg-[#EAF5EC] text-[#168A45]';
    case 'agriculture': return 'bg-[#F5F9F6] text-[#168A45]';
    case 'shield': return 'bg-[#F0F9FF] text-[#4EA7DF]';
    default: return 'bg-[#EAF5EC] text-[#168A45]';
  }
};

const getBadgeStyle = (priority: string) => {
  switch (priority) {
    case 'High Priority': return 'bg-[#FEF2F2] text-[#E5483F] border-transparent';
    case 'Medium Priority': return 'bg-[#FFF7E6] text-[#F5A900] border-transparent';
    case 'Low Priority': return 'bg-[#F0F9FF] text-[#4EA7DF] border-transparent';
    default: return 'bg-[#F4F4F5] text-[#71717A] border-transparent';
  }
};

export default function Recommendations() {
  return (
    <div className="bg-white border border-[#E1E7E3] rounded-xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)]">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-semibold text-[#102A20]">AI Field Recommendations</h2>
        <button className="text-[11px] font-medium text-[#168A45] flex items-center gap-1">
          View all <ArrowRight size={12} />
        </button>
      </div>
      
      <div className="flex flex-col gap-4">
        {recommendations.map((rec: any) => (
          <div key={rec.id} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getIconColor(rec.type)}`}>
              {getIcon(rec.type)}
            </div>
            <div className="flex-1">
              <div className="text-[12px] font-semibold text-[#102A20] mb-1">{rec.title}</div>
              <div className="text-[11px] text-[#52645D] mb-1.5 leading-relaxed">{rec.description}</div>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getBadgeStyle(rec.priority)}`}>
                {rec.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
