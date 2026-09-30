"use client";

import React, { useEffect, useState } from "react";
import {
  Satellite, TrendingDown, TrendingUp, Activity, Droplets,
  AlertTriangle, AlertCircle, Loader2, Info, ShieldCheck, RefreshCw,
} from "lucide-react";
import {
  fetchGeospatialTelemetry,
  fetchMicroclimateAlerts,
  GeospatialTelemetry,
  SatelliteSeries,
  MicroclimateAlertData,
} from "@/services/farmApi";
import { useFarm } from "@/context/farmContext";

/**
 * Geospatial Soil Health panel — real satellite telemetry.
 *
 * NDVI / EVI / SMAP root-zone moisture are derived on the backend by
 * inverting official NASA GIBS colormaps (public domain). The Soil
 * Degradation Index is a deterministic screening heuristic over those real
 * inputs and is labeled as such. Missing feeds render explicit "unavailable"
 * states — never substitute values.
 */

interface SeriesCardProps {
  title: string;
  subtitle: string;
  series?: SatelliteSeries;
  format: (v: number) => string;
  goodRange?: string;
}

function SeriesCard({ title, subtitle, series, format, goodRange }: SeriesCardProps) {
  const [open, setOpen] = useState(false);
  if (!series) {
    return (
      <div className="bg-white border border-[#E1E8E4] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Satellite size={14} className="text-[#6A7E74]" />
          <span className="text-[13px] font-bold text-[#102A20]">{title}</span>
        </div>
        <p className="text-[11.5px] text-[#889B91] mt-2">
          Satellite feed unavailable for this location — no substitute values are shown.
        </p>
      </div>
    );
  }
  const up = series.trend_per_period >= 0;
  const TrendIcon = up ? TrendingUp : TrendingDown;
  const trendColor = up ? "text-[#075C32]" : "text-[#C2410C]";

  return (
    <div className="bg-white border border-[#E1E8E4] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Satellite size={14} className="text-[#075C32]" />
          <span className="text-[13px] font-bold text-[#102A20]">{title}</span>
        </div>
        <button type="button" onClick={() => setOpen(!open)} className="text-[10.5px] font-semibold text-[#607469] hover:text-[#075C32]">
          {open ? "Hide history" : "History"}
        </button>
      </div>
      <p className="text-[10.5px] text-[#607469]">{subtitle}</p>

      <div className="flex items-end gap-3 mt-2">
        <span className="text-[26px] font-extrabold text-[#075C32] leading-none">{format(series.mean)}</span>
        <div className="flex flex-col pb-0.5">
          <span className={`text-[11px] font-bold flex items-center gap-1 ${trendColor}`}>
            <TrendIcon size={12} />
            {up ? "+" : ""}{series.trend_per_period}/period
          </span>
          <span className="text-[9.5px] text-[#889B91]">
            {series.anchor_date} · {series.samples_resolved}/{series.samples_requested} samples
          </span>
        </div>
      </div>
      {goodRange && (
        <p className="text-[10px] text-[#6A7E74] mt-1.5">Reference band: {goodRange}</p>
      )}

      {open && (
        <div className="mt-3 space-y-1">
          {series.series.map((pt) => (
            <div key={pt.date} className="flex items-center justify-between text-[10.5px]">
              <span className="text-[#607469]">{pt.date}</span>
              <span className={pt.value != null ? "font-bold text-[#102A20]" : "text-[#889B91]"}>
                {pt.value != null ? format(pt.value) : "no imagery"}
              </span>
            </div>
          ))}
          <p className="text-[9.5px] text-[#889B91] pt-1 leading-snug">{series.source}</p>
        </div>
      )}
    </div>
  );
}

export default function GeospatialSoilPlanner() {
  const { userProfile } = useFarm();
  const coords = userProfile.defaultCoordinates;

  const [telemetry, setTelemetry] = useState<GeospatialTelemetry | null>(null);
  const [telState, setTelState] = useState<"loading" | "live" | "unavailable">("loading");
  const [alerts, setAlerts] = useState<MicroclimateAlertData[] | null>(null);
  const [alertNote, setAlertNote] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<"loading" | "live" | "unavailable">("loading");

  useEffect(() => {
    let mounted = true;
    fetchGeospatialTelemetry(coords.lat, coords.lng, 8).then((data) => {
      if (!mounted) return;
      if (data) {
        setTelemetry(data);
        setTelState("live");
      } else {
        setTelState("unavailable");
      }
    });
    fetchMicroclimateAlerts(coords.lat, coords.lng).then((data) => {
      if (!mounted) return;
      if (data) {
        setAlerts(data.alerts);
        setAlertNote(data.no_alerts_note);
        setAlertState("live");
      } else {
        setAlertState("unavailable");
      }
    });
    return () => { mounted = false; };
  }, [coords.lat, coords.lng]);

  const sdi = telemetry?.soil_degradation;
  const sdiPct = sdi ? Math.round(sdi.soil_degradation_index * 100) : null;
  const sdiColor =
    sdiPct == null ? "#889B91" : sdiPct > 70 ? "#E84A3C" : sdiPct > 40 ? "#D97706" : "#168A45";

  return (
    <div className="space-y-6">
      {/* ── Satellite Field Telemetry ── */}
      <div className="bg-white border border-[#E1E8E4] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Satellite size={16} className="text-[#075C32]" />
              <h3 className="text-[16px] font-bold text-[#102A20]">Satellite Field Telemetry</h3>
            </div>
            <p className="text-[11.5px] text-[#607469] mt-0.5">
              MODIS NDVI/EVI + SMAP root-zone moisture at {coords.lat.toFixed(2)}, {coords.lng.toFixed(2)} — NASA GIBS, colormap-inverted
            </p>
          </div>
          {telState === "live" && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-[11px] font-semibold text-[#607469] hover:text-[#075C32] flex items-center gap-1 shrink-0"
            >
              <RefreshCw size={11} /> Refresh
            </button>
          )}
        </div>

        {telState === "loading" && (
          <div className="p-6 text-center">
            <Loader2 size={20} className="mx-auto text-[#075C32] animate-spin mb-2" />
            <p className="text-[12px] font-semibold text-[#4A5E53]">Fetching real satellite imagery…</p>
          </div>
        )}

        {telState === "unavailable" && (
          <div className="bg-[#FFF8EF] border border-[#F3E3C3] rounded-xl p-5 text-center">
            <AlertCircle size={20} className="mx-auto text-amber-600 mb-2" />
            <p className="text-[13px] font-bold text-[#102A20]">Satellite telemetry unavailable</p>
            <p className="text-[12px] text-[#607469] mt-1">NASA GIBS could not be reached — no substitute indices are shown.</p>
          </div>
        )}

        {telState === "live" && telemetry && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SeriesCard
                title="NDVI — Crop Vigor"
                subtitle="MODIS/Terra 8-day (250 m)"
                series={telemetry.vegetation.ndvi}
                format={(v) => v.toFixed(3)}
                goodRange="healthy canopy 0.4 – 0.85"
              />
              <SeriesCard
                title="EVI — Chlorophyll / N Proxy"
                subtitle="MODIS/Terra 16-day (1 km)"
                series={telemetry.vegetation.evi}
                format={(v) => v.toFixed(3)}
                goodRange="active growth 0.2 – 0.6"
              />
              <SeriesCard
                title="Root-Zone Moisture"
                subtitle="SMAP L4 (9 km), m³/m³"
                series={telemetry.moisture.smap_root_zone ?? undefined}
                format={(v) => v.toFixed(3)}
                goodRange="field capacity ~0.30 – 0.45"
              />
            </div>

            {/* Soil Degradation Index */}
            {sdi && (
              <div className="mt-4 bg-[#F8FAF8] border border-[#E2ECE5] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-[#075C32]" />
                    <span className="text-[13px] font-bold text-[#102A20]">Soil Degradation Index (baseline)</span>
                  </div>
                  <span className="text-[15px] font-extrabold" style={{ color: sdiColor }}>
                    {sdiPct}% · {sdi.band}
                  </span>
                </div>
                <div className="w-full bg-[#E1E8E4] rounded-full h-2.5">
                  <div className="h-2.5 rounded-full transition-all" style={{ width: `${sdiPct ?? 0}%`, backgroundColor: sdiColor }} />
                </div>
                <p className="text-[10.5px] text-[#6A7E74] mt-2 leading-snug">{sdi.scale}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                  {Object.entries(sdi.components).map(([key, comp]) => (
                    <div key={key} className="bg-white border border-[#E3ECE6] rounded-lg p-2.5">
                      <span className="text-[10px] font-bold text-[#6A7E74] uppercase tracking-wide block">
                        {key === "ndvi" ? "Vigor (NDVI)" : key === "smap_moisture" ? "Moisture (SMAP)" : "Organic Carbon"}
                      </span>
                      {"available" in comp && comp.available === false ? (
                        <span className="text-[11.5px] font-semibold text-[#889B91]">Not available</span>
                      ) : (
                        <span className="text-[12px] font-bold text-[#102A20]">
                          {key === "smap_moisture"
                            ? `${comp.mean_m3m3} m³/m³`
                            : key === "soc"
                            ? `${comp.soc_percent}% SOC`
                            : `NDVI ${comp.mean}`} · weight {comp.weight}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {telemetry.errors && (
              <div className="mt-3 flex items-start gap-1.5">
                <Info size={11} className="text-[#6A7E74] mt-0.5 shrink-0" />
                <p className="text-[10.5px] text-[#6A7E74] leading-snug">
                  Partial data: {Object.keys(telemetry.errors).join(", ")} unavailable at fetch time — shown honestly rather than filled.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Hyper-Local Microclimate Alerts ── */}
      <div className="bg-white border border-[#E1E8E4] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)]">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#D97706]" />
            <h3 className="text-[16px] font-bold text-[#102A20]">Hyper-Local Microclimate Alerts</h3>
          </div>
          <p className="text-[11.5px] text-[#607469] mt-0.5">
            Real 7-day forecast × live soil conditions → prep steps before heat, frost or downpours
          </p>
        </div>

        {alertState === "loading" && (
          <div className="p-6 text-center">
            <Loader2 size={20} className="mx-auto text-[#075C32] animate-spin mb-2" />
            <p className="text-[12px] font-semibold text-[#4A5E53]">Checking the live forecast…</p>
          </div>
        )}

        {alertState === "unavailable" && (
          <div className="bg-[#FFF8EF] border border-[#F3E3C3] rounded-xl p-5 text-center">
            <AlertCircle size={20} className="mx-auto text-amber-600 mb-2" />
            <p className="text-[13px] font-bold text-[#102A20]">Forecast unavailable</p>
            <p className="text-[12px] text-[#607469] mt-1">Open-Meteo could not be reached — no alerts can be derived.</p>
          </div>
        )}

        {alertState === "live" && alerts && alerts.length === 0 && (
          <div className="bg-[#F4FAF6] border border-[#CDE5D4] rounded-xl p-4 flex items-start gap-2">
            <ShieldCheck size={16} className="text-[#075C32] mt-0.5 shrink-0" />
            <p className="text-[12.5px] text-[#1E4D30] font-medium">{alertNote || "No weather triggers in the 7-day forecast."}</p>
          </div>
        )}

        {alertState === "live" && alerts && alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((a, i) => {
              const sev = a.severity.toLowerCase();
              const style =
                sev === "high"
                  ? "bg-[#FEF2F0] border-[#F5C6C0] text-[#8C2B20]"
                  : sev === "medium"
                  ? "bg-[#FEF9EC] border-[#F3E3C3] text-[#854D0E]"
                  : "bg-[#EFF5FB] border-[#D0E2FB] text-[#1A5FB8]";
              return (
                <div key={i} className={`rounded-xl border p-4 ${style}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[13.5px] font-bold">{a.alert_type}</span>
                    <div className="flex items-center gap-2">
                      {a.trigger_value && (
                        <span className="text-[10.5px] font-bold bg-white/70 px-2 py-0.5 rounded">{a.trigger_value}</span>
                      )}
                      {a.window && (
                        <span className="text-[10.5px] font-semibold bg-white/70 px-2 py-0.5 rounded">{a.window}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-[10.5px] font-bold uppercase tracking-wider opacity-75 mb-1">Prep steps</p>
                  <ul className="list-disc list-inside space-y-1 text-[12px]">
                    {a.actionable_prep_steps.map((s, j) => (
                      <li key={j}>{s}</li>
                    ))}
                  </ul>
                  {a.soil_context && (
                    <p className="text-[10.5px] mt-2 opacity-80 flex items-center gap-1">
                      <Droplets size={10} /> {a.soil_context}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
