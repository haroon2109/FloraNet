"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TriangleAlert, Droplet, Bug, Check, ChevronRight, BellRing, Globe } from 'lucide-react';
import { fetchOutbreakEvents, fetchRecommendations } from '@/services/farmApi';
import { useFarm } from '@/context/farmContext';
import { useToast } from '@/context/toastContext';
import { useUILocale } from '@/lib/useUILocale';

interface LiveAlert {
  id: string;
  title: string;
  description: string;
  time: string;
  kind: 'hazard' | 'advisory';
}

/**
 * Active alerts from REAL sources only:
 *  - NASA EONET open hazard events (via backend /api/v1/dpg/outbreaks)
 *  - Live rule-engine advisories (via backend /api/v1/farm/recommendations)
 * The previous static fabricated alert list has been removed.
 */
export default function RecentAlerts() {
  const { showToast, } = useToast();
  const { userProfile } = useFarm();
  // Event dates are formatted in the farmer's chosen language.
  const locale = useUILocale();
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [status, setStatus] = useState<'loading' | 'live' | 'empty' | 'unavailable'>('loading');
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    const coords = userProfile.defaultCoordinates;

    (async () => {
      const collected: LiveAlert[] = [];

      // 1. Real transboundary hazards near the farm region
      const outbreaks = await fetchOutbreakEvents();
      if (outbreaks?.data) {
        for (const ev of outbreaks.data.slice(0, 3)) {
          collected.push({
            id: `eonet-${ev.id}`,
            title: ev.pest_name || 'Natural hazard event',
            description: `NASA EONET: active ${ev.affected_crop || 'hazard'} over ${ev.origin_country}. Severity: ${ev.severity}.`,
            time: ev.date ? new Date(ev.date).toLocaleDateString(locale) : 'recent',
            kind: 'hazard',
          });
        }
      }

      // 2. Live advisories (hazard entries within 500 km appear here too)
      const recs = await fetchRecommendations(coords?.lat, coords?.lng, userProfile.primaryCrop);
      if (recs) {
        for (const rec of recs.slice(0, 3)) {
          if (rec.priority === 'Info') continue;
          collected.push({
            id: rec.id,
            title: rec.title,
            description: rec.description,
            time: 'live',
            kind: 'advisory',
          });
        }
      }

      if (!mounted) return;
      setAlerts(collected);
      setStatus(collected.length ? 'live' : 'empty');
    })();

    return () => { mounted = false; };
  }, [userProfile.defaultCoordinates, userProfile.primaryCrop]);

  const handleResolveAlert = (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResolvedIds((prev) => [...prev, id]);
    showToast(`Alert resolved: "${title}"`, 'success');
  };

  const renderAlertIcon = (kind: LiveAlert['kind'], title: string) => {
    const t = title.toLowerCase();
    if (kind === 'hazard' || t.includes('hazard')) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
          <Globe size={18} strokeWidth={2.2} />
        </div>
      );
    }
    if (t.includes('irrigat') || t.includes('moisture') || t.includes('rain')) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
          <Droplet size={18} strokeWidth={2.2} fill="#1A73E8" className="fill-[#1A73E8]/20" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-2xl bg-[#EEF7F0] text-[#075C32] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
        <TriangleAlert size={18} strokeWidth={2.2} />
      </div>
    );
  };

  return (
    <section className="mb-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <BellRing size={18} className="text-[#075C32]" />
          <h2 className="text-[16px] sm:text-[17px] font-bold text-[#102A20]">Active Farm Alerts</h2>
          {status === 'live' && (
            <span className="bg-[#EAF5EC] text-[#075C32] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#C4E7D0]">
              {alerts.length - resolvedIds.length} Pending
            </span>
          )}
        </div>
        <Link
          href="/alerts"
          className="text-[12.5px] font-bold text-[#075C32] hover:text-[#054324] transition-colors inline-flex items-center gap-1 group"
        >
          View all alerts
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#E1E8E2] overflow-hidden shadow-[0_4px_20px_rgba(16,42,32,0.04)] divide-y divide-[#F0F4F1]">
        {status === 'loading' && (
          <p className="p-6 text-center text-[13px] text-[#607469]">Checking live hazard & advisory feeds…</p>
        )}

        {status === 'unavailable' && (
          <div className="p-6 text-center">
            <TriangleAlert size={20} className="mx-auto text-amber-500 mb-1.5" />
            <p className="text-[13px] font-bold text-[#102A20]">Live alert feeds unavailable</p>
            <p className="text-[11.5px] text-[#607469] mt-1">
              Backend unreachable — no fabricated alerts are shown.
            </p>
          </div>
        )}

        {status === 'empty' && (
          <div className="p-6 text-center">
            <Check size={20} className="mx-auto text-[#075C32] mb-1.5" />
            <p className="text-[13px] font-bold text-[#102A20]">No active alerts</p>
            <p className="text-[11.5px] text-[#607469] mt-1">
              No open NASA EONET hazards near your region and all live advisories are nominal.
            </p>
          </div>
        )}

        {status === 'live' && alerts.map((alert) => {
          const isResolved = resolvedIds.includes(alert.id);
          if (isResolved) {
            return (
              <div key={alert.id} className="p-3 sm:px-5 flex items-center justify-between bg-[#F8FAF8] text-[12.5px] text-[#63756C]">
                <span className="flex items-center gap-2 line-through">
                  <Check size={14} className="text-[#075C32]" />
                  <span>{alert.title}</span>
                </span>
                <span className="text-[11px] font-bold text-[#075C32]">Resolved ✓</span>
              </div>
            );
          }

          return (
            <div
              key={alert.id}
              className="p-3.5 sm:px-5 flex items-center gap-3.5 hover:bg-[#F8FAF8] transition-colors group"
            >
              {renderAlertIcon(alert.kind, alert.title)}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-[13.5px] font-bold text-[#102A20] truncate">
                    {alert.title}
                  </h4>
                  <span className="text-[11px] font-medium text-[#7C8E84] shrink-0">
                    • {alert.time}
                  </span>
                </div>
                <p className="text-[12.5px] text-[#53645D] truncate leading-normal">
                  {alert.description}
                </p>
              </div>

              {/* Quick Inline Resolve Action */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleResolveAlert(e, alert.id, alert.title)}
                  className="px-2.5 py-1 rounded-lg text-[11.5px] font-bold bg-[#F2F7F4] hover:bg-[#E2ECE5] text-[#102A20] border border-[#D5E3D8] transition-all cursor-pointer shadow-2xs"
                >
                  Resolve
                </button>

                <Link
                  href="/alerts"
                  className="p-1.5 text-[#889B91] hover:text-[#102A20] transition-colors"
                  aria-label="Inspect alert details"
                >
                  <ChevronRight size={17} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
