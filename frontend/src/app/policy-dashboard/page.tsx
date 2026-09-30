"use client";

import React, { useEffect, useState } from "react";
import MapViewer from "@/components/map/MapViewer";
import SOCTracker from "@/components/policy/SOCTracker";
import { getApiBaseUrl } from "@/lib/apiConfig";
import { Download, Globe, Leaf, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function PolicyDashboardPage() {
  const [openEvents, setOpenEvents] = useState<number | null>(null);
  const [arableHa, setArableHa] = useState<number | null>(null);
  const [carbonTC, setCarbonTC] = useState<number | null>(null);
  // Live hazard counts per BRICS nation — the "shared agro-climatic corridor"
  // view of the transboundary heatmap, derived from the same EONET feed.
  const [hotspots, setHotspots] = useState<Array<{ country: string; count: number; topSeverity: string }> | null>(null);

  const SEVERITY_RANK: Record<string, number> = { critical: 3, high: 2, medium: 1, low: 0 };

  useEffect(() => {
    let mounted = true;
    const apiBase = getApiBaseUrl();
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/v1/dpg/outbreaks`, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const json = await res.json();
          const events = Array.isArray(json?.data) ? json.data : [];
          if (mounted) {
            setOpenEvents(events.length);
            const byCountry = new Map<string, { count: number; topSeverity: string }>();
            for (const ev of events) {
              const key = ev.origin_country || "Unknown";
              const prev = byCountry.get(key) ?? { count: 0, topSeverity: "low" };
              const rank = SEVERITY_RANK[ev.severity] ?? 0;
              const prevRank = SEVERITY_RANK[prev.topSeverity] ?? 0;
              byCountry.set(key, {
                count: prev.count + 1,
                topSeverity: rank > prevRank ? ev.severity : prev.topSeverity,
              });
            }
            setHotspots(
              [...byCountry.entries()]
                .map(([country, v]) => ({ country, ...v }))
                .sort((a, b) => b.count - a.count)
            );
          }
        }
      } catch { /* leave null → shows '—' */ }
      try {
        const res = await fetch(`${apiBase}/api/v1/dpg/soc-tracker`, { signal: AbortSignal.timeout(10000) });
        if (res.ok) {
          const json = await res.json();
          const rows = Array.isArray(json?.data) ? json.data : [];
          const total = rows.reduce((s: number, d: any) => s + (d.arable_land_ha || 0), 0);
          const carbon = json?.summary?.total_carbon_estimate_t_c_per_year;
          if (mounted) {
            setArableHa(total);
            if (typeof carbon === "number") setCarbonTC(carbon);
          }
        }
      } catch { /* leave null → shows '—' */ }
    })();
    return () => { mounted = false; };
  }, []);

  const handleExportJSONLD = async () => {
    try {
      // Fetch the combined JSON-LD from the backend (real EONET + World Bank data).
      const apiBase = getApiBaseUrl();
      const outbreaksRes = await fetch(`${apiBase}/api/v1/dpg/outbreaks`);
      const outbreaksData = await outbreaksRes.json();

      const socRes = await fetch(`${apiBase}/api/v1/dpg/soc-tracker`);
      const socData = await socRes.json();

      const combinedJSONLD = {
        "@context": "https://schema.org",
        "@type": "DataCatalog",
        "name": "BRICS Interoperability Agro-Index & Pest Risks",
        "creator": {
          "@type": "Organization",
          "name": "FloraNet AgriN"
        },
        "dataset": [
          outbreaksData,
          socData
        ]
      };

      const blob = new Blob([JSON.stringify(combinedJSONLD, null, 2)], { type: "application/ld+json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'agrin_brics_export.jsonld';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to export JSON-LD", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Globe className="text-blue-400" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">BRICS Interoperability Node</h1>
            <p className="text-xs text-slate-400">AgriN Policy Dashboard & Cross-Border Analytics</p>
          </div>
        </div>
        
        <button 
          onClick={handleExportJSONLD}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Download size={16} />
          Export Global JSON-LD
        </button>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex border-b bg-white overflow-x-auto whitespace-nowrap hide-scrollbar">
          <Link href="/" className="px-4 py-3 text-center text-gray-500 font-medium hover:text-gray-700">
            Diagnose
          </Link>
          <Link href="/planner" className="px-4 py-3 text-center text-gray-500 font-medium hover:text-gray-700">
            Rotation Planner
          </Link>
          <Link href="/field-health" className="px-4 py-3 text-center text-gray-500 font-medium hover:text-gray-700">
            Field Intelligence
          </Link>
          <Link href="/policy-dashboard" className="px-4 py-3 text-center border-b-2 border-green-600 font-semibold text-green-700">
            Policy
          </Link>
          <Link href="/interop" className="px-4 py-3 text-center text-gray-500 font-medium hover:text-gray-700">
            DPG Schema Hub
          </Link>
        </div>

        <div className="flex gap-6 w-full">
          {/* Left Sidebar - Stats */}
          <div className="w-1/4 space-y-4">
            <div className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Open Hazard Events</h3>
              <div className="flex items-center gap-3 text-red-600">
                <ShieldAlert size={24} />
                <span className="text-2xl font-bold">{openEvents !== null ? openEvents : '—'}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">NASA EONET events over BRICS</p>
            </div>

            <div className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Arable Land (WB)</h3>
              <div className="flex items-center gap-3 text-green-600">
                <Globe size={24} />
                <span className="text-2xl font-bold">{arableHa !== null ? `${(arableHa / 1e6).toFixed(1)}M` : '—'}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Hectares across BRICS (WDI AG.LND.ARBL.HA)</p>
            </div>

            <div className="bg-green-50 p-5 rounded-xl border border-green-200 shadow-sm">
              <h3 className="text-sm text-green-800 font-semibold uppercase tracking-wider mb-2">Est. Carbon Sequestration</h3>
              <div className="flex items-center gap-3 text-green-700">
                <Leaf size={24} />
                <span className="text-2xl font-bold">
                  {carbonTC !== null ? `${(carbonTC / 1e6).toFixed(1)}M` : '—'}
                </span>
                <span className="text-xs font-semibold text-green-700">t C/yr</span>
              </div>
              <p className="text-xs text-green-700 mt-2">
                Derived estimate (arable ha × disclosed rate) — see SOC Tracker below
              </p>
            </div>

            {/* Corridor hotspots: live hazard counts per BRICS nation */}
            <div className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-3">
                Corridor Hotspots
              </h3>
              {hotspots === null && (
                <p className="text-xs text-gray-400">—</p>
              )}
              {hotspots !== null && hotspots.length === 0 && (
                <p className="text-xs text-gray-500">No open events attributed to BRICS nations right now.</p>
              )}
              {hotspots !== null && hotspots.length > 0 && (
                <ul className="space-y-2">
                  {hotspots.map((h) => (
                    <li key={h.country} className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-700 truncate">{h.country}</span>
                      <span className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${
                            h.topSeverity === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : h.topSeverity === 'high'
                                ? 'bg-orange-100 text-orange-700'
                                : h.topSeverity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {h.topSeverity}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{h.count}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-[11px] text-gray-400 mt-3">Attributed by observed epicenter (EONET)</p>
            </div>
          </div>

          {/* Right Main Map */}
          <div className="w-3/4 bg-white p-4 rounded-xl border shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Transboundary Pest &amp; Outbreak Heatmap</h2>
            <p className="text-xs text-gray-500 mb-4">
              Live hazard vectors across shared agro-climatic corridors — NASA EONET severity-weighted
              markers, plus Fall Armyworm hotspots aggregated from anonymized leaf diagnoses with
              derived migration vectors toward neighbouring BRICS maize belts.
            </p>
            <MapViewer />
          </div>
        </div>

        {/* SOC Tracker */}
        <div className="w-full">
          <SOCTracker />
        </div>
      </main>
    </div>
  );
}
