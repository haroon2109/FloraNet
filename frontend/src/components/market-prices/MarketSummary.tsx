"use client";

import React, { useEffect, useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { fetchBRICSExchangeRates } from '@/services/farmApi';
import { useFarm } from '@/context/farmContext';

/**
 * Market Summary computed from the LIVE futures benchmark feed.
 * Counts of risers/fallers are derived from real daily changes.
 */
export default function MarketSummary() {
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

  const up = rows.filter((r) => r.direction === 'up').length;
  const down = rows.filter((r) => r.direction !== 'up').length;

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">

      <h3 className="text-[15px] font-bold text-[#102A20] mb-3 px-0.5">Market Summary</h3>

      {status === 'loading' && <p className="text-[12px] text-[#607469] py-6 text-center">Loading…</p>}
      {status === 'error' && (
        <p className="text-[12px] text-[#607469] py-6 text-center">
          Live feed unavailable — no substitute values shown.
        </p>
      )}

      {status === 'live' && (
        <div className="grid grid-cols-3 gap-2.5 text-center">

          <div className="p-3 bg-[#FAFCFA] border border-[#F0F4F1] rounded-xl flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center mb-1.5 shrink-0">
              <TrendingUp size={16} strokeWidth={2.2} />
            </div>
            <span className="text-[20px] font-bold text-[#102A20] leading-none">{rows.length}</span>
            <span className="text-[10px] font-medium text-[#52645D] mt-1 leading-tight">Benchmarks Tracked</span>
          </div>

          <div className="p-3 bg-[#FAFCFA] border border-[#F0F4F1] rounded-xl flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center mb-1.5 shrink-0">
              <ArrowUpRight size={16} strokeWidth={2.2} />
            </div>
            <span className="text-[20px] font-bold text-[#102A20] leading-none">{up}</span>
            <span className="text-[10px] font-medium text-[#52645D] mt-1 leading-tight">Up (Last Session)</span>
          </div>

          <div className="p-3 bg-[#FAFCFA] border border-[#F0F4F1] rounded-xl flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center mb-1.5 shrink-0">
              <ArrowDownRight size={16} strokeWidth={2.2} />
            </div>
            <span className="text-[20px] font-bold text-[#102A20] leading-none">{down}</span>
            <span className="text-[10px] font-medium text-[#52645D] mt-1 leading-tight">Down (Last Session)</span>
          </div>

        </div>
      )}
    </div>
  );
}
