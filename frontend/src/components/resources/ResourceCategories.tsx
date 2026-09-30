import React from 'react';
import { ArrowRight, Sprout, Droplet, Shield, CloudSun, Store } from 'lucide-react';

const resourceCategories: any = [];


const getCategoryIcon = (icon: string) => {
  switch (icon) {
    case 'sprout': return <Sprout size={20} className="text-[#168A45]" />;
    case 'soil': return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-8"/><path d="M12 14c-2-2-4-1-6 2"/><path d="M12 10c-2-2-5-1-7 2"/><path d="M12 6c-3-2-6-1-8 2"/><path d="M12 14c2-2 4-1 6 2"/><path d="M12 10c2-2 5-1 7 2"/><path d="M12 6c3-2 6-1 8 2"/></svg>
    );
    case 'droplet': return <Droplet size={20} className="text-[#4EA7DF]" />;
    case 'shield': return <Shield size={20} className="text-[#E5483F]" />;
    case 'cloud': return <CloudSun size={20} className="text-[#F5A900]" />;
    case 'store': return <Store size={20} className="text-[#A16207]" />;
    default: return <Sprout size={20} />;
  }
};

const getCategoryBg = (icon: string) => {
  switch (icon) {
    case 'sprout': return 'bg-[#EAF5EC] border-[#168A45]/20';
    case 'soil': return 'bg-[#FFF7E5] border-[#8B5A2B]/20';
    case 'droplet': return 'bg-[#F0F9FF] border-[#4EA7DF]/20';
    case 'shield': return 'bg-[#FEF2F2] border-[#E5483F]/20';
    case 'cloud': return 'bg-[#FFF7E6] border-[#F5A900]/20';
    case 'store': return 'bg-[#FEF3C7] border-[#A16207]/20';
    default: return 'bg-gray-50 border-gray-200';
  }
};

export default function ResourceCategories() {
  return (
    <div className="mb-8 mx-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-[#102A20]">Resource Categories</h2>
        <button className="text-[12px] font-semibold text-[#168A45] flex items-center gap-1 hover:text-[#102A20] transition-colors">
          View all <ArrowRight size={14} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {resourceCategories.map((cat: any) => (
          <button key={cat.id} className="group flex flex-col items-center justify-center bg-white border border-[#E1E7E3] rounded-xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] hover:shadow-md hover:border-[#168A45]/40 transition-all">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 border ${getCategoryBg(cat.icon)}`}>
              {getCategoryIcon(cat.icon)}
            </div>
            <h3 className="text-[13px] font-semibold text-[#102A20] mb-1 text-center">{cat.name}</h3>
            <span className="text-[11px] font-medium text-[#52645D]">{cat.count} resources</span>
          </button>
        ))}
      </div>
    </div>
  );
}
