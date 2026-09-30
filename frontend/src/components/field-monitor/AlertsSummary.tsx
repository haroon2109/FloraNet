"use client";

import React from 'react';
import Link from 'next/link';
import { TriangleAlert, Droplets, CheckCircle2 } from 'lucide-react';
import { fieldMonitorData } from '@/data/fieldMonitorData';

export default function AlertsSummary() {
  const { alertsSummary } = fieldMonitorData;

  const renderIcon = (type: string) => {
    switch (type) {
      case 'Critical':
        return <TriangleAlert size={16} className="text-[#E84A3C]" strokeWidth={2.2} />;
      case 'Warning':
        return <TriangleAlert size={16} className="text-[#D97706]" strokeWidth={2.2} />;
      case 'Info':
        return <Droplets size={16} className="text-[#1A73E8]" strokeWidth={2.2} fill="#1A73E8" fillOpacity={0.2} />;
      case 'Normal':
        return <CheckCircle2 size={16} className="text-[#168A45]" strokeWidth={2.2} />;
      default:
        return <CheckCircle2 size={16} className="text-[#168A45]" strokeWidth={2.2} />;
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-[16px] font-bold text-[#102A20]">Alerts Summary</h3>
        <Link 
          href="/alerts" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View all alerts 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {alertsSummary.map((item) => (
          <div 
            key={item.type}
            className="p-3 bg-[#F9FBF9] border border-[#F0F4F1] rounded-xl flex flex-col items-center justify-center text-center hover:border-[#E1E7E3] transition-colors"
          >
            <div className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center mb-1.5 shrink-0`}>
              {renderIcon(item.type)}
            </div>
            
            <div className="text-[18px] font-bold text-[#102A20] leading-none mb-0.5">
              {item.count}
            </div>

            <span className="text-[11px] font-semibold text-[#52645D]">
              {item.type}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
