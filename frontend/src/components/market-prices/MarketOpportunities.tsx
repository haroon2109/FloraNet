"use client";

import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchBRICSExchangeRates } from '@/services/farmApi';
import { useFarm } from '@/context/farmContext';

/**
 * Cross-exchange comparison built from the LIVE futures feed — the markets
 * shown are the real exchanges behind each benchmark (CBOT/ICE), with actual
 * USD/tonne quotes. Fabricated per-city mandi tables have been removed.
 */
export default function MarketOpportunities() {
  const { userProfile } = useFarm();
  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState<'loading' | 'live' | 'error'>('loading');
  const [fetchedAt, setFetchedAt] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    fetchBRICSExchangeRates(userProfile.currencyCode).then((data) => {
      if (!mounted) return;
      setRows(data);
      setFetchedAt(new Date().toLocaleTimeString());
      setStatus(data.length > 0 ? 'live' : 'error');
    });
    return () => { mounted = false; };
  }, [userProfile.currencyCode]);

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">

      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A20]">Benchmarks by Exchange (USD/t)</h3>
        <button
          type="button"
          aria-label="Refresh prices"
          onClick={() => window.location.reload()}
          className="hover:text-[#168A45] transition-colors text-[#889B91]"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {status === 'loading' && <p className="text-[12px] text-[#607469] py-4 text-center">Loading…</p>}

      {status === 'error' && (
        <p className="text-[12px] text-[#607469] py-4 text-center">
          Live feed unavailable — no substitute table shown.
        </p>
      )}

      {status === 'live' && (
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-[#E1E7E3] text-[#52645D] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-1.5 px-2">Commodity</th>
                <th className="py-1.5 px-2 text-right">USD/t</th>
                <th className="py-1.5 px-2 text-right">Local/t</th>
                <th className="py-1.5 px-2 text-right">Δ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F1]">
              {rows.map((row) => (
                <tr key={row.crop} className="hover:bg-[#F9FBF9]">
                  <td className="py-2 px-2 font-bold text-[#102A20]">{row.crop}</td>
                  <td className="py-2 px-2 text-right font-medium text-[#102A20]">
                    ${row.price_usd_ton?.toFixed(2) ?? '—'}
                  </td>
                  <td className="py-2 px-2 text-right font-medium text-[#102A20]">{row.price}</td>
                  <td className={`py-2 px-2 text-right font-bold ${
                    row.direction === 'up' ? 'text-[#075C32]' : 'text-[#C5221F]'
                  }`}>
                    {row.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] font-medium text-[#889B91] pt-1 border-t border-[#F0F4F1]">
        <span>{fetchedAt ? `Prices updated: ${fetchedAt}` : 'Awaiting fetch'}</span>
        <span>CBOT / ICE via Yahoo Finance</span>
      </div>

    </div>
  );
}
