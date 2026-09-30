"use client";

import React, { useEffect, useState } from 'react';
import { BarChart3, ExternalLink, Info } from 'lucide-react';
import { fetchCropStats } from '@/services/farmApi';

interface CountryStat {
  country: string;
  iso3: string;
  cereal_yield_kg_ha: { value: number; year: string } | null;
  fertilizer_intensity: { value: number; year: string } | null;
}

const ISO_COLORS: Record<string, string> = {
  BRA: '#F2C94C',
  RUS: '#E2604A',
  IND: '#168A45',
  CHN: '#D97706',
  ZAF: '#4A7FB5',
};

export default function MonteCarloYieldDistribution({
  cropName,
}: {
  cropName?: string;
}) {
  const [stats, setStats] = useState<CountryStat[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Live national statistics: World Bank WDI via the backend. We render real
    // values or an explicit failure state — never fabricated distributions.
    let mounted = true;
    fetchCropStats().then((data) => {
      if (!mounted) return;
      if (data && data.stats && data.stats.length > 0) {
        setStats(data.stats);
      } else {
        setFailed(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const loading = stats === null && !failed;
  const hasData = stats !== null && stats.length > 0;
  const max = hasData
    ? Math.max(...stats.map((s) => s.cereal_yield_kg_ha?.value ?? 0))
    : 0;

  return (
    <div className="w-full bg-white border border-[#E1E8E4] rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#F0F4F1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#075C32]" />
            <h3 className="text-[16.5px] font-bold text-[#102A20]">
              BRICS Cereal Yield Comparison{cropName ? ` — ${cropName}` : ''}
            </h3>
          </div>
          <p className="text-[12px] text-[#55695F] mt-0.5">
            National cereal yield (kg per hectare), most recent World Bank WDI values across all five BRICS nations
          </p>
        </div>

        <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#075C32] bg-[#E8F5EB] px-2.5 py-1 rounded-lg border border-[#CDE5D5] whitespace-nowrap self-start">
          World Bank WDI · CC-BY 4.0
        </span>
      </div>

      {/* States */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#55695F]">
          <BarChart3 size={26} className="animate-pulse" />
          <span className="text-[13px] font-semibold">Loading live World Bank data…</span>
        </div>
      )}

      {!loading && !hasData && (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-center">
          <Info size={26} className={failed ? 'text-[#B45309]' : 'text-[#55695F]'} />
          <span className="text-[13.5px] font-bold text-[#102A20]">
            National crop statistics unavailable
          </span>
          <span className="text-[12px] text-[#55695F] max-w-md leading-relaxed">
            {failed
              ? 'The World Bank data service could not be reached. No substitute figures are shown — this chart only displays real WDI values.'
              : 'No WDI records are currently available for the BRICS nations.'}
          </span>
        </div>
      )}

      {/* Real data chart */}
      {hasData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {/* Top performer */}
            {(() => {
              const ranked = [...stats!]
                .filter((s) => s.cereal_yield_kg_ha)
                .sort(
                  (a, b) =>
                    (b.cereal_yield_kg_ha!.value) - (a.cereal_yield_kg_ha!.value)
                );
              const top = ranked[0];
              const bottom = ranked[ranked.length - 1];
              const spread =
                top && bottom && bottom.cereal_yield_kg_ha!.value > 0
                  ? (
                      ((top.cereal_yield_kg_ha!.value -
                        bottom.cereal_yield_kg_ha!.value) /
                        bottom.cereal_yield_kg_ha!.value) *
                      100
                    ).toFixed(0)
                  : null;
              return (
                <>
                  <div className="bg-[#F4FAF6] border border-[#CCE3D3] rounded-xl p-3.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#075C32]">
                      Highest national yield
                    </span>
                    <div className="my-1">
                      <span className="text-[24px] font-extrabold text-[#075C32]">
                        {top ? top.cereal_yield_kg_ha!.value.toLocaleString() : '—'}
                      </span>
                      <span className="text-[14px] font-medium text-[#168A45]"> kg/ha</span>
                    </div>
                    <span className="text-[11px] text-[#4A5D53]">
                      {top ? `${top.country} · ${top.cereal_yield_kg_ha!.year}` : '—'}
                    </span>
                  </div>
                  <div className="bg-[#FFF9F5] border border-[#FED7AA] rounded-xl p-3.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A3412]">
                      Lowest national yield
                    </span>
                    <div className="my-1">
                      <span className="text-[24px] font-extrabold text-[#9A3412]">
                        {bottom ? bottom.cereal_yield_kg_ha!.value.toLocaleString() : '—'}
                      </span>
                      <span className="text-[14px] font-medium text-[#7C2D12]"> kg/ha</span>
                    </div>
                    <span className="text-[11px] text-[#9A3412]/80">
                      {bottom ? `${bottom.country} · ${bottom.cereal_yield_kg_ha!.year}` : '—'}
                    </span>
                  </div>
                  <div className="bg-[#F5F8FC] border border-[#C9D9EC] rounded-xl p-3.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#2C5282]">
                      Yield spread
                    </span>
                    <div className="my-1">
                      <span className="text-[24px] font-extrabold text-[#2C5282]">
                        {spread ?? '—'}
                        {spread && '%'}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#2C5282]/80">
                      Gap between highest and lowest BRICS yields
                    </span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Bar chart of real yields */}
          <div className="bg-[#FAFCFA] border border-[#E8EFEA] rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4 text-[12px] font-bold text-[#55695F]">
              <span>Cereal yield, kg per hectare (most recent WDI year)</span>
              <span className="flex items-center gap-1 text-[11px] font-medium">
                <ExternalLink size={12} />
                api.worldbank.org
              </span>
            </div>

            <div className="space-y-3">
              {[...stats!]
                .filter((s) => s.cereal_yield_kg_ha)
                .sort(
                  (a, b) =>
                    (b.cereal_yield_kg_ha!.value) - (a.cereal_yield_kg_ha!.value)
                )
                .map((s) => {
                  const value = s.cereal_yield_kg_ha!.value;
                  const color = ISO_COLORS[s.iso3] ?? '#075C32';
                  return (
                    <div key={s.iso3} className="group">
                      <div className="flex items-center justify-between text-[12.5px] font-bold text-[#102A20] mb-1">
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          {s.country}
                          <span className="text-[10.5px] font-medium text-[#889B91]">
                            {s.iso3} · {s.cereal_yield_kg_ha!.year}
                          </span>
                        </span>
                        <span className="text-[#075C32]">
                          {value.toLocaleString()} kg/ha
                        </span>
                      </div>
                      <div className="h-5 bg-[#EDF3EE] rounded-md overflow-hidden">
                        <div
                          className="h-full rounded-md transition-all duration-700 group-hover:opacity-80"
                          style={{
                            width: `${Math.max(4, (value / max) * 100)}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                      {s.fertilizer_intensity && (
                        <div className="text-[10.5px] text-[#6A7E74] mt-1">
                          Fertilizer intensity: {s.fertilizer_intensity.value.toLocaleString()} kg/ha
                          ({s.fertilizer_intensity.year})
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
