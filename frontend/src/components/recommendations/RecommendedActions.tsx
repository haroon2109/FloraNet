"use client";

import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import RecommendationCard from './RecommendationCard';
import { fetchRecommendations } from '@/services/farmApi';
import { useFarm } from '@/context/farmContext';

/**
 * Recommended Actions sourced from the backend's LIVE rule engine
 * (Open-Meteo + ISRIC SoilGrids + NASA EONET). Empty + explicit state
 * when the feed is unreachable — no fabricated recommendations.
 */
export default function RecommendedActions() {
  const { userProfile } = useFarm();
  const [recs, setRecs] = useState<any[]>([]);
  const [status, setStatus] = useState<'loading' | 'live' | 'unavailable'>('loading');

  useEffect(() => {
    let mounted = true;
    const coords = userProfile.defaultCoordinates;
    fetchRecommendations(coords?.lat, coords?.lng, userProfile.primaryCrop).then((data) => {
      if (!mounted) return;
      setRecs(data || []);
      setStatus(data && data.length > 0 ? 'live' : 'unavailable');
    });
    return () => { mounted = false; };
  }, [userProfile.defaultCoordinates, userProfile.primaryCrop]);

  return (
    <div className="w-full mb-6 mx-6 relative z-10 flex-1 max-w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[17px] font-semibold text-[#102A20]">Recommended Actions (Live)</h2>

        <div className="flex items-center gap-2 text-[12px] font-medium text-[#52645D]">
          Source:
          <span className="flex items-center gap-1 text-[#102A20] font-semibold">
            Open-Meteo · SoilGrids · EONET <ChevronDown size={14} />
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-[calc(100%-48px)]">
        {status === 'loading' && (
          <p className="py-8 text-center text-[13px] text-[#607469]">Fetching live advisories…</p>
        )}

        {status === 'unavailable' && (
          <p className="py-8 text-center text-[13px] text-[#607469]">
            Live advisory feed unavailable — no fabricated recommendations are shown.
          </p>
        )}

        {status === 'live' && recs.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}
