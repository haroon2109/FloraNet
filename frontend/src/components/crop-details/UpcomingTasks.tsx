"use client";

import React from 'react';
import { Droplets, Package, Sprout } from 'lucide-react';
import { cropDetailsPageData } from '@/data/cropDetailsData';
import { UpcomingTaskItem } from '@/types/cropDetails';

export default function UpcomingTasks() {
  const { upcomingTasks } = cropDetailsPageData;

  const renderIcon = (type: UpcomingTaskItem['iconType']) => {
    switch (type) {
      case 'droplet':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
            <Droplets size={16} strokeWidth={2.2} fill="#1A73E8" fillOpacity={0.2} />
          </div>
        );
      case 'urea':
        return (
          <div className="w-8 h-8 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
            <Package size={16} strokeWidth={2.2} />
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
    <div className="bg-white border border-[#E1E8E4] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <h3 className="text-[15px] font-bold text-[#102A2A] mb-3 px-0.5">Upcoming Tasks</h3>

      {/* Tasks List */}
      <div className="space-y-3">
        {upcomingTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 p-2 rounded-xl bg-[#FAFCFA] border border-[#F0F4F1]">
            {renderIcon(task.iconType)}
            <div className="min-w-0 flex-1">
              <h4 className="text-[13px] font-bold text-[#102A2A] leading-tight truncate">{task.title}</h4>
              <span className="text-[11px] text-[#617174] font-medium block mt-0.5">{task.dueText}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
