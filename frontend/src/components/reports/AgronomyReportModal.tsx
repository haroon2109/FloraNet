"use client";

import React from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  QrCode,
  Award,
  Activity,
  Building2
} from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { useUILocale } from '@/lib/useUILocale';
import { fetchFarmMetrics } from '@/services/farmApi';
import Logo from '@/components/ui/Logo';

interface LiveFarmMetrics {
  overall_health_score?: number;
  soil?: { ph?: number; soc_percent?: number; texture_class?: string };
  soil_moisture_pct?: number | null;
  soil_temp_c?: number | null;
  ambient_temp_c?: number | null;
  active_alerts_count?: number;
  active_alerts?: Array<{ title: string; category: string; distance_km: number }>;
  sources?: string[];
}

/**
 * Agronomy Passport — a printable farm summary built ONLY from values the
 * platform can actually source:
 *   - Farmer / farm identity        → user's own registration data
 *   - Parcel count & audited area   → the registered field registry
 *   - Soil-health composite         → backend /farm/metrics (Open-Meteo +
 *                                     ISRIC SoilGrids + NASA EONET live)
 * There is deliberately NO insurance grade, credit rate, crop-insurance
 * language or cryptographic-signature claim — those would be fabricated
 * certifications FloraNet cannot issue.
 */
interface AgronomyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgronomyReportModal({ isOpen, onClose }: AgronomyReportModalProps) {
  const { userProfile, fields } = useFarm();
  // Printed/report dates follow the profile language chosen on the landing page.
  const locale = useUILocale();
  const [metrics, setMetrics] = React.useState<LiveFarmMetrics | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    fetchFarmMetrics().then((data) => {
      if (mounted) setMetrics(data as LiveFarmMetrics | null);
    });
    return () => { mounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const record = {
      '@context': 'https://schema.org/',
      '@type': 'Dataset',
      name: 'FloraNet Farm Agronomy Passport',
      producer: { '@type': 'Person', name: userProfile.fullName },
      location: userProfile.farmLocation,
      parcel_count: fields.length,
      live_metrics: metrics,
      generated_at: new Date().toISOString(),
      sources: ['Open-Meteo', 'ISRIC SoilGrids 2.0', 'NASA EONET'],
    };
    const dataStr = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'floranet_agronomy_passport.json');
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const totalArea = fields.reduce((acc, f) => acc + parseFloat(f.area || '0'), 0).toFixed(1);
  const areaUnit = userProfile.totalLandSize.includes('hectares') ? 'Hectares' : 'Acres';
  const healthScore = metrics?.overall_health_score;
  const soilPh = metrics?.soil?.ph;
  const soilSoc = metrics?.soil?.soc_percent;
  const moisture = metrics?.soil_moisture_pct;
  const alertsCount = metrics?.active_alerts_count;

  const fmt = (v: unknown, digits = 1, suffix = '') =>
    typeof v === 'number' ? `${v.toFixed(digits)}${suffix}` : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="bg-white rounded-[24px] w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-[#DCE6DE] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="print:hidden px-6 py-4 border-b border-[#EEF3EF] flex items-center justify-between bg-[#F8FAF8]">
          <div className="flex items-center gap-2">
            <Award className="text-[#075C32]" size={22} strokeWidth={2.2} />
            <h2 className="text-[17px] font-bold text-[#102A20]">
              Farm Agronomy Passport (Open Data Export)
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJson}
              className="px-4 py-2 bg-white hover:bg-[#F2F6F3] border border-[#D5E1D8] text-[#075C32] rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Download size={16} />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#075C32] hover:bg-[#064E2A] text-white rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Printer size={16} />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#55695F] hover:text-[#102A20] hover:bg-[#EAEFEA] rounded-xl transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 overflow-y-auto space-y-8 bg-white print:p-0 print:overflow-visible">

          {/* Passport Header Strip */}
          <div className="flex items-start justify-between border-b-2 border-[#075C32] pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 mb-2">
                <Logo className="w-8 h-8" />
                <span className="text-[13px] font-bold text-[#075C32] tracking-wider uppercase bg-[#EAF5EC] px-3 py-1 rounded-full border border-[#C4E7D0]">
                  DIGITAL PUBLIC GOOD · FARM SUMMARY
                </span>
              </div>
              <h1 className="text-[26px] sm:text-[30px] font-black text-[#102A20] tracking-tight">
                FARM AGRONOMY PASSPORT
              </h1>
              <p className="text-[13px] font-mono text-[#55695F]">
                Standard: JSON-LD / Schema.org Dataset • All metrics from cited open APIs
              </p>
            </div>

