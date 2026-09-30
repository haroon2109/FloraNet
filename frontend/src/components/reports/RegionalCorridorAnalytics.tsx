"use client";

import React, { useEffect, useState } from 'react';
import { 
  Globe, 
  Download, 
  Radio, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Sprout, 
  Database,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  FileJson,
  Copy,
  CheckCircle2,
  X
} from 'lucide-react';
import TransboundaryAlertBanner from '@/components/analytics/TransboundaryAlertBanner';
import MacroKPIStrip from '@/components/analytics/MacroKPIStrip';
import OutbreakPredictionChart from '@/components/analytics/OutbreakPredictionChart';
import MapViewer from '@/components/map/MapViewer';
import { useToast } from '@/context/toastContext';
import { fetchCropStats, fetchOutbreakEvents } from '@/services/farmApi';

export default function RegionalCorridorAnalytics() {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [exportData, setExportData] = useState<{
    cropStats: Record<string, unknown> | null;
    outbreaks: Array<Record<string, unknown>> | null;
  } | null>(null);
  const { showToast } = useToast();

  // The exported JSON-LD embeds REAL data fetched from the backend: World Bank
  // WDI crop statistics and live NASA EONET hazard events. If either source is
  // unreachable the export says so explicitly instead of pointing at a
  // fabricated URL or inventing values.
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

  const hasExportData = !!(
    exportData &&
    (exportData.cropStats || (exportData.outbreaks && exportData.outbreaks.length > 0))
  );

  const jsonLdSchema = {
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
    ...(exportData?.cropStats
      ? {
          "variableMeasured": [
            {
              "@type": "PropertyValue",
              "name": "World Bank WDI cereal yield & fertilizer intensity by BRICS nation",
              "value": JSON.stringify(exportData.cropStats)
            }
          ]
        }
      : {}),
    ...(exportData?.outbreaks && exportData.outbreaks.length > 0
      ? {
          "about": exportData.outbreaks.map((e) => ({
            "@type": "Event",
            "name": String(e.pest_name ?? "Hazard event"),
            "eventStatus": "https://schema.org/EventScheduled",
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
    "temporalCoverage": new Date().toISOString(),
    ...(hasExportData
      ? {}
      : {
          "note":
            "Live data sources were unreachable when this export was generated — no figures are included rather than substituting estimates."
        })
  };

  const jsonString = JSON.stringify(jsonLdSchema, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    showToast("DPG JSON-LD copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/ld+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `floranet_agrin_schema_${new Date().getTime()}.jsonld`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded .jsonld verifiable credential", "success");
  };

  return (
    <div className="w-full bg-white border border-[#E1E8E4] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6 transition-all">
      
      {/* Top Header & Accordion Trigger */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 bg-gradient-to-r from-[#F4FAF6] via-[#FAFCFA] to-white flex items-center justify-between cursor-pointer border-b border-[#E8EFEA] hover:bg-[#EEF7F1] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#075C32] text-white flex items-center justify-center shadow-xs shrink-0">
            <Globe size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16.5px] font-bold text-[#102A20]">
                BRICS Regional Corroboration & Transboundary Vectors
              </h3>
              <span className="bg-[#E8F5EB] text-[#075C32] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#CDE5D5] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#168A45] animate-ping" />
                AgriN DPG Hub
              </span>
            </div>
            <p className="text-[12px] text-[#55695F] mt-0.5">
              Cross-border outbreak predictions, bio-corridor migrations, and federated policy telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowJsonModal(true);
            }}
            className="hidden sm:flex items-center gap-1.5 bg-white hover:bg-[#F2F7F4] text-[#075C32] border border-[#CCE3D3] px-3 py-1.5 rounded-xl text-[12px] font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <FileJson size={14} />
            <span>Export DPG JSON-LD</span>
          </button>

          <button 
            type="button"
            className="p-1 rounded-lg text-[#61756B] hover:text-[#102A20] cursor-pointer"
            aria-label="Toggle corridor analytics"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Predictive Transboundary Outbreak Alert Banner */}
          <TransboundaryAlertBanner />

          {/* Macro Policy KPI Strip */}
          <MacroKPIStrip />            {/* Dual Grid: Corroboration Map & Prediction Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Global Corroboration Map (7 cols) */}
            <div className="lg:col-span-7 bg-[#FAFCFA] border border-[#E3ECE6] rounded-xl overflow-hidden flex flex-col h-[420px] shadow-xs">
              <div className="p-3.5 bg-white border-b border-[#E3ECE6] flex items-center justify-between">
                <div>
                  <h4 className="text-[14px] font-bold text-[#102A20]">
                    Global Corroboration Map
                  </h4>
                  <p className="text-[11.5px] text-[#607469]">
                    Transboundary pest vectors & bio-corridors across BRICS agro-ecological zones
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#075C32] bg-[#E8F5EB] px-2 py-0.5 rounded border border-[#CDE5D5]">
                  Live Federated Layer
                </span>
              </div>

              <div className="flex-1 w-full h-full relative">
                <MapViewer />
              </div>
            </div>

            {/* Outbreak Prediction Chart (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-[#E3ECE6] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <OutbreakPredictionChart />
            </div>

          </div>

        </div>
      )}

      {/* DPG Schema.org JSON-LD Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs" 
            onClick={() => setShowJsonModal(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#D5E5D8] overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-[#EEF2EF] flex items-center justify-between bg-[#FAFCFA]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EAF5EC] text-[#075C32] flex items-center justify-center">
                  <FileJson size={18} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#102A20]">
                    DPG AgriN Verifiable Credential (.jsonld)
                  </h3>
                  <p className="text-[11.5px] text-[#607469]">
                    Schema.org interoperable agricultural dataset standard
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="p-1.5 text-[#7F9489] hover:text-[#102A20] rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-[#102A20] text-emerald-300 font-mono text-[12px] leading-relaxed">
              <pre className="whitespace-pre-wrap">{jsonString}</pre>
            </div>

            <div className="p-4 bg-[#FAFCFA] border-t border-[#EEF2EF] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D5E5D8] text-[#102A20] hover:bg-[#F5F9F6] text-[12.5px] font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                {copied ? <CheckCircle2 size={15} className="text-[#075C32]" /> : <Copy size={15} />}
                <span>{copied ? "Copied to Clipboard" : "Copy Schema"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-[#075C32] hover:bg-[#054324] text-white text-[12.5px] font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <Download size={15} />
                <span>Download .jsonld</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
