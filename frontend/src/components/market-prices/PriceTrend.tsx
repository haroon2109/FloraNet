"use client";

import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { fetchBRICSExchangeRates } from '@/services/farmApi';
import { useFarm } from '@/context/farmContext';

/**
 * Overall market trend computed from LIVE futures daily changes.
 * No synthetic sparkline data is generated; the chart shows the average
 * change across the real benchmark basket.
 */
export default function PriceTrend() {
  const { userProfile } = useFarm();
  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState<'loading' | 'live' | 'error'>('loading');

  useEffect(() => {
    let mounted = true;
    fetchBRICSExchangeRates(userProfile.currencyCode).then((data) => {
      if (!mounted) return;
      setRows(data);
      setStatus(data.length > 0 ? 'live' : 'error');
    });
    return () => { mounted = false; };
  }, [userProfile.currencyCode]);

  const parsePct = (trend?: string) => {
    if (!trend) return null;
    const v = parseFloat(trend.replace('%', ''));
    return Number.isFinite(v) ? v : null;
  };

  const valid = rows.map((r) => parsePct(r.trend)).filter((v): v is number => v !== null);
  const avg = valid.length ? valid.reduce((s, v) => s + v, 0) / valid.length : null;
  const up = (avg ?? 0) >= 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E1E8E2] shadow-[0_2px_12px_rgba(20,60,40,0.04)] p-5">
      <h3 className="text-[15px] font-bold text-[#102A20] mb-3">Basket Trend (Live)</h3>

      {status === 'loading' && <p className="text-[12px] text-[#607469] py-4 text-center">Loading…</p>}
      {status === 'error' && (
        <p className="text-[12px] text-[#607469] py-4 text-center">
          Live feed unavailable — no substitute values shown.
        </p>
      )}

      {status === 'live' && avg !== null && (
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            up ? 'bg-[#EAF5EC] text-[#075C32]' : 'bg-[#FCE8E6] text-[#C5221F]'
          }`}>
            <TrendingUp size={22} className={up ? '' : 'rotate-180'} />
          </div>
          <div>
            <p className="text-[22px] font-black text-[#102A20] leading-none">
              {up ? '+' : ''}{avg.toFixed(2)}%
            </p>
            <p className="text-[11px] text-[#607469] mt-1">
              avg daily change · {valid.length} real benchmarks
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
