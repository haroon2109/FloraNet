"use client";

import React from 'react';
import Link from 'next/link';
import { TriangleAlert, Droplets, Wind, ShieldCheck } from 'lucide-react';
import { useLiveWeather } from '@/hooks/useLiveWeather';

export default function WeatherAlerts() {
  const { weather, status } = useLiveWeather();
  const alerts = weather?.alerts || [];

  const renderIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('rain')) {
      return (
        <div className="w-8 h-8 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
          <Droplets size={16} strokeWidth={2.2} fill="#1A73E8" fillOpacity={0.2} />
        </div>
      );
    }
    if (t.includes('wind')) {
      return (
        <div className="w-8 h-8 rounded-full bg-[#EEF7F0] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
          <Wind size={16} strokeWidth={2.2} />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
        <TriangleAlert size={16} strokeWidth={2.2} />
      </div>
    );
  };

  const getBadgeStyle = (badgeType: string) => {
    switch (badgeType) {
      case 'high':
        return 'bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]';
      case 'medium':
        return 'bg-[#FEF7E0] text-[#B45309] border-[#FCE8B2]';
      default:
        return 'bg-[#EBF3FE] text-[#1A73E8] border-[#D0E2FB]';
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A20]">Weather Alerts</h3>
        <Link 
          href="/alerts" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View all 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {status === 'loading' && (
          <p className="py-6 text-center text-[13px] text-[#607469]">Checking live forecast alerts…</p>
        )}

        {status === 'unavailable' && (
          <p className="py-6 text-center text-[13px] text-[#607469]">
            Live alert feed unavailable — backend unreachable. No substitute alerts are shown.
          </p>
        )}

        {status === 'live' && alerts.length === 0 && (
          <div className="py-6 text-center">
            <ShieldCheck size={22} className="mx-auto text-[#168A45] mb-1.5" />
            <p className="text-[13px] font-bold text-[#102A20]">No active weather alerts</p>
            <p className="text-[11.5px] text-[#607469] mt-1">
              No heat, heavy-rain or strong-wind thresholds crossed in the live 7-day forecast.
            </p>
          </div>
        )}

        {status === 'live' && alerts.map((alert, idx) => (
          <div 
            key={alert.id}
            className={`flex items-start gap-3 ${idx !== alerts.length - 1 ? 'border-b border-[#F0F4F1] pb-3' : ''}`}
          >
            {renderIcon(alert.title)}

            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-bold text-[#102A20] leading-snug mb-0.5">
                {alert.title}
              </h4>
              <p className="text-[12px] text-[#52645D] leading-relaxed mb-2">
                {alert.description}
              </p>

              <div className="flex items-center justify-between">
                <span className={`inline-block px-2 py-0.2 rounded-full text-[10px] font-bold border tracking-wide ${getBadgeStyle(alert.badge_type)}`}>
                  {alert.badge_text}
                </span>
                <span className="text-[11px] font-medium text-[#889B91]">{alert.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
