"use client";

import React, { useEffect, useState } from 'react';
import {
  Satellite,
  Droplets,
  CheckCircle2,
  RefreshCw,
  Radio,
  AlertTriangle,
  Database,
} from 'lucide-react';
import {
  fetchSentinel2Scene,
  fetchLiveSoil,
  fetchStacScenes,
  fetchEra5SoilProfile,
  fetchDiagnosisGrounding,
  StacScene,
  Era5SoilProfile,
  PlantVillageGrounding,
} from '@/services/farmApi';
import { useUILocale } from '@/lib/useUILocale';

export interface ScanStep {
  id: number;
  title: string;
  category: string;
  detail: string;
  metric: string;
  status: 'pending' | 'ok' | 'gap';
}

/**
 * Satellite Scan Pipeline — REAL data only.
 *  Step 1: latest Copernicus Sentinel-2 L2A scene over the farm (real metadata).
 *  Step 2: live Open-Meteo soil moisture/temperature (real telemetry).
 *  Step 3: ISRIC SoilGrids soil properties (real; may be a data gap).
 *  Step 4: Copernicus STAC search — open Sentinel-2 scenes with per-band COG
 *          assets, red-edge bands flagged (NDRE data availability).
 *  Step 5: ERA5-Land multi-depth soil profile (0–7cm / 7–28cm) from the
 *          Open-Meteo Archive API.
 * Pixel-level index math (NDVI/NDRE) is NOT fabricated — band assets are
 * listed openly, but FloraNet does not pretend to have computed pixel values
 * it has not read.
 */
