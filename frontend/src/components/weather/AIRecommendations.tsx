"use client";

import React from 'react';
import Link from 'next/link';
import { Leaf, Shield, CloudRain, Zap } from 'lucide-react';
import { useLiveWeather } from '@/hooks/useLiveWeather';

/**
 * Agronomic advisories derived deterministically from LIVE Open-Meteo forecast
 * and soil readings by the backend. No static recommendation copy.
 */
export default function AIRecommendations() {
  const { weather, status } = useLiveWeather();
  const recommendations = weather?.recommendations || [];

  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'leaf':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
            <Leaf size={16} strokeWidth={2.2} />
          </div>
        );
      case 'shield':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
            <Shield size={16} strokeWidth={2.2} />
          </div>
        );
      case 'rain':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EEF7F0] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
            <CloudRain size={16} strokeWidth={2.2} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
            <Zap size={16} strokeWidth={2.2} />
          </div>
        );
    }
  };

  const getBadgeStyle = (badgeType: string) => {
    switch (badgeType) {
      case 'high':
        return 'bg-[#EAF5EC] text-[#168A45] border-[#D5E6D8]';
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
        <h3 className="text-[15px] font-bold text-[#102A20]">AI Weather Recommendations</h3>
        <Link 
          href="/recommendations" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View all 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Recommendation List */}
      <div className="space-y-3">
        {status === 'loading' && (
          <p className="py-6 text-center text-[13px] text-[#607469]">Deriving advisories from live forecast…</p>
        )}

        {status === 'unavailable' && (
          <p className="py-6 text-center text-[13px] text-[#607469]">
            Live advisory feed unavailable — backend unreachable. No fabricated advisories are shown.
          </p>
        )}

        {status === 'live' && recommendations.length === 0 && (
          <p className="py-6 text-center text-[13px] text-[#607469]">
            No advisories triggered — live forecast is within safe agronomic thresholds.
          </p>
        )}

        {status === 'live' && recommendations.map((rec, idx) => (
          <div 
            key={rec.id}
            className={`flex items-start gap-3 ${idx !== recommendations.length - 1 ? 'border-b border-[#F0F4F1] pb-3' : ''}`}
          >
            {renderIcon(rec.icon_type)}

            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-bold text-[#102A20] leading-snug mb-0.5">
                {rec.title}
              </h4>
              <p className="text-[12px] text-[#52645D] leading-relaxed mb-2">
                {rec.description}
              </p>

              <span className={`inline-block px-2 py-0.2 rounded-full text-[10px] font-bold border tracking-wide ${getBadgeStyle(rec.badge_type)}`}>
                {rec.badge_text}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
