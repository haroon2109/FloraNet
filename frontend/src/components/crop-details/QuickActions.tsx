"use client";

import React from 'react';
import Link from 'next/link';
import { Camera, Droplets, Sprout, Stethoscope, Share2, ChevronRight } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    { title: 'Add Observation', icon: Camera, href: '/field-monitor' },
    { title: 'Schedule Irrigation', icon: Droplets, href: '/planner' },
    { title: 'Add Fertilizer', icon: Sprout, href: '/planner' },
    { title: 'Crop Doctor', icon: Stethoscope, href: '/crops' },
    { title: 'Share Crop Report', icon: Share2, href: '/reports' },
  ];

  return (
    <div className="bg-white border border-[#E1E8E4] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <h3 className="text-[15px] font-bold text-[#102A2A] mb-3 px-0.5">Quick Actions</h3>

      {/* Rows */}
      <div className="space-y-1">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              href={act.href}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F9FBF9] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EAF6EE] text-[#087A45] flex items-center justify-center shrink-0 border border-[#C4E7D0]">
                  <Icon size={16} strokeWidth={2.2} />
                </div>
                <span className="text-[13px] font-bold text-[#102A2A] group-hover:text-[#087A45] transition-colors">
                  {act.title}
                </span>
              </div>

              <ChevronRight size={16} className="text-[#889B91] group-hover:text-[#087A45] transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>

    </div>
  );
}
