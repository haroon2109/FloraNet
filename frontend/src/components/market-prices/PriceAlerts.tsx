"use client";

import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { fetchBRICSExchangeRates } from '@/services/farmApi';
import { useFarm } from '@/context/farmContext';

interface LiveAlertRow {
  id: string;
  commodity: string;
  title: string;
  subtext: string;
  active: boolean;
}

/**
 * Price alerts derived from REAL live futures movements (deterministic rules,
 * e.g. |change| ≥ 3% flags a benchmark). No static fabricated alert list.
 */
export default function PriceAlerts() {
  const { userProfile } = useFarm();
  const [alerts, setAlerts] = useState<LiveAlertRow[]>([]);
  const [status, setStatus] = useState<'loading' | 'live' | 'empty' | 'unavailable'>('loading');

  useEffect(() => {
    let mounted = true;
    fetchBRICSExchangeRates(userProfile.currencyCode).then((rows) => {
      if (!mounted) return;
      const found: LiveAlertRow[] = [];
      for (const row of rows) {
        const change = Math.abs(parseFloat(row.trend) || 0);
        if (change >= 3) {
          found.push({
            id: `alert-${row.crop}`,
            commodity: row.crop,
            title: `${row.crop} moved ${row.trend}`,
            subtext: `Live CBOT/ICE benchmark at ${row.price} (${row.market}). Threshold: ±3%/session.`,
            active: true,
          });
        }
      }
      setAlerts(found);
      setStatus(rows.length ? (found.length ? 'live' : 'empty') : 'unavailable');
    });
    return () => { mounted = false; };
  }, [userProfile.currencyCode]);

  if (status === 'loading') {
    return (
      <div className="bg-white border border-[#E1E7E3] rounded-xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] h-full">
        <h2 className="text-[15px] font-semibold text-[#102A20] flex items-center gap-2 mb-4">
          <Bell size={16} className="text-[#168A45]" /> Price Alerts
        </h2>
        <p className="py-6 text-center text-[12px] text-[#607469]">Checking live market moves…</p>
      </div>
    );
  }

  if (status === 'unavailable') {
    return (
      <div className="bg-white border border-[#E1E7E3] rounded-xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] h-full">
        <h2 className="text-[15px] font-semibold text-[#102A20] flex items-center gap-2 mb-4">
          <Bell size={16} className="text-[#168A45]" /> Price Alerts
        </h2>
        <p className="py-6 text-center text-[12px] text-[#607469]">
          Live feed unavailable — no alerts can be evaluated.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-semibold text-[#102A20] flex items-center gap-2">
          <Bell size={16} className="text-[#168A45]" /> Price Alerts
        </h2>
        <span className="text-[11px] font-medium text-[#607469]">Threshold: ±3%/session</span>
      </div>

      {status === 'empty' ? (
        <p className="py-6 text-center text-[12px] text-[#607469]">
          No benchmarks moved more than 3% in the last session — no alerts triggered.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {alerts.map((alert, idx) => (
            <div key={alert.id} className={`flex items-start justify-between gap-4 ${idx !== alerts.length - 1 ? 'border-b border-[#E1E7E3]/60 pb-4' : ''}`}>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-[#102A20] mb-1 leading-tight">{alert.title}</div>
                <div className="text-[11px] text-[#52645D]">{alert.subtext}</div>
              </div>

              <div className="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent bg-[#168A45] transition-colors duration-200 ease-in-out">
                <span className="sr-only">Alert active</span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none inline-block h-4 w-4 transform translate-x-4 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
