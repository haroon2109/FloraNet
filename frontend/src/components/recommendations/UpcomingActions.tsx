"use client";

import React from 'react';
import Link from 'next/link';
import { Droplets, Sprout, Bug, ArrowRight } from 'lucide-react';
import { recommendationsPageData } from '@/data/recommendationsData';
import { UpcomingAction } from '@/types/recommendations';

export default function UpcomingActions() {
  const { upcomingActions } = recommendationsPageData;

  const renderIcon = (type: UpcomingAction['iconType']) => {
    switch (type) {
      case 'droplet':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
            <Droplets size={16} strokeWidth={2.2} fill="#1A73E8" fillOpacity={0.2} />
          </div>
        );
      case 'sprout':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EAF6EE] text-[#087A45] flex items-center justify-center shrink-0 border border-[#C4E7D0]">
            <Sprout size={16} strokeWidth={2.2} />
          </div>
        );
      case 'bug':
        return (
          <div className="w-8 h-8 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
            <Bug size={16} strokeWidth={2.2} />
          </div>
        );
      case 'weed':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EAF6EE] text-[#087A45] flex items-center justify-center shrink-0 border border-[#C4E7D0]">
            <Sprout size={16} strokeWidth={2.2} />
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-[#E2E9E5] rounded-2xl p-4 shadow-[0_4px_18px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A2A]">Upcoming Important Actions</h3>
        <Link 
          href="/planner" 
          className="text-[12px] font-semibold text-[#087A45] hover:text-[#075B3A] transition-colors inline-flex items-center gap-1 group shrink-0"
        >
          View calendar 
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Rows */}
      <div className="space-y-2.5">
        {upcomingActions.map((action) => (
          <div key={action.id} className="flex items-center justify-between p-2 rounded-xl bg-[#FAFCFA] border border-[#F0F4F1]">
            <div className="flex items-center gap-3 min-w-0">
              {renderIcon(action.iconType)}
              <div className="min-w-0">
                <h4 className="text-[13px] font-bold text-[#102A2A] leading-tight truncate">
                  {action.title}
                </h4>
                <p className="text-[11px] text-[#647474] font-medium mt-0.5">
                  {action.timeText}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-[#EAF6EE] text-[#087A45] border border-[#C4E7D0] rounded-xl text-[11px] font-bold shrink-0">
              {action.dateBadge}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
