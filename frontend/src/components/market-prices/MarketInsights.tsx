"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { fetchBRICSExchangeRates } from '@/services/farmApi';
import { useFarm } from '@/context/farmContext';

/**
 * "Insights" are now strictly data-provenance statements computed from the
 * live feed — no editorial predictions are fabricated on the client.
 */
export default function MarketInsights() {
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

  const strongest = rows.length
    ? rows.reduce((a, b) => (Math.abs(parseFloat(b.trend) || 0) > Math.abs(parseFloat(a.trend) || 0) ? b : a))
    : null;

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">

      <h3 className="text-[16px] font-bold text-[#102A20] mb-3.5">Data Provenance</h3>

      {status === 'loading' && <p className="text-[12px] text-[#607469] py-4">Loading live feed…</p>}

      {status === 'error' && (
        <p className="text-[12px] text-[#607469] py-4">
          Live feed unavailable — no insights are fabricated in its absence.
        </p>
      )}

      {status === 'live' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-3.5">
          <div className="p-3.5 bg-[#FAFCFA] border border-[#F0F4F1] rounded-xl flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#168A45] shrink-0" />
            <p className="text-[12px] font-semibold text-[#102A20] leading-snug">
              {rows.length} real CBOT/ICE futures benchmarks loaded
            </p>
          </div>
          <div className="p-3.5 bg-[#FAFCFA] border border-[#F0F4F1] rounded-xl flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#1A73E8] shrink-0" />
            <p className="text-[12px] font-semibold text-[#102A20] leading-snug">
              Converted at live spot FX: 1 USD ≈ {rows[0]?.fx_rate ?? '—'} {userProfile.currencyCode}
            </p>
          </div>
          <div className="p-3.5 bg-[#FAFCFA] border border-[#F0F4F1] rounded-xl flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#D97706] shrink-0" />
            <p className="text-[12px] font-semibold text-[#102A20] leading-snug">
              Largest move: {strongest?.crop ?? '—'} ({strongest?.trend ?? '—'})
            </p>
          </div>
          <div className="p-3.5 bg-[#FAFCFA] border border-[#F0F4F1] rounded-xl flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#7356C7] shrink-0" />
            <p className="text-[12px] font-semibold text-[#102A20] leading-snug">
              Source: Yahoo Finance public quotes — exchange benchmarks
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#889B91]">
        <span>{fetchedAt ? `Last updated: ${fetchedAt}` : 'Awaiting first fetch'}</span>
        <RefreshCw size={12} className="text-[#889B91]" />
      </div>

    </div>
  );
}
