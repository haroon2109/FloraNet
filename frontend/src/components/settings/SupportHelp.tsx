"use client";

import React from 'react';
import Link from 'next/link';
import { CircleHelp, Headphones, PlayCircle, Leaf, ExternalLink } from 'lucide-react';
import { settingsPageData } from '@/data/settingsData';
import { SupportHelpItem } from '@/types/settings';

export default function SupportHelp() {
  const { supportItems } = settingsPageData;

  const renderIcon = (type: SupportHelpItem['iconType']) => {
    switch (type) {
      case 'help':
        return <CircleHelp size={16} strokeWidth={2.2} />;
      case 'contact':
        return <Headphones size={16} strokeWidth={2.2} />;
      case 'video':
        return <PlayCircle size={16} strokeWidth={2.2} />;
      case 'leaf':
        return <Leaf size={16} strokeWidth={2.2} />;
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <h3 className="text-[15px] font-bold text-[#102A20] mb-3 px-0.5">Support & Help</h3>

      {/* Rows */}
      <div className="space-y-2">
        {supportItems.map((item) => (
          <Link
            key={item.id}
            href={item.url}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F9FBF9] transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0">
                {renderIcon(item.iconType)}
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] font-bold text-[#102A20] group-hover:text-[#168A45] transition-colors leading-tight">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#52645D] truncate mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>

            <ExternalLink size={14} className="text-[#889B91] group-hover:text-[#168A45] transition-colors shrink-0" />
          </Link>
        ))}
      </div>

    </div>
  );
}
