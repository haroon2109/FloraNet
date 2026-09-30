"use client";

import React, { useEffect, useState } from 'react';
import { Leaf, Loader2, AlertTriangle, ShieldAlert, Info } from 'lucide-react';
import { fetchCarbonMetadata, type CarbonMetadataResponse } from '@/services/seedApi';

/**
 * Soil Organic Carbon Sequestration Metadata.
 *
 * Machine-readable carbon-accounting metadata for indigenous cover crops and
 * green manures, fetched from `GET /api/v1/agrin/carbon-metadata`.
 *
 * The framing here is deliberate and load-bearing. These are PUBLISHED
 * species-level literature ranges, not measurements, and FloraNet has performed
 * no baseline, additionality, third-party verification or permanence accounting.
 * The component therefore:
 *  - shows every figure as a RANGE with the depth and method attached;
 *  - labels each record "not claimable" rather than letting a bare number speak
 *    for itself; and
 *  - publishes the missing-requirements list on the record itself.
 *
 * A card that just printed "0.42 t C/ha/yr" would be the fastest way to turn a
 * reference dataset into a false carbon claim, which is why it does not.
 */
export default function SocSequestrationPanel() {
  const [data, setData] = useState<CarbonMetadataResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetchCarbonMetadata();
      if (!mounted) return;
      setData(res);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-emerald-100 bg-white p-6 flex items-center gap-3 text-sm text-gray-600">
        <Loader2 size={16} className="animate-spin" /> Loading carbon metadata…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900 text-sm">
            Carbon metadata unavailable
          </p>
          <p className="text-xs text-amber-800 mt-1">
            The backend did not return records, so no figure is shown. FloraNet does not
            fall back to cached or placeholder sequestration values.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-900">
            Reference metadata — not carbon credits
          </p>
          <p className="text-[12px] text-amber-800 mt-1 leading-relaxed">
            {data.disclaimer}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.records.map((rec) => (
          <CarbonCard key={rec.id} rec={rec} />
        ))}
      </div>
    </div>
  );
}
function CarbonCard({ rec }: { rec: CarbonMetadataResponse['records'][number] }) {
  const soc = rec.socStockChangeTCPerHaPerYear;
  const co2e = rec.socStockChangeTCO2ePerHaPerYear;
  const dm = rec.biomassDryMatterKgPerHaPerCycle;

  return (
    <article className="rounded-xl border border-emerald-100 bg-white shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
            <Leaf size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-emerald-900">{rec.name}</h3>
            <p className="text-[11px] text-gray-500 font-semibold uppercase">
              {rec.institutionCode} · {rec.isoCountryCode}
            </p>
          </div>
        </div>
        {rec.fixesNitrogen && (
          <span className="shrink-0 rounded-full bg-lime-100 text-lime-800 border border-lime-200 px-2 py-0.5 text-[9px] font-bold uppercase">
            N-fixing
          </span>
        )}
      </div>

      <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
        {rec.validatedInSystem}
      </p>

      {/* Derived SOC range — always a range, never a bare point figure */}
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
          Derived SOC stock change
        </p>
        {soc ? (
          <p className="text-lg font-extrabold text-emerald-700 mt-1">
            {soc.low.toFixed(2)}–{soc.high.toFixed(2)}{' '}
            <span className="text-xs font-bold text-gray-500">t C / ha / yr</span>
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-1">
            Not derivable — no published biomass figure.
          </p>
        )}
        <p className="text-[10px] text-gray-500 mt-1.5">
          {co2e
            ? `${co2e.low.toFixed(2)}–${co2e.high.toFixed(2)} t CO₂e / ha / yr · `
            : ''}
          to {rec.measurementDepthCm} cm depth
        </p>
        <p className="mt-2 inline-block rounded border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700">
          Not claimable as a credit
        </p>
      </div>

      <dl className="mt-3 space-y-1 text-[11px]">
        {dm && (
          <div className="flex justify-between">
            <dt className="text-gray-500">Published biomass (DM)</dt>
            <dd className="font-semibold text-gray-800">
              {dm.low.toLocaleString()}–{dm.high.toLocaleString()} kg/ha
            </dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-gray-500">Provenance</dt>
          <dd className="font-semibold text-gray-800">
            {rec.derived ? 'Derived from published inputs' : 'Reference'}
          </dd>
        </div>
      </dl>

      {rec.additionalBenefits?.length > 0 && (
        <ul className="mt-3 space-y-0.5 border-t border-gray-100 pt-2">
          {rec.additionalBenefits.map((b, i) => (
            <li key={i} className="text-[11px] text-gray-500">
              • {b}
            </li>
          ))}
        </ul>
      )}

      <details className="mt-3 text-[11px] text-gray-500">
        <summary className="cursor-pointer font-semibold text-gray-600 flex items-center gap-1">
          <Info size={11} /> Method, citation &amp; what&apos;s missing
        </summary>
        <div className="mt-2 space-y-2">
          <p>
            <span className="font-semibold text-gray-700">Accounting: </span>
            {rec.accountingMethod}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Citation: </span>
            {rec.citation}
          </p>
          <p className="font-semibold text-gray-700">
            Still missing before any carbon claim:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {rec.creditReadiness.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      </details>
    </article>
  );
}