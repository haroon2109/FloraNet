"use client";

import React from 'react';
import Link from 'next/link';
import { Sprout, IndianRupee, CloudRain, BookOpen, FileText } from 'lucide-react';
import { reportsPageData } from '@/data/reportsData';
import { ReportTypeItem } from '@/types/reports';

export default function ReportTypes() {
  const { reportTypes } = reportsPageData;

  const renderIcon = (type: ReportTypeItem['iconType']) => {
    switch (type) {
      case 'crop':
        return <Sprout size={17} strokeWidth={2.2} />;
      case 'financial':
        return <IndianRupee size={17} strokeWidth={2.2} />;
      case 'weather':
        return <CloudRain size={17} strokeWidth={2.2} />;
      case 'field':
        return <BookOpen size={17} strokeWidth={2.2} />;
      case 'custom':
        return <FileText size={17} strokeWidth={2.2} />;
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <h3 className="text-[15px] font-bold text-[#102A20] mb-3 px-0.5">Report Types</h3>

      {/* Report Types List */}
      <div className="space-y-3">
        {reportTypes.map((rt) => (
          <Link
            key={rt.id}
            href={`/reports/${rt.id}`}
            className="flex items-center gap-3 p-2 rounded-xl border border-[#F0F4F1] bg-[#FAFCFA] hover:bg-[#F5F9F6] transition-colors group cursor-pointer"
          >
            <div className={`w-8 h-8 rounded-full ${rt.iconBg} ${rt.iconColor} flex items-center justify-center shrink-0 border border-black/5`}>
              {renderIcon(rt.iconType)}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-[13px] font-bold text-[#102A20] group-hover:text-[#168A45] transition-colors leading-tight">
                {rt.title}
              </h4>
              <p className="text-[11px] text-[#52645D] truncate mt-0.5">
                {rt.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
