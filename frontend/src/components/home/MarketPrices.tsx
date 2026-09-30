"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { getBRICSCountryConfig } from '@/data/bricsLocalization';
import { fetchBRICSExchangeRates } from '@/services/farmApi';

export default function MarketPrices() {
  const { userProfile } = useFarm();
  const bricsConfig = getBRICSCountryConfig(userProfile.country);
  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState<'loading' | 'live' | 'unavailable'>('loading');

  useEffect(() => {
    let mounted = true;
    fetchBRICSExchangeRates(bricsConfig.currencyCode).then((data) => {
      if (!mounted) return;
      setRows(data.slice(0, 3));
      setStatus(data.length > 0 ? 'live' : 'unavailable');
    });
    return () => { mounted = false; };
  }, [bricsConfig.currencyCode]);

  return (
    <div className="mb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-[16px] sm:text-[17px] font-bold text-[#102A20] flex items-center gap-1.5">
          <TrendingUp size={17} className="text-[#075C32]" strokeWidth={2.2} />
          <span>Regional Mandi Arbitrage ({bricsConfig.currencyCode})</span>
        </h2>
        <Link 
          href="/market-prices" 
          className="text-[12.5px] font-bold text-[#075C32] hover:text-[#054324] transition-colors inline-flex items-center gap-1 group"
        >
          View all 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Live Futures Grid (real CBOT/ICE benchmarks) */}
      <div className="bg-white rounded-2xl border border-[#E1E8E2] shadow-[0_4px_20px_rgba(16,42,32,0.04)] p-4 sm:p-5">
        {status === 'loading' && (
          <div className="py-6 text-center text-[13px] text-[#607469]">Fetching live CBOT/ICE benchmarks…</div>
        )}
        {status === 'unavailable' && (
          <div className="py-6 text-center">
            <p className="text-[13px] font-bold text-[#102A20]">Live market feed unavailable</p>
            <p className="text-[11px] text-[#607469] mt-1">Backend /api/v1/farm/mandi-spot unreachable — no substitute prices shown.</p>
          </div>
        )}
        {status === 'live' && (
          <div className="grid grid-cols-3 divide-x divide-[#F0F4F1]">
            {rows.map((row, idx) => {
              const isPositive = row.direction !== 'down';
              return (
                <div
                  key={row.crop}
                  className={`flex flex-col justify-between ${idx === 0 ? 'pr-2.5 sm:pr-3.5' : idx === 1 ? 'px-2.5 sm:px-3.5' : 'pl-2.5 sm:pl-3.5'}`}
                >
                  <div>
                    <span className="text-[12.5px] sm:text-[13px] font-bold text-[#102A20] mb-0.5 block truncate">
                      {row.crop.split('(')[0].trim()}
                    </span>
                    <span className="text-[11px] text-[#63756C] block truncate mb-2">
                      {row.market}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline flex-wrap gap-0.5 mb-1.5">
                      <span className="text-[14px] sm:text-[16px] font-bold text-[#102A20] leading-none tracking-tight">
                        {row.price}
                      </span>
                    </div>

                    <div className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                      isPositive
                        ? 'bg-[#EAF5EC] text-[#075C32] border border-[#C4E7D0]'
                        : 'bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]'
                    }`}>
                      {isPositive ? (
                        <ArrowUp size={11} strokeWidth={2.5} />
                      ) : (
                        <ArrowDown size={11} strokeWidth={2.5} />
                      )}
                      <span>{row.trend}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
