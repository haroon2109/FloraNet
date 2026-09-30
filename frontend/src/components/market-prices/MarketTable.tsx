"use client";

import React, { useEffect, useState } from 'react';
import { Sprout, Wheat, Leaf, ArrowUp, ArrowDown } from 'lucide-react';
import { fetchBRICSExchangeRates } from '@/services/farmApi';
import { useFarm } from '@/context/farmContext';

interface LiveRow {
  crop: string;
  price: string;
  price_usd_ton?: number;
  market: string;
  trend: string;
  direction: 'up' | 'down';
}

const cropIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('maize') || n.includes('corn')) return <Sprout size={18} className="text-[#D97706]" />;
  if (n.includes('wheat')) return <Wheat size={18} className="text-[#D97706]" />;
  if (n.includes('soy')) return <Leaf size={18} className="text-[#168A45]" />;
  return <Sprout size={18} className="text-[#52645D]" />;
};

export default function MarketTable() {
  const { userProfile } = useFarm();
  const [rows, setRows] = useState<LiveRow[]>([]);
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

  return (
    <div className="bg-white rounded-2xl border border-[#E1E8E2] shadow-[0_2px_12px_rgba(20,60,40,0.04)] overflow-hidden mb-6">

      <div className="p-5 border-b border-[#E1E8E2] flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-[#102A20]">International Commodity Benchmarks (Live)</h3>
        <span className="text-[12px] font-semibold text-[#075C32] bg-[#EAF5EC] px-3 py-1 rounded-full border border-[#D5E6D8]">
          CBOT / ICE Futures ({userProfile.countryFlag} {userProfile.currencyCode}/t)
        </span>
      </div>

      {status === 'loading' && (
        <div className="py-12 text-center text-[13px] text-[#607469]">Fetching live futures benchmarks…</div>
      )}

      {status === 'error' && (
        <div className="py-12 text-center">
          <p className="text-[14px] font-bold text-[#102A20]">Live market feed unavailable</p>
          <p className="text-[12px] text-[#607469] mt-1">
            Backend /api/v1/farm/mandi-spot unreachable. No substitute prices are shown.
          </p>
        </div>
      )}

      {status === 'live' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-[#E1E8E2] bg-[#F9FBF9] text-[12px] font-bold text-[#52645D] uppercase tracking-wider">
                <th className="py-3.5 px-5">Commodity (Exchange)</th>
                <th className="py-3.5 px-4 text-center">Benchmark<br /><span className="text-[10px] font-medium text-[#889B91] lowercase">(futures, {userProfile.currencyCode}/t)</span></th>
                <th className="py-3.5 px-4 text-center">USD/t</th>
                <th className="py-3.5 px-4 text-center">Change<br /><span className="text-[10px] font-medium text-[#889B91] lowercase">(last session)</span></th>
                <th className="py-3.5 px-5 text-center">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F1] text-[13px]">
              {rows.map((row) => {
                const isPositive = row.direction !== 'down';
                return (
                  <tr key={row.crop} className="hover:bg-[#F8FAF8] transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FEF9E7] border border-[#FCE8B2] flex items-center justify-center shrink-0">
                          {cropIcon(row.crop)}
                        </div>
                        <span className="text-[14px] font-bold text-[#102A20]">{row.crop}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-[15px] font-bold text-[#102A20]">{row.price}</span>
                    </td>
                    <td className="py-4 px-4 text-center text-[13px] text-[#52645D]">
                      {row.price_usd_ton != null ? `$${row.price_usd_ton.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-0.5 text-[12px] font-bold px-2 py-0.5 rounded-md ${
                        isPositive ? 'bg-[#EAF5EC] text-[#075C32]' : 'bg-[#FCE8E6] text-[#C5221F]'
                      }`}>
                        {isPositive ? <ArrowUp size={11} strokeWidth={2.5} /> : <ArrowDown size={11} strokeWidth={2.5} />}
                        {row.trend}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center text-[11.5px] text-[#52645D]">{row.market}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-4 bg-[#F9FBF9] border-t border-[#E1E8E2]">
        <span className="text-[12px] text-[#52645D]">
          Real-time CBOT/ICE futures settled quotes converted at live spot FX (Yahoo Finance).
          Exchange benchmarks — local retail mandi quotes require a registered market-data subscription.
        </span>
      </div>
    </div>
  );
}