            {/* Passport ID & Verification Code */}
            <div className="text-right space-y-1">
              <div className="w-20 h-20 bg-[#F4FAF6] border border-[#C4E7D0] rounded-xl flex flex-col items-center justify-center p-1.5 ml-auto">
                <QrCode size={48} className="text-[#075C32]" />
                <span className="text-[8px] font-mono font-bold text-[#55695F]">OPEN DATA</span>
              </div>
              <p className="text-[11px] font-mono text-[#6A7E73]">
                ID: FLN-{new Date().getFullYear()}-{userProfile.country.slice(0, 2).toUpperCase()}
              </p>
              <p className="text-[11px] text-[#6A7E73]">{new Date().toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Section 1: Farmer & Land Parcel Registry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[#F9FCF9] border border-[#E1EAE3] rounded-2xl">
            <div>
              <span className="text-[11px] font-bold text-[#6D8177] uppercase block mb-0.5">Primary Producer</span>
              <span className="text-[15px] font-bold text-[#102A20]">{userProfile.fullName}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#6D8177] uppercase block mb-0.5">Holding Name</span>
              <span className="text-[15px] font-bold text-[#102A20]">{userProfile.farmName}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#6D8177] uppercase block mb-0.5">Location</span>
              <span className="text-[15px] font-bold text-[#102A20]">{userProfile.farmLocation}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#6D8177] uppercase block mb-0.5">Registered Parcels</span>
              <span className="text-[15px] font-bold text-[#102A20]">
                {fields.length > 0 ? `${fields.length} (${totalArea} ${areaUnit})` : 'None registered'}
              </span>
            </div>
          </div>

          {/* Section 2: Live Agronomic Telemetry (real sources only) */}
          <div className="space-y-4">
            <h3 className="text-[16px] font-bold text-[#102A20] flex items-center gap-2 border-b border-[#EEF3EF] pb-2">
              <Activity className="text-[#075C32]" size={18} />
              <span>Live Soil & Weather Telemetry</span>
            </h3>

            {metrics ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-[#D5E3D8] bg-white space-y-1">
                  <span className="text-[12px] font-semibold text-[#55695F]">Soil Health Composite</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[26px] font-black text-[#075C32]">{fmt(healthScore, 1)}<span className="text-[14px] text-[#55695F]">/100</span></span>
                  </div>
                  <p className="text-[11.5px] text-[#55695F]">Derived from live SoilGrids SOC & pH + Open-Meteo moisture</p>
                </div>

                <div className="p-4 rounded-xl border border-[#D5E3D8] bg-white space-y-1">
                  <span className="text-[12px] font-semibold text-[#55695F]">Soil Organic Carbon (0–5cm)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[26px] font-black text-[#102A20]">{fmt(soilSoc, 2, '%')}</span>
                  </div>
                  <p className="text-[11.5px] text-[#55695F]">pH {fmt(soilPh, 1)} · ISRIC SoilGrids 2.0 (CC-BY 4.0)</p>
                </div>

                <div className="p-4 rounded-xl border border-[#D5E3D8] bg-white space-y-1">
                  <span className="text-[12px] font-semibold text-[#55695F]">Topsoil Moisture</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[26px] font-black text-[#102A20]">{fmt(moisture, 1, '%')}</span>
                  </div>
                  <p className="text-[11.5px] text-[#55695F]">Open-Meteo 0–1cm layer · {alertsCount ?? '—'} active hazards within 500 km (NASA EONET)</p>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/60 text-[13px] text-[#92400E]">
                Live telemetry is currently unavailable — the backend could not be reached. No substitute
                figures are shown; please refresh once the connection is restored.
              </div>
            )}
          </div>

          {/* Section 3: Open Data Sources & Honest Scope */}
          <div className="p-5 bg-[#FAFDFB] border-2 border-[#C4E7D0] rounded-2xl">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="text-[#075C32] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[16px] font-bold text-[#102A20]">
                  Open Data Sources & Scope
                </h4>
                <p className="text-[13px] text-[#55695F] max-w-2xl mt-1">
                  Every value in this passport is traceable to a cited public source: Open-Meteo (CC-BY 4.0),
                  ISRIC SoilGrids 2.0 (CC-BY 4.0) and NASA EONET (public domain). Figures that require
                  on-farm instruments or laboratory assays — insurance grades, credit ratings, chemical
                  residues — are deliberately omitted rather than estimated.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#EEF3EF] pt-6 flex flex-wrap items-center justify-between gap-4 text-[11.5px] text-[#7C8E84]">
            <div className="flex items-center gap-2">
              <Building2 size={16} />
              <span>FloraNet · Open-source Digital Public Good · BRICS Agronomy Network</span>
            </div>
            <div className="font-mono">
              Generated {new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
