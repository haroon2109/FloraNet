"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Leaf, Droplet, Shield, ShieldCheck } from 'lucide-react';
import { fetchRecommendations } from '@/services/farmApi';
import { useFarm } from '@/context/farmContext';
import { CropRecommendation } from '@/types/crops';

interface LiveRec {
  id: string;
  title: string;
  priority: string;
  description: string;
  source: string;
}

/**
 * Live agronomy advisories from the backend rule engine
 * (Open-Meteo + ISRIC SoilGrids + NASA EONET). No static copy.
 */
export default function Recommendations() {
  const { userProfile } = useFarm();
  const [recs, setRecs] = useState<LiveRec[]>([]);
  const [status, setStatus] = useState<'loading' | 'live' | 'unavailable'>('loading');

  useEffect(() => {
    let mounted = true;
    const coords = userProfile.defaultCoordinates;
    fetchRecommendations(coords?.lat, coords?.lng, userProfile.primaryCrop).then((data) => {
      if (!mounted) return;
      setRecs((data || []).slice(0, 3) as LiveRec[]);
      setStatus(data && data.length > 0 ? 'live' : 'unavailable');
    });
    return () => { mounted = false; };
  }, [userProfile.defaultCoordinates, userProfile.primaryCrop]);

  const renderIcon = (rec: LiveRec) => {
    const t = rec.title.toLowerCase();
    if (t.includes('irrigat') || t.includes('rain') || t.includes('moisture')) {
      return (
        <div className="w-9 h-9 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
          <Droplet size={17} strokeWidth={2.2} fill="#1A73E8" className="fill-[#1A73E8]/20" />
        </div>
      );
    }
    if (t.includes('hazard') || t.includes('alert')) {
      return (
        <div className="w-9 h-9 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
          <Shield size={17} strokeWidth={2.2} />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
        <Leaf size={17} strokeWidth={2.2} />
      </div>
    );
  };

  const getBadgeStyle = (priority: string) => {
    switch ((priority || '').toLowerCase()) {
      case 'high':
        return 'bg-[#EAF5EC] text-[#168A45] border-[#D5E6D8]';
      case 'medium':
        return 'bg-[#EBF3FE] text-[#1A73E8] border-[#D0E2FB]';
      default:
        return 'bg-[#EAF5EC] text-[#168A45] border-[#D5E6D8]';
    }
  };

  return (
    <div className="mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A20]">AI Crop Recommendations</h3>
        <Link 
          href="/recommendations" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View all 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Recommendation Cards */}
      <div className="bg-white rounded-2xl border border-[#E1E8E2] shadow-[0_2px_12px_rgba(20,60,40,0.04)] p-4 space-y-3.5">
        {status === 'loading' && (
          <p className="py-6 text-center text-[13px] text-[#607469]">Fetching live advisories…</p>
        )}

        {status === 'unavailable' && (
          <div className="py-6 text-center">
            <ShieldCheck size={22} className="mx-auto text-gray-400 mb-1.5" />
            <p className="text-[13px] font-bold text-[#102A20]">Live advisory feed unavailable</p>
            <p className="text-[11.5px] text-[#607469] mt-1">
              Backend /api/v1/farm/recommendations unreachable — no fabricated advisories are shown.
            </p>
          </div>
        )}

        {status === 'live' && recs.map((rec, idx) => (
          <div 
            key={rec.id} 
            className={`flex items-start gap-3 ${idx !== recs.length - 1 ? 'border-b border-[#F0F4F1] pb-3.5' : ''}`}
          >
            {renderIcon(rec)}

            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-bold text-[#102A20] leading-snug mb-0.5">
                {rec.title}
              </h4>
              <p className="text-[12px] text-[#52645D] leading-relaxed mb-2">
                {rec.description}
              </p>
              
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wide ${getBadgeStyle(rec.priority)}`}>
                {rec.priority}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
