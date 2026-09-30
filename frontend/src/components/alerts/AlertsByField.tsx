"use client";

import React from 'react';
import Link from 'next/link';
import { alertsPageData } from '@/data/alertsData';

export default function AlertsByField() {
  const { alertsByField } = alertsPageData;

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A20]">Alerts by Field</h3>
        <Link 
          href="/field-monitor" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View all 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Field List */}
      <div className="space-y-2">
        {alertsByField.map((abf) => (
          <div key={abf.id} className="flex items-center justify-between py-1.5 px-2.5 rounded-xl hover:bg-[#F9FBF9] transition-colors text-[13px]">
            <span className="font-semibold text-[#102A20]">{abf.fieldName}</span>
            <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${abf.badgeBg} ${abf.badgeText}`}>
              {abf.count}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
