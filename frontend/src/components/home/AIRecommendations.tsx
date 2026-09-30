"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Leaf, Droplet, Shield, Check, ArrowRight, Zap, TriangleAlert } from 'lucide-react';
import { fetchRecommendations } from '@/services/farmApi';
import { useFarm } from '@/context/farmContext';
import { useToast } from '@/context/toastContext';

interface LiveRec {
  id: string;
  title: string;
  priority: string;
  description: string;
  source: string;
}

/**
 * AI Advisory Schedule built from the backend's LIVE rule engine
 * (Open-Meteo + ISRIC SoilGrids + NASA EONET). No static fake advisories.
 */
export default function AIRecommendations() {
  const { userProfile } = useFarm();
  const { showToast } = useToast();
  const [recs, setRecs] = useState<LiveRec[]>([]);
  const [status, setStatus] = useState<'loading' | 'live' | 'unavailable'>('loading');
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

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

  const handleApply = (id: string, title: string) => {
    if (appliedIds.includes(id)) return;
    setAppliedIds((prev) => [...prev, id]);
    showToast(`Action scheduled: "${title}" applied to farm schedule.`, 'success');
  };

  const renderIcon = (rec: LiveRec) => {
    const t = rec.title.toLowerCase();
    if (t.includes('irrigat') || t.includes('rain') || t.includes('moisture')) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
          <Droplet size={18} strokeWidth={2.2} fill="#1A73E8" className="fill-[#1A73E8]/20" />
        </div>
      );
    }
    if (t.includes('hazard') || t.includes('alert')) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
          <TriangleAlert size={18} strokeWidth={2.2} />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-2xl bg-[#EEF7F0] text-[#075C32] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
        <Leaf size={18} strokeWidth={2.2} />
      </div>
    );
  };

  const badgeFor = (priority: string) => {
    switch ((priority || '').toLowerCase()) {
      case 'high': return 'bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]';
      case 'medium': return 'bg-[#EBF3FE] text-[#1A73E8] border-[#D0E2FB]';
      default: return 'bg-[#EEF7F0] text-[#075C32] border-[#D5E6D8]';
    }
  };

  return (
    <div className="mb-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-[16px] sm:text-[17px] font-bold text-[#102A20] flex items-center gap-1.5">
          <Zap size={16} className="text-[#075C32]" />
          <span>Live Advisory Schedule</span>
        </h2>
        <Link
          href="/recommendations"
          className="text-[12.5px] font-bold text-[#075C32] hover:text-[#054324] transition-colors inline-flex items-center gap-1 group"
        >
          View all
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#E1E8E2] shadow-[0_4px_20px_rgba(16,42,32,0.04)] p-4 space-y-4">
        {status === 'loading' && (
          <p className="py-6 text-center text-[13px] text-[#607469]">Fetching live advisories…</p>
        )}

        {status === 'unavailable' && (
          <div className="py-6 text-center">
            <Shield size={22} className="mx-auto text-gray-400 mb-1.5" />
            <p className="text-[13px] font-bold text-[#102A20]">Live advisory feed unavailable</p>
            <p className="text-[11.5px] text-[#607469] mt-1">
              Backend /api/v1/farm/recommendations unreachable — no fabricated advisories are shown.
            </p>
          </div>
        )}

        {status === 'live' && recs.map((rec, idx) => {
          const isApplied = appliedIds.includes(rec.id);
          return (
            <div
              key={rec.id}
              className={`flex items-start gap-3.5 ${idx !== recs.length - 1 ? 'border-b border-[#F0F4F1] pb-4' : ''}`}
            >
              {renderIcon(rec)}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-[13.5px] font-bold text-[#102A20] leading-snug">
                    {rec.title}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border shrink-0 ${badgeFor(rec.priority)}`}>
                    {rec.priority}
                  </span>
                </div>

                <p className="text-[12.5px] text-[#53645D] leading-relaxed mb-1.5">
                  {rec.description}
                </p>
                <p className="text-[10.5px] text-[#889B91] mb-2.5">Source: {rec.source}</p>

                <button
                  type="button"
                  onClick={() => handleApply(rec.id, rec.title)}
                  disabled={isApplied}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer shadow-2xs ${
                    isApplied
                      ? 'bg-[#EAF5EC] text-[#075C32] border border-[#C4E7D0]'
                      : 'bg-white hover:bg-[#EEF7F1] text-[#243A2E] hover:text-[#075C32] border border-[#D5E3D8] hover:border-[#168A45]'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <Check size={13} strokeWidth={2.5} />
                      <span>Scheduled to Field ✓</span>
                    </>
                  ) : (
                    <>
                      <span>Apply Recommendation</span>
                      <ArrowRight size={12} />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
