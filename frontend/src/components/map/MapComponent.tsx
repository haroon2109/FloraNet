"use client";

import { Fragment, useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from "react-leaflet";
import { Wind, ShieldAlert, Cpu, CloudRain, Flame, Waves, Mountain, Zap } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { getApiBaseUrl } from "@/lib/apiConfig";

interface HazardEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  lat: number;
  lng: number;
  severity: string;
  origin_country: string;
  vector_direction: string;
}

const SEVERITY_COLORS: Record<string, { fill: string; stroke: string }> = {
  critical: { fill: "#ef4444", stroke: "#991b1b" },
  high: { fill: "#f97316", stroke: "#c2410c" },
  medium: { fill: "#eab308", stroke: "#a16207" },
  low: { fill: "#84cc16", stroke: "#4d7c0f" },
};

// Marker radius doubles as the "heat" intensity: hotter severities render as
// larger, more opaque blobs so density reads at a glance.
const SEVERITY_RADIUS: Record<string, number> = {
  critical: 18,
  high: 14,
  medium: 11,
  low: 8,
};

const SEVERITY_ORDER = ["critical", "high", "medium", "low"] as const;

// ── Transboundary early-warning layer (anonymized leaf diagnoses) ────────────
// A migration vector is a DERIVED geometric estimate (bearing + great-circle
// distance from the hotspot cell to the nearest same-crop corridor in another
// BRICS state) — never an observed flight path. Violet distinguishes it from
// the red/amber EONET observation markers at a glance.
const DIAG_COLORS = { fill: "#8b5cf6", stroke: "#6d28d9", line: "#7c3aed" };

interface PestVector {
  to_country: string;
  to_corridor: string;
  to_lat: number;
  to_lng: number;
  direction: string;
  bearing_deg: number;
  distance_km: number;
  derived: boolean;
  method: string;
}

interface PestCluster {
  id: string;
  pest: string;
  pest_name: string;
  scientific_name: string;
  latitude: number;
  longitude: number;
  country: string | null;
  event_count: number;
  level: string;
  first_observed: string;
  last_observed: string;
  crops: string[];
  mean_confidence: number | null;
  vector: PestVector | null;
}

const REFRESH_MS = 5 * 60 * 1000;

const categoryIcon = (category: string, size = 14) => {
  const c = (category || "").toLowerCase();
  if (c.includes("flood")) return <Waves size={size} />;
  if (c.includes("wildfire")) return <Flame size={size} />;
  if (c.includes("volcan")) return <Mountain size={size} />;
  if (c.includes("severe storm")) return <Zap size={size} />;
  return <CloudRain size={size} />;
};

