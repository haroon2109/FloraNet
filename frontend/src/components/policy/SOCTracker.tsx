"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Download,
  FileJson,
  Landmark,
  Leaf,
  Sprout,
  TrendingUp,
  TreePine,
} from "lucide-react";
import { fetchSocTracker, SocRegionRow, SocTrackerPayload } from "@/services/farmApi";

const nf = (value: number | null | undefined, digits = 1) =>
  value == null
    ? "—"
    : value.toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });

/** Compact large land / tonnage figures (ha, t C) without inventing precision. */
const compact = (value: number | null | undefined) => {
  if (value == null) return "—";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
  return value.toFixed(0);
};

/** Fertilizer intensity routinely exceeds 100% (imports count), so the bar is
 *  scaled to 400% rather than clipped at 100 — no observed value is hidden. */
const fertBarWidth = (pct: number | null) =>
  pct == null ? 0 : Math.min(100, (pct / 400) * 100);

export default function SOCTracker() {
  const [payload, setPayload] = useState<SocTrackerPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const json = await fetchSocTracker();
      if (!mounted) return;
      // resilientFetch returns null both on network failure and on an honest
      // 503 from the backend — either way nothing is substituted for live data.
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        setPayload(json);
      } else {
        setError(true);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const downloadJsonLd = () => {
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/ld+json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agrin_soc_policy_tracker_${Date.now()}.jsonld`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyJsonLd = () => {
    if (!payload) return;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="h-64 w-full rounded-xl flex items-center justify-center bg-white border border-gray-100 shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
        <span className="ml-3 text-gray-600 font-medium">Loading SOC Analytics...</span>
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full">
        <div className="flex items-center gap-3 py-6 justify-center text-gray-600">
          <AlertTriangle size={22} className="text-amber-500" />
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">World Bank indicator feed unavailable</p>
            <p className="text-xs text-gray-500 mt-1">
              Backend endpoint /api/v1/dpg/soc-tracker unreachable. No substitute data is shown.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stats: SocRegionRow[] = payload.data ?? [];
  const summary = payload.summary;
  const rate = summary?.rate_t_c_per_ha;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6 border-b pb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TreePine className="text-green-600" />
            Soil Organic Carbon (SOC) &amp; Policy Tracker
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Aggregated macro-analytics across BRICS — World Bank WDI observations with their data
            vintage, plus a disclosed carbon-sequestration estimate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyJsonLd}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileJson size={14} />
            {copied ? "Copied" : "Copy JSON-LD"}
          </button>
          <button
            onClick={downloadJsonLd}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-green-700 hover:bg-green-800 text-white transition-colors"
          >
            <Download size={14} />
            Export JSON-LD
          </button>
        </div>
      </div>

      {/* ── Regional macro-aggregates (computed in the backend summary block) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Landmark size={12} /> Nations reporting
          </p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">
            {summary?.countries_reporting ?? "—"}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">of the 5 BRICS members</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Sprout size={12} /> Mean fertilizer intensity
          </p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">
            {nf(summary?.mean_fertilizer_intensity_pct)}
            <span className="text-sm">%</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1">AG.CON.FERT.PT.ZS · unweighted mean</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp size={12} /> Total arable land
          </p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">
            {compact(summary?.total_arable_land_ha)}{" "}
            <span className="text-sm font-medium text-gray-500">ha</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1">AG.LND.ARBL.HA · observed</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-[11px] font-bold text-green-800 uppercase tracking-wider flex items-center gap-1">
            <Leaf size={12} /> Est. carbon sequestration
          </p>
          <p className="text-2xl font-extrabold text-green-900 mt-1">
            {compact(summary?.total_carbon_estimate_t_c_per_year)}{" "}
            <span className="text-sm font-medium">t C/yr</span>
          </p>
          <p className="text-[10px] text-green-700 mt-1">
            Derived estimate · rate {rate ?? "—"} t C/ha/yr
          </p>
        </div>
      </div>

      {/* ── Per-nation cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.country}
            className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-green-300 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-lg text-gray-900">{stat.region}</h4>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {stat.country}
                </p>
              </div>
              <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 text-right max-w-[50%]">
                {stat.data_vintage}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Sprout size={14} /> Fertilizer intensity
                  </span>
                  <span className="font-bold text-gray-800">
                    {nf(stat.fertilizer_intensity_pct)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${fertBarWidth(stat.fertilizer_intensity_pct)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  AG.CON.FERT.PT.ZS — fertilizer consumption (% of production)
                </p>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <TrendingUp size={14} /> Agricultural land
                </span>
                <span className="font-bold text-gray-800">{nf(stat.agri_land_pct)}%</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Arable land</span>
                <span className="font-bold text-gray-800">
                  {compact(stat.arable_land_ha)} ha
                </span>
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between items-start gap-3">
                  <span className="text-sm text-gray-600 flex items-center gap-1 shrink-0">
                    <Leaf size={14} className="text-green-600" /> Est. carbon
                  </span>
                  <span className="font-bold text-green-800 text-right">
                    {compact(stat.carbon_estimate?.value_t_c_per_year ?? null)} t C/yr
                  </span>
                </div>
                {stat.carbon_estimate ? (
                  <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                    <span className="font-bold text-amber-700 uppercase">Derived estimate</span>{" "}
                    — {stat.carbon_estimate.method}. Rate assumption{" "}
                    {stat.carbon_estimate.rate_t_c_per_ha} t C/ha/yr; not a measurement.
                  </p>
                ) : (
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    No arable-land datum → no estimate computed.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Provenance footer: what is observed vs. what is assumed ── */}
      <div className="mt-6 pt-4 border-t flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Landmark size={16} className="text-blue-500" />
            <span>Source: {payload.source ?? "World Bank WDI v2 API (CC-BY 4.0) via AgriN JSON-LD"}</span>
          </div>
          <button
            onClick={downloadJsonLd}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Export JSON-LD Data
          </button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11.5px] text-amber-900 leading-relaxed">
          <span className="font-bold">Estimate disclosure:</span> every carbon figure on this
          dashboard is <span className="font-bold">derived</span> as{" "}
          <span className="font-mono">arable_land_ha × {rate ?? "—"} t C/ha/yr</span> from the
          real WDI arable-land observation. The rate is a disclosed planning assumption, not a
          measurement — re-derive it with your own jurisdictional rate if you publish one. All
          indicator values are unmodified World Bank WDI observations with the data years shown
          on each card.
        </div>
      </div>
    </div>
  );
}