export default function SatelliteScanPipeline({
  fieldId = 'Registered Farm Location',
  lat = 18.5204,
  lng = 73.8567,
  onScanComplete,
}: {
  fieldId?: string;
  lat?: number;
  lng?: number;
  onScanComplete?: () => void;
}) {
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanProgress, setScanProgress] = useState<number>(0);

  const [scene, setScene] = useState<{ scene_id: string; sensing_time: string; tile: string } | null>(null);
  const [live, setLive] = useState<{
    layers?: Record<string, { moisture_pct?: number | null; temp_c?: number | null }>;
    soilgrids?: { soc_percent?: number | null; ph?: number | null; data_gap?: boolean };
  } | null>(null);
  const [stacScenes, setStacScenes] = useState<StacScene[] | null>(null);
  const [era5, setEra5] = useState<Era5SoilProfile | null>(null);
  const [grounding, setGrounding] = useState<PlantVillageGrounding | null>(null);
  const [done, setDone] = useState(false);
  // Scene dates render in the farmer's chosen language.
  const locale = useUILocale();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [s2, soil, stac, profile, pv] = await Promise.all([
        fetchSentinel2Scene(lat, lng),
        fetchLiveSoil(lat, lng),
        fetchStacScenes(lat, lng, 21),
        fetchEra5SoilProfile(lat, lng, 7),
        fetchDiagnosisGrounding(),
      ]);
      if (!mounted) return;
      setScene(s2?.scene ?? null);
      setLive(soil);
      setStacScenes(stac?.scenes ?? null);
      setEra5(profile);
      setGrounding(pv);
      setDone(true);
      if (onScanComplete) onScanComplete();
    })();
    return () => { mounted = false; };
  }, [lat, lng, onScanComplete]);

  // Progress animation independent of data arrival
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          setIsScanning(false);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isScanning]);

  const moist = live?.layers?.['0_1cm']?.moisture_pct;
  const soilTemp = live?.layers?.['0_1cm']?.temp_c;
  const sg = live?.soilgrids || {};
  const soc = sg.soc_percent;
  const ph = sg.ph;

  const m07 = era5?.bands?.['0_7cm']?.soil_moisture_m3m3;
  const m728 = era5?.bands?.['7_28cm']?.soil_moisture_m3m3;
  const t728 = era5?.bands?.['7_28cm']?.soil_temp_c;

  const clearScenes = (stacScenes || []).filter((s) => (s.cloud_cover_pct ?? 100) < 40);
  const ndreReady = (stacScenes || []).some((s) => s.ndre_data_available);

  const steps: ScanStep[] = [
    {
      id: 1,
      title: 'Sentinel-2 Scene Acquisition',
      category: 'Copernicus Catalogue',
      detail: 'Querying the Copernicus Data Space catalogue for the latest real L2A acquisition covering the farm.',
      metric: scene ? `Scene ${scene.tile} · ${new Date(scene.sensing_time).toLocaleDateString(locale)}` : (done ? 'No scene metadata available' : 'Querying…'),
      status: scene ? 'ok' : done ? 'gap' : 'pending',
    },
    {
      id: 2,
      title: 'Soil Moisture & Thermal Profiling',
      category: 'Open-Meteo Live',
      detail: 'Live volumetric water content (0–1cm) and soil temperature from the Open-Meteo forecast model.',
      metric: moist != null ? `VWC ${moist}% · Soil Temp ${soilTemp ?? '—'}°C` : (done ? 'Live feed unavailable' : 'Fetching…'),
      status: moist != null ? 'ok' : done ? 'gap' : 'pending',
    },
    {
      id: 3,
      title: 'SoilGrids Properties',
      category: 'ISRIC Soil Intelligence',
      detail: 'Real SOC, pH and texture from the ISRIC SoilGrids 2.0 modeled soil property service.',
      metric: soc != null ? `SOC ${soc}% · pH ${ph ?? '—'}` : (done ? (sg.data_gap ? 'SoilGrids gap at this cell' : 'No SoilGrids values') : 'Fetching…'),
      status: soc != null ? 'ok' : done ? 'gap' : 'pending',
    },
    {
      id: 4,
      title: 'STAC Scene Search — Multi-spectral Assets',
      category: 'Copernicus STAC API (open)',
      detail: 'Open keyless search for Sentinel-2 L2A scenes with per-band COG assets; red-edge bands (B05–B8A) required for NDRE are flagged.',
      metric: stacScenes && stacScenes.length > 0
        ? `${stacScenes.length} scenes · ${clearScenes.length} under 40% cloud · NDRE bands ${ndreReady ? 'present' : 'absent'}`
        : (done ? 'No open scenes in the window' : 'Searching…'),
      status: stacScenes && stacScenes.length > 0 ? 'ok' : done ? 'gap' : 'pending',
    },
    {
      id: 5,
      title: 'Multi-Depth Soil Profile (ERA5-Land)',
      category: 'Open-Meteo Archive',
      detail: 'Reanalysis volumetric moisture for the canonical 0–7cm and 7–28cm bands, averaged over the last 7 days of hourly observations.',
      metric: m07 != null
        ? `0–7cm ${m07} m³/m³ · 7–28cm ${m728 ?? '—'} m³/m³${t728 != null ? ` · ${t728}°C` : ''}`
        : (done ? 'Archive unavailable' : 'Fetching…'),
      status: m07 != null ? 'ok' : done ? 'gap' : 'pending',
    },
    {
      id: 6,
      title: 'NDVI / NDRE Index Computation',
      category: 'Band Math — not simulated',
      detail: 'The STAC assets above contain the open bands needed for NDVI/NDRE, but per-pixel index values require reading the COG rasters. FloraNet lists the data honestly instead of inventing an index.',
      metric: done ? (ndreReady ? 'Band assets available (open COGs) — pixel math not performed' : 'No usable band assets in window') : 'Pending…',
      status: done ? 'gap' : 'pending',
    },
  ];

  return (
    <div className="w-full bg-white border border-[#E1E8E4] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">

      {/* Top Header & Refresh Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#F0F4F1]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#075C32] text-white flex items-center justify-center shadow-xs shrink-0">
            <Satellite size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-[#102A20]">
                Satellite Field Diagnostics
              </h3>
              <span className="bg-[#E8F5EB] text-[#075C32] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#CDE5D5] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#168A45] animate-ping" />
                Real Sources
              </span>
            </div>
            <p className="text-[12px] text-[#55695F] mt-0.5">
              Live Copernicus, Open-Meteo & ISRIC pipeline for {fieldId}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all shadow-xs bg-[#075C32] hover:bg-[#064E2A] text-white hover:shadow-md cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>Refresh Live Scan</span>
        </button>
      </div>

      {/* HUD strip */}
      <div className="bg-[#0E1E16] rounded-xl p-4 mb-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-[#78E69E] animate-pulse" />
            <span className="text-[12px] font-semibold text-white/90">
              {isScanning ? 'Querying live data sources…' : done ? 'Scan complete — live values below' : 'Standby'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-emerald-200">
            <span>LAT {lat.toFixed(3)}°</span>
            <span>LNG {lng.toFixed(3)}°</span>
            <span>{scanProgress}%</span>
          </div>
        </div>
        <div className="mt-2.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#78E69E] rounded-full transition-all duration-100" style={{ width: `${scanProgress}%` }} />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2.5">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
              step.status === 'ok'
                ? 'bg-[#FAFCFA] border-[#DCE8DF]'
                : step.status === 'gap'
                ? 'bg-amber-50/60 border-amber-200'
                : 'bg-white border-[#EAEFEA] opacity-70'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold ${
              step.status === 'ok'
                ? 'bg-[#EAF6EE] text-[#075C32]'
                : step.status === 'gap'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-[#EEF2EF] text-[#7C8E84]'
            }`}>
              {step.status === 'ok' ? <CheckCircle2 size={15} /> : step.status === 'gap' ? <AlertTriangle size={13} /> : step.id}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6A7E74]">
                  {step.category}
                </span>
                <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                  step.status === 'ok'
                    ? 'bg-[#EAF6EE] text-[#075C32]'
                    : step.status === 'gap'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-[#EEF2EF] text-[#7C8E84]'
                }`}>
                  {step.status === 'ok' ? 'Live' : step.status === 'gap' ? 'Data gap — honest' : 'Fetching'}
                </span>
              </div>

              <h5 className="text-[13px] font-bold text-[#102A20] leading-tight">{step.title}</h5>
              <p className="text-[11px] text-[#55695F] leading-snug mt-0.5">{step.detail}</p>

              <div className="mt-1 text-[10.5px] font-semibold text-[#075C32] flex items-center gap-1">
                <Droplets size={11} />
                <span>Result:</span>
                <span className="font-bold text-[#102A20]">{step.metric}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PlantVillage grounding footer — live open-dataset provenance */}
      {grounding?.dataset && (
        <div className="mt-4 bg-[#F8FAF8] border border-[#E2ECE5] rounded-xl p-3.5 flex items-start gap-3">
          <Database size={15} className="text-[#075C32] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-bold text-[#102A20]">
                Diagnostic vocabulary grounded in {grounding.dataset.name}
              </span>
              {grounding.dataset.available ? (
                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-[#EAF6EE] text-[#075C32] border border-[#CDE5D5]">
                  repo verified · ★{grounding.dataset.stars}
                </span>
              ) : (
                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                  repo check unavailable
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#55695F] leading-snug mt-1">
              {grounding.dataset.image_count.toLocaleString()} open leaf images · {grounding.dataset.crop_species} crops ·{' '}
              {grounding.dataset.class_labels} classes ({grounding.dataset.citation}). The local vision model&apos;s
              labels are cross-checked against this open benchmark — no private evaluation set is claimed.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
