"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, ShieldAlert, Sprout, Database } from "lucide-react";
import {
  fetchOutbreakEvents,
  fetchCorpusStats,
  fetchCropStats,
} from "@/services/farmApi";

// Every KPI on this strip is computed from a live backend source. When a
// source is unreachable we show an explicit "unavailable" state — we never
// render fabricated values or fake quarter-over-quarter trends.

interface MacroKPI {
  title: string;
  value: string | null;
  subtext: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
}

export default function MacroKPIStrip() {
  const [hazardCount, setHazardCount] = useState<number | null>(null);
  const [docCount, setDocCount] = useState<number | null>(null);
  const [topYield, setTopYield] = useState<{
    country: string;
    value: number;
  } | null>(null);
  const [avgYield, setAvgYield] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    // 1. Live NASA EONET hazards over BRICS nations (via backend).
    fetchOutbreakEvents().then((data) => {
      if (!mounted) return;
      const events = data?.data;
      setHazardCount(Array.isArray(events) ? events.length : null);
    });

    // 2. Real RAG corpus statistics (documents actually indexed by FAISS).
    fetchCorpusStats().then((data) => {
      if (!mounted) return;
      setDocCount(
        data && typeof data.document_count === "number"
          ? data.document_count
          : null
      );
    });

    // 3 & 4. Real World Bank cereal yields across the five BRICS nations.
    fetchCropStats().then((data) => {
      if (!mounted) return;
      const yields = (data?.stats ?? [])
        .filter((s) => s.cereal_yield_kg_ha)
        .map((s) => ({
          country: s.country,
          value: s.cereal_yield_kg_ha!.value,
        }));
      if (yields.length === 0) {
        setTopYield(null);
        setAvgYield(null);
      } else {
        const top = yields.reduce((a, b) => (b.value > a.value ? b : a));
        setTopYield(top);
        setAvgYield(
          Math.round(yields.reduce((sum, y) => sum + y.value, 0) / yields.length)
        );
      }
      setLoaded(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const fmt = (n: number | null) => (n === null ? "—" : n.toLocaleString());

  const kpis: MacroKPI[] = [
    {
      title: "Active Hazard Events",
      value: hazardCount === null ? null : String(hazardCount),
      subtext:
        hazardCount === null
          ? "EONET feed unavailable"
          : "Live NASA EONET over BRICS",
      icon: ShieldAlert,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      title: "Knowledge Corpus Docs",
      value: docCount === null ? null : String(docCount),
      subtext:
        docCount === null
          ? "RAG index unavailable"
          : "Indexed & searchable now",
      icon: Database,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Top BRICS Cereal Yield",
      value: topYield ? `${topYield.value.toLocaleString()}` : null,
      subtext: topYield
        ? `kg/ha · ${topYield.country} (WDI)`
        : loaded
        ? "WDI data unavailable"
        : "Loading…",
      icon: Sprout,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "BRICS Average Yield",
      value: avgYield === null ? null : `${avgYield.toLocaleString()}`,
      subtext:
        avgYield === null
          ? loaded
            ? "WDI data unavailable"
            : "Loading…"
          : "kg/ha mean across 9 nations",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const unavailable = kpi.value === null;

        return (
          <div
            key={index}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`p-3 rounded-full ${kpi.bg}`}>
              <Icon size={24} className={kpi.color} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-tight truncate">
                {kpi.title}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-2xl font-bold ${
                    unavailable ? "text-gray-400" : "text-gray-900"
                  }`}
                >
                  {kpi.value ?? "—"}
                </span>
              </div>
              <p
                className={`text-xs font-medium mt-0.5 ${
                  unavailable ? "text-amber-600" : "text-gray-500"
                }`}
              >
                {kpi.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