export default function MapComponent() {
  const [events, setEvents] = useState<HazardEvent[]>([]);
  const [status, setStatus] = useState<"loading" | "live" | "error" | "empty">("loading");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // Anonymized diagnosis hotspots + derived migration vectors (separate feed —
  // when it is unavailable the EONET layer keeps rendering on its own).
  const [pestClusters, setPestClusters] = useState<PestCluster[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/v1/dpg/outbreaks`, {
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const rows: HazardEvent[] = (json?.data || []).map((e: any) => ({
          id: e.id,
          title: e.pest_name,
          category: e.affected_crop,
          date: e.date_observed || "",
          lat: e.latitude,
          lng: e.longitude,
          severity: e.severity,
          origin_country: e.origin_country,
          vector_direction: e.vector_direction || "Stationary",
        }));
        if (!mounted) return;
        setEvents(rows);
        setStatus(rows.length ? "live" : "empty");
        setUpdatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch {
        if (mounted && !isRefresh) setStatus("error");
      } finally {
        if (mounted) setRefreshing(false);
      }

      // Second feed: the transboundary early-warning layer built from real
      // leaf diagnoses (coordinates already snapped to a 0.5° cell server-side).
      try {
        const pres = await fetch(`${getApiBaseUrl()}/api/v1/pest-watch/vectors`, {
          signal: AbortSignal.timeout(8000),
        });
        if (pres.ok) {
          const pjson = await pres.json();
          if (mounted) {
            setPestClusters(Array.isArray(pjson?.clusters) ? pjson.clusters : []);
          }
        }
      } catch { /* leave the layer at its previous value */ }
    };

    load();
    const timer = setInterval(() => load(true), REFRESH_MS);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="relative h-[600px] w-full rounded-xl overflow-hidden shadow-lg border bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 shrink-0 flex flex-col md:flex-row justify-between items-center z-10 relative shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-full">
            <Cpu className="text-blue-400" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-blue-100 flex items-center gap-2">
              Transboundary Hazard Monitor — NASA EONET (Live)
            </h3>
            <p className="text-xs text-slate-400">
              Open natural-hazard events over BRICS nations (NASA EONET), plus anonymized leaf-diagnosis
              pest hotspots and their derived migration vectors across shared agro-climatic corridors.
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-slate-800 p-2 px-4 rounded-lg border border-slate-700">
          <Wind className="text-cyan-400" size={18} />
          <div className="text-[11px] leading-tight">
            <div className="text-slate-400 uppercase font-bold tracking-wider">Open Events</div>
            <div className="text-white font-bold text-[13px]">{status === 'live' ? events.length : '—'}</div>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#78E69E] animate-pulse" title="Live source" />
        </div>

        <div className="ml-3 hidden md:flex items-center gap-3 text-[11px] text-slate-400">
          <span>
            {updatedAt ? `Updated ${updatedAt}` : 'Connecting…'}
          </span>
          <span className="text-slate-600">·</span>
          <span>auto-refresh 5 min</span>
          {refreshing && <span className="text-cyan-400 animate-pulse">refreshing…</span>}
        </div>
      </div>

      {/* Severity legend — the scale the heatmap markers are drawn against */}
      <div className="bg-slate-800/90 border-t border-slate-700 px-4 py-2 shrink-0 flex flex-wrap items-center gap-x-5 gap-y-1 z-10 relative">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Severity</span>
        {SEVERITY_ORDER.map((sev) => (
          <span key={sev} className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span
              className="inline-block rounded-full"
              style={{
                width: Math.max(8, SEVERITY_RADIUS[sev] / 2),
                height: Math.max(8, SEVERITY_RADIUS[sev] / 2),
                backgroundColor: SEVERITY_COLORS[sev].fill,
                opacity: 0.85,
              }}
            />
            <span className="capitalize">{sev}</span>
            <span className="text-slate-500">
              ({status === 'live' ? events.filter((e) => e.severity === sev).length : '—'})
            </span>
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[11px] text-slate-300">
          <span
            className="inline-block rounded-full"
            style={{ width: 8, height: 8, backgroundColor: DIAG_COLORS.fill, opacity: 0.85 }}
          />
          Diagnosis hotspot (0.5° anonymized cell)
          <span className="text-slate-500">({pestClusters.length})</span>
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-300">
          <span className="inline-block w-4 border-t-2 border-dashed border-violet-400" />
          Derived migration vector
        </span>
        <span className="ml-auto text-[10px] text-slate-500">
          Marker size = heat intensity · sources: NASA EONET v3 + anonymized FloraNet diagnoses
        </span>
      </div>

      <div className="flex-1 relative">
        {status === 'loading' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
            <span className="ml-0 mt-3 text-gray-600 font-medium text-sm">Loading live NASA EONET events…</span>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50 text-center px-6">
            <ShieldAlert size={30} className="text-red-500 mb-2" />
            <p className="font-bold text-gray-800 text-sm">Live hazard feed unavailable</p>
            <p className="text-xs text-gray-500 mt-1">
              Backend endpoint /api/v1/dpg/outbreaks unreachable. No simulated events are shown.
            </p>
          </div>
        )}

        {status === 'empty' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50 text-center px-6">
            <CloudRain size={30} className="text-gray-400 mb-2" />
            <p className="font-bold text-gray-800 text-sm">No open hazard events over BRICS nations right now</p>
            <p className="text-xs text-gray-500 mt-1">
              NASA EONET currently lists no open events within the BRICS bounding regions.
            </p>
          </div>
        )}

        <MapContainer
          center={[15, 40]}
          zoom={2}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {events.map((ev) => {
            const colors = SEVERITY_COLORS[ev.severity] || SEVERITY_COLORS.low;
            return (
              <CircleMarker
                key={ev.id}
                center={[ev.lat, ev.lng]}
                radius={SEVERITY_RADIUS[ev.severity] ?? 10}
                pathOptions={{
                  color: colors.stroke,
                  fillColor: colors.fill,
                  fillOpacity: ev.severity === 'critical' ? 0.7 : ev.severity === 'high' ? 0.6 : 0.5,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[220px]">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                      <span className={ev.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}>
                        {categoryIcon(ev.category, 16)}
                      </span>
                      <h4 className="font-bold text-sm text-gray-900">{ev.title}</h4>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Category: <span className="font-semibold text-black">{ev.category}</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Country (by epicenter): <span className="font-semibold text-black">{ev.origin_country}</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Observed: <span className="font-semibold text-black">{ev.date || '—'}</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Severity: <span className="font-semibold uppercase text-black">{ev.severity}</span>
                      <span className="text-[10px] text-gray-400"> (category + recency)</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Vector direction: <span className="font-semibold text-black">{ev.vector_direction}</span>
                    </p>
                    <div className="mt-3 bg-slate-50 p-2 rounded border border-slate-100">
                      <p className="text-[10px] text-blue-800 font-bold uppercase mb-1 flex items-center gap-1">
                        <Cpu size={10} /> Source
                      </p>
                      <p className="text-xs text-slate-700">
                        NASA EONET v3 — live open events (public domain). No forecast extrapolation is applied.
                      </p>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Transboundary Pest & Pathogen Early Warning layer — anonymized
              diagnosis hotspots; dashed vectors point to the nearest same-crop
              agro-corridor in a *different* BRICS member state (derived). */}
          {pestClusters.map((c) => (
            <Fragment key={`pest-${c.id}`}>
              {c.vector && (
                <>
                  <Polyline
                    positions={[
                      [c.latitude, c.longitude],
                      [c.vector.to_lat, c.vector.to_lng],
                    ]}
                    pathOptions={{
                      color: DIAG_COLORS.line,
                      weight: 2,
                      dashArray: "6 8",
                      opacity: 0.75,
                    }}
                  />
                  <CircleMarker
                    center={[c.vector.to_lat, c.vector.to_lng]}
                    radius={4}
                    pathOptions={{
                      color: DIAG_COLORS.stroke,
                      fillColor: "#c4b5fd",
                      fillOpacity: 0.9,
                      weight: 1,
                    }}
                  />
                </>
              )}
              <CircleMarker
                center={[c.latitude, c.longitude]}
                radius={c.level === "hotspot" ? 13 : c.level === "cluster" ? 10 : 7}
                pathOptions={{
                  color: DIAG_COLORS.stroke,
                  fillColor: DIAG_COLORS.fill,
                  fillOpacity: 0.65,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[230px]">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                      <span className="text-violet-600"><ShieldAlert size={16} /></span>
                      <h4 className="font-bold text-sm text-gray-900">
                        {c.pest_name} · {c.level}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Scientific: <span className="font-semibold text-black">{c.scientific_name}</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Observations: <span className="font-semibold text-black">{c.event_count}</span>{' '}
                      in the aggregation window
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Country: <span className="font-semibold text-black">{c.country ?? "unattributed"}</span>
                    </p>
                    {c.crops.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Crops: <span className="font-semibold text-black">{c.crops.join(", ")}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      Cell: <span className="font-semibold text-black">{c.latitude}°, {c.longitude}°</span>{' '}
                      <span className="text-gray-400">(0.5° grid)</span>
                    </p>
                    {c.vector ? (
                      <div className="mt-3 bg-violet-50 p-2 rounded border border-violet-100">
                        <p className="text-[10px] text-violet-800 font-bold uppercase mb-1">
                          Derived migration vector
                        </p>
                        <p className="text-xs text-slate-700">
                          Heading {c.vector.direction} ({c.vector.bearing_deg}°) toward{' '}
                          {c.vector.to_corridor} in {c.vector.to_country} —{' '}
                          {Math.round(c.vector.distance_km)} km great-circle.
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">{c.vector.method}</p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 mt-2">
                        No vector shown{' '}
                        {c.country
                          ? "— this pest has no corridor model yet."
                          : "— cell country could not be attributed."}
                      </p>
                    )}
                    <div className="mt-3 bg-slate-50 p-2 rounded border border-slate-100">
                      <p className="text-[10px] text-blue-800 font-bold uppercase mb-1 flex items-center gap-1">
                        <Cpu size={10} /> Source
                      </p>
                      <p className="text-xs text-slate-700">
                        Aggregated from real FloraNet leaf diagnoses — coordinates snapped to a 0.5°
                        cell (~55 km); no farmer identity, image or exact farm location is stored.
                      </p>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            </Fragment>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
