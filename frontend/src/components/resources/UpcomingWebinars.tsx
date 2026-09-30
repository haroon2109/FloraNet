"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { resourcesPageData } from '@/data/resourcesData';

export default function UpcomingWebinars() {
  const { upcomingWebinars } = resourcesPageData;
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  const handleRegister = (id: string) => {
    setRegisteredIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A20]">Upcoming Webinars</h3>
        <Link 
          href="/resources" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group shrink-0"
        >
          View all 
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Webinars List */}
      <div className="space-y-3">
        {upcomingWebinars.map((web) => {
          const isReg = registeredIds.includes(web.id);

          return (
            <div key={web.id} className="p-3 rounded-xl bg-[#FAFCFA] border border-[#F0F4F1] flex items-center justify-between gap-3">
              
              <div className="flex items-center gap-3 min-w-0">
                {/* Date Badge */}
                <div className="w-12 h-12 rounded-xl bg-[#EFF8F1] border border-[#C4E7D0] flex flex-col items-center justify-center shrink-0 text-center">
                  <span className="text-[9px] font-bold text-[#168A45] uppercase tracking-wider leading-none">
                    {web.dateDay.split(' ')[0]}
                  </span>
                  <span className="text-[14px] font-bold text-[#102A20] leading-none mt-0.5">
                    {web.dateDay.split(' ')[1]}
                  </span>
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <h4 className="text-[13px] font-bold text-[#102A20] leading-tight truncate mb-0.5">
                    {web.title}
                  </h4>
                  <span className="text-[11px] font-medium text-[#52645D] block">
                    {web.time}
                  </span>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="button"
                onClick={() => handleRegister(web.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                  isReg
                    ? 'bg-[#168A45] text-white border border-[#168A45] flex items-center gap-1'
                    : 'bg-white border border-[#E1E7E3] hover:border-[#168A45] hover:bg-[#EFF8F1] text-[#168A45]'
                }`}
              >
                {isReg ? (
                  <>
                    <CheckCircle2 size={12} />
                    Registered
                  </>
                ) : (
                  'Register'
                )}
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
}
