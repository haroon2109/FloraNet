import React from 'react';

const commodityCards: any = [];


const getCropIllustration = (icon: string) => {
  switch (icon) {
    case 'corn': return (
      <div className="w-8 h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5"><path d="M12 2C8 6 6 11 6 16c0 3 2.5 6 6 6s6-3 6-6c0-5-2-10-6-14z"/><path d="M12 2c2 4 3 8 3 13s-1.5 5-3 5-3-2.5-3-5 1-9 3-13z" fill="#FBBF24"/><path d="M7 14c-2-2-4-2-4 0 0 2 2 4 4 4"/></svg>
      </div>
    );
    case 'wheat': return (
      <div className="w-8 h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5"><path d="M12 22v-8"/><path d="M12 14c-2-2-4-1-6 2"/><path d="M12 10c-2-2-5-1-7 2"/><path d="M12 6c-3-2-6-1-8 2"/><path d="M12 14c2-2 4-1 6 2"/><path d="M12 10c2-2 5-1 7 2"/><path d="M12 6c3-2 6-1 8 2"/></svg>
      </div>
    );
    case 'pulse': return (
      <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#22C55E" stroke="#16A34A" strokeWidth="1.5"><circle cx="12" cy="12" r="8"/><circle cx="9" cy="10" r="2" fill="#15803D"/><circle cx="15" cy="14" r="2" fill="#15803D"/></svg>
      </div>
    );
    case 'soybean': return (
      <div className="w-8 h-8 rounded-full bg-[#FEF9C3] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.5"><path d="M6 18c6 6 12 0 12-6S12 0 6 6s0 12 0 12z"/><circle cx="10" cy="14" r="2" fill="#A16207"/><circle cx="14" cy="10" r="2" fill="#A16207"/></svg>
      </div>
    );
    case 'cotton': return (
      <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF" stroke="#9CA3AF" strokeWidth="1.5"><path d="M12 2C8 2 6 5 6 9c0 2 1 4 3 5-1 2-1 5 1 7s5 2 7 1c2-1 3-3 2-6 2-1 3-3 3-5 0-4-2-7-6-7z"/><path d="M12 12l-2 8"/><path d="M12 12l3 7"/></svg>
      </div>
    );
    case 'peanut': return (
      <div className="w-8 h-8 rounded-full bg-[#FFEDD5] flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#F97316" stroke="#C2410C" strokeWidth="1.5"><path d="M16 4C11 4 9 7 9 10c0 1-1 2-2 2-3 0-5 2-5 5s2 5 5 5c4 0 7-2 7-6 1 0 2-1 2-2 3-1 4-4 4-7s-2-3-4-3z"/><circle cx="15" cy="8" r="2" fill="#9A3412"/><circle cx="9" cy="17" r="2" fill="#9A3412"/></svg>
      </div>
    );
    default: return <div className="w-8 h-8 rounded-full bg-gray-200" />;
  }
}

export default function CommodityStrip() {
  return (
    <div className="px-6 mb-6 relative z-10 w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-4 min-w-max pb-2">
        {commodityCards.map((card: any, idx: any) => (
          <button 
            key={card.id}
            className={`flex items-center gap-3 bg-white p-3 rounded-xl border ${idx === 0 ? 'border-[#168A45] ring-1 ring-[#168A45]/20 shadow-sm' : 'border-[#E1E7E3] hover:border-[#168A45]/50'} transition-all min-w-[150px] text-left`}
          >
            {getCropIllustration(card.icon)}
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-[#52645D] leading-none mb-1">{card.name}</span>
              <span className="text-[14px] font-bold text-[#102A20] leading-none">₹{card.price.toLocaleString()} <span className="text-[10px] font-medium text-[#52645D]">/qtl</span></span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
