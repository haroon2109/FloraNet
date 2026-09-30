import React from 'react';
import { ArrowRight, Droplets, Leaf, ShieldCheck, CloudRain } from 'lucide-react';

const topBenefitCategories: any = [];


// Custom Soil icon since Lucide doesn't have a perfect match
const Soil = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12h20"/>
    <path d="M5 12v2a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5v-2"/>
    <path d="M12 2v10"/>
    <path d="M8 6h8"/>
  </svg>
);

const getIcon = (iconStr: string) => {
  switch (iconStr) {
    case 'water': return <Droplets size={16} className="text-[#4EA7DF]" fill="#DBEAFE" />;
    case 'leaf': return <Leaf size={16} className="text-[#168A45]" />;
    case 'shield': return <ShieldCheck size={16} className="text-[#168A45]" />;
    case 'soil': return <Soil size={16} className="text-[#8B5A2B]" />;
    case 'cloud': return <CloudRain size={16} className="text-[#4EA7DF]" fill="#DBEAFE" />;
    default: return <Leaf size={16} />;
  }
};

const getIconBg = (iconStr: string) => {
  switch (iconStr) {
    case 'water': return 'bg-[#F0F9FF]';
    case 'leaf': return 'bg-[#EAF5EC]';
    case 'shield': return 'bg-[#EAF5EC]';
    case 'soil': return 'bg-[#F5F1E8]';
    case 'cloud': return 'bg-[#F0F9FF]';
    default: return 'bg-[#EAF5EC]';
  }
};

export default function TopBenefitCategories() {
  return (
    <div className="bg-white border border-[#E1E7E3] rounded-xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-semibold text-[#102A20]">Top Benefit Categories</h2>
        <button className="text-[11px] font-medium text-[#168A45] flex items-center gap-1">
          View all <ArrowRight size={12} />
        </button>
      </div>
      
      <div className="flex flex-col gap-4">
        {topBenefitCategories.map((category: any) => (
          <div key={category.id} className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-[#E1E7E3]/60 ${getIconBg(category.icon)}`}>
              {getIcon(category.icon)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] font-semibold text-[#102A20] truncate">{category.label}</span>
                <span className="text-[11px] font-medium text-[#52645D]">{category.percentage}%</span>
              </div>
              
              <div className="h-1.5 w-full bg-[#F4F4F5] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#168A45] rounded-full" 
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
