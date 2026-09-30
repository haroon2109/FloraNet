"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Globe, Download, Loader2 } from "lucide-react";
import { useToast } from "@/context/toastContext";
import { fetchCropStats, fetchOutbreakEvents } from "@/services/farmApi";
import MacroKPIStrip from "@/components/analytics/MacroKPIStrip";
import OutbreakPredictionChart from "@/components/analytics/OutbreakPredictionChart";
import TransboundaryAlertBanner from "@/components/analytics/TransboundaryAlertBanner";
import SoilNutritionRadar from "@/components/analytics/SoilNutritionRadar";
import MonteCarloYieldDistribution from "@/components/analytics/MonteCarloYieldDistribution";
import MapViewer from "@/components/map/MapViewer";export default function AnalyticsConsolePage() {
  const { showToast } = useToast();
  const [exportData, setExportData] = useState<{
    cropStats: Record<string, unknown> | null;
    outbreaks: Array<Record<string, unknown>> | null;
  } | null>(null);
  const [exporting, setExporting] = useState(false);

  // Export embeds REAL data fetched from the backend: World Bank WDI crop
  // statistics and live NASA EONET hazard events. No fabricated URLs or
  // invented values — when a source is unreachable the export says so.
  useEffect(() => {
    let mounted = true;
    Promise.all([fetchCropStats(), fetchOutbreakEvents()]).then(
      ([cropStats, outbreaks]) => {
        if (!mounted) return;
        setExportData({
          cropStats: cropStats as Record<string, unknown> | null,
          outbreaks: (outbreaks?.data ?? null) as Array<Record<string, unknown>> | null,
        });
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  const handleExportData = () => {
    if (!exportData) {
      showToast(
        "Live data still loading — try the export again in a moment.",
        "info"
      );
      return;
    }
    const hasData =
      exportData.cropStats ||
      (exportData.outbreaks && exportData.outbreaks.length > 0);
    if (!hasData) {
      showToast(
        "Export unavailable: live data sources (World Bank / NASA EONET) could not be reached. No substitute figures are exported.",
        "error",
        undefined,
        6000
      );
      return;
    }
    setExporting(true);

    const jsonLdSchema: Record<string, unknown> = {
      "@context": "https://schema.org/",
      "@type": "Dataset",
      "name": "FloraNet BRICS Live Agricultural Dataset",
      "description":
        "Real national crop statistics (World Bank WDI, CC-BY 4.0) and live NASA EONET natural-hazard events across the five BRICS nations, served by the FloraNet DPG node.",
      "creator": {
        "@type": "Organization",
        "name": "FloraNet DPG Node"
      },
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "isAccessibleForFree": true,
      ...(exportData.cropStats
        ? {
            "variableMeasured": [
              {
                "@type": "PropertyValue",
                "name":
                  "World Bank WDI cereal yield & fertilizer intensity by BRICS nation",
                "value": JSON.stringify(exportData.cropStats)
              }
            ]
          }
        : {}),
      ...(exportData.outbreaks && exportData.outbreaks.length > 0
        ? {
            "about": exportData.outbreaks.map((e) => ({
              "@type": "Event",
              "name": String(e.pest_name ?? "Hazard event"),
              "location": {
                "@type": "Place",
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": e.latitude,
                  "longitude": e.longitude
                }
              }
            }))
          }
        : {}),
      "spatialCoverage": ["India", "Brazil", "South Africa", "Russia", "China", "Egypt", "Ethiopia", "Iran", "UAE"],
      "temporalCoverage": new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(jsonLdSchema, null, 2)], { type: "application/ld+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `floranet_brics_live_${new Date().getTime()}.jsonld`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExporting(false);
    showToast("Exported live BRICS dataset as JSON-LD", "success");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-10">
      {/* Console Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <Globe className="text-[#78E69E]" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">BRICS AgriN Policy & Research Console</h1>
            <p className="text-xs text-slate-400 font-medium">Desktop View • Transboundary Outbreak & Bio-Corridor Dashboard</p>
          </div>
        </div>
        
        <button 
          onClick={handleExportData}
          disabled={exporting}
          className="flex items-center gap-2 bg-[#075C32] hover:bg-[#064E2A] px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          Export Global JSON-LD
        </button>
      </header>

      {/* Global Navigation - Desktop Optimized */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto flex overflow-x-auto whitespace-nowrap hide-scrollbar px-6">
          <Link href="/" className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Diagnose Desk
          </Link>
          <Link href="/planner" className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Rotation Planner
          </Link>
          <Link href="/field-health" className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Field Intelligence
          </Link>
          <Link href="/analytics" className="px-6 py-4 text-sm font-bold text-[#075C32] border-b-2 border-[#075C32]">
            Analytics Console
          </Link>
          <Link href="/interop" className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            DPG Hub
          </Link>
          <Link href="/seed-network" className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Seed Network
          </Link>
          <Link href="/seed-finder" className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Seed Finder
          </Link>
        </div>
      </div>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col mt-4 space-y-6">
        
        {/* Predictive Alert Broadcast */}
        <TransboundaryAlertBanner />

        {/* KPI Strip */}
        <MacroKPIStrip />

        {/* 6-Axis Soil Nutrition Radar Matrix & Monte Carlo Yield Distribution */}
        <div className="grid grid-cols-1 gap-6">
          <SoilNutritionRadar cropName="BRICS Agro-Corridor (Maize & Cereals)" />
          <MonteCarloYieldDistribution cropName="BRICS Regional Agro-Corridor" />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
          
          {/* Left: Global Corroboration Map */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-slate-50">
              <h3 className="font-bold text-gray-800 text-lg">Global Corroboration Map</h3>
              <p className="text-xs text-gray-500">Transboundary pest migrations across agro-climatic corridors.</p>
            </div>
            <div className="flex-1 w-full h-full relative z-0">
              <div className="absolute inset-0">
                <MapViewer />
              </div>
            </div>
          </div>

          {/* Right: Outbreak Prediction Chart */}
          <div className="h-full">
            <OutbreakPredictionChart />
          </div>

        </div>

      </main>
    </div>
  );
}
