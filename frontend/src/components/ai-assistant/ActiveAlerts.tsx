"use client";

import React from 'react';
import Link from 'next/link';
import { TriangleAlert, Info } from 'lucide-react';
import { aiAssistantPageData } from '@/data/aiAssistantData';

export default function ActiveAlerts() {
  const { alerts } = aiAssistantPageData;

  const renderIcon = (type: string) => {
    switch (type) {
      case 'red':
        return (
          <div className="w-8 h-8 rounded-full bg-[#FCE8E6] text-[#E84A3C] flex items-center justify-center shrink-0 border border-[#FAD2CF]">
            <TriangleAlert size={16} strokeWidth={2.2} />
          </div>
        );
      case 'amber':
        return (
          <div className="w-8 h-8 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
            <TriangleAlert size={16} strokeWidth={2.2} />
          </div>
        );
      case 'blue':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
            <Info size={16} strokeWidth={2.2} />
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A20]">Active Alerts</h3>
        <Link 
          href="/alerts" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group shrink-0"
        >
          View all 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert, idx) => (
          <div 
            key={alert.id}
            className={`flex items-start gap-3 ${idx !== alerts.length - 1 ? 'border-b border-[#F0F4F1] pb-3' : ''}`}
          >
            {renderIcon(alert.type)}

            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-bold text-[#102A20] leading-snug mb-0.5">
                {alert.title}
              </h4>
              <p className="text-[11px] text-[#52645D] leading-snug mb-1">
                {alert.description}
              </p>
              <span className="text-[10px] font-medium text-[#889B91]">{alert.timeAgo}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
