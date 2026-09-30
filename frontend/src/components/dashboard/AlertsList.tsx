"use client";

import React from 'react';
import Link from 'next/link';
import { TriangleAlert, Droplet, Bug, ChevronRight } from 'lucide-react';
import { dashboardData } from '@/data/dashboardData';
import { DashboardAlert } from '@/types/dashboard';

export default function AlertsList() {
  const { alerts } = dashboardData;

  const renderAlertIcon = (type: DashboardAlert['type']) => {
    switch (type) {
      case 'warning':
        return (
          <div className="w-9 h-9 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
            <TriangleAlert size={17} strokeWidth={2.2} />
          </div>
        );
      case 'water':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
            <Droplet size={17} strokeWidth={2.2} fill="#1A73E8" className="fill-[#1A73E8]/20" />
          </div>
        );
      case 'pest':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
            <Bug size={17} strokeWidth={2.2} />
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-[#E1E8E2] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col h-[280px]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[16px] font-bold text-[#102A20]">Recent Alerts</h3>
        <Link 
          href="/alerts" 
          className="text-[13px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View all alerts 
          <span className="text-[14px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Alerts List */}
      <div className="flex-1 flex flex-col justify-between divide-y divide-[#F0F4F1]">
        {alerts.map((alert) => (
          <Link
            key={alert.id}
            href="/alerts"
            className="py-2.5 flex items-center gap-3.5 hover:bg-[#F8FAF8] transition-colors group cursor-pointer"
          >
            {renderAlertIcon(alert.type)}
            
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-bold text-[#102A20] truncate mb-0.5 group-hover:text-[#168A45] transition-colors">
                {alert.title}
              </h4>
              <p className="text-[12px] text-[#52645D] truncate leading-normal">
                {alert.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-1">
              <span className="text-[11px] font-medium text-[#52645D]">{alert.time}</span>
              <ChevronRight size={16} className="text-[#889B91] group-hover:text-[#102A20] group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
