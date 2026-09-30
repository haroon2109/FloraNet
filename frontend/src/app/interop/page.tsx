"use client";

import React, { useState, useEffect } from "react";
import JsonLdViewer from "@/components/interop/JsonLdViewer";
import JsonLdExplorer from "@/components/interop/JsonLdExplorer";
import GeoJsonExportModal from "@/components/interop/GeoJsonExportModal";
import ModelFederationNode from "@/components/interop/ModelFederationNode";
import ModelRegistry from "@/components/interop/ModelRegistry";
import ApiPlayground from "@/components/interop/ApiPlayground";
import {
  DatabaseZap,
  Network,
  ArrowLeft,
  Globe,
  FileCode,
  Download,
  BookOpen,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/apiConfig";
import { fetchDpgOpenApi, fetchDpgSchema } from "@/services/farmApi";

export default function InteropPage() {
  const [isGeoJsonOpen, setIsGeoJsonOpen] = useState(false);
  const [liveEvent, setLiveEvent] = useState<any | null>(null);
  const [payloadStatus, setPayloadStatus] = useState<'loading' | 'live' | 'unavailable'>('loading');

  // The AgriN schema manifest, served by GET /api/v1/dpg/schema and derived
  // server-side from the live Pydantic models — not a hand-written copy.
  const [schema, setSchema] = useState<Record<string, any> | null>(null);
  const [schemaStatus, setSchemaStatus] = useState<'loading' | 'live' | 'unavailable'>('loading');
  const [downloading, setDownloading] = useState<'openapi' | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // The exported JSON-LD is built from the FIRST live NASA EONET hazard event
  // (via backend GET /api/v1/dpg/outbreaks) — never a canned Fall Armyworm card.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { fetchOutbreakEvents } = await import('@/services/farmApi');
        const data = await fetchOutbreakEvents();
        if (!mounted) return;
        const first = data?.data?.[0];
        if (first) {
          setLiveEvent(first);
          setPayloadStatus('live');
        } else {
          setPayloadStatus('unavailable');
        }
      } catch {
        if (mounted) setPayloadStatus('unavailable');
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await fetchDpgSchema();
      if (!mounted) return;
      if (data) {
        setSchema(data);
        setSchemaStatus('live');
      } else {
        setSchemaStatus('unavailable');
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Fetch the node-scoped OpenAPI document on demand and hand it to the browser
  // as a downloadable file — the same bytes an institution would codegen from.
  const downloadOpenApi = async () => {
    setDownloading('openapi');
    setDownloadError(null);
    const spec = await fetchDpgOpenApi();
    setDownloading(null);
    if (!spec) {
      setDownloadError('Backend /api/v1/dpg/openapi unreachable — nothing was downloaded.');
      return;
    }
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agrin_dpg_openapi.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const diagnosticPayload = liveEvent ? {
    "@context": {
      "agrin": "http://purl.org/agrin/schema/",
      "fao": "http://aims.fao.org/aos/agrovoc/",
      "schema": "http://schema.org/",
      "geo": "http://www.w3.org/2003/01/geo/wgs84_pos#"
    },
    "@type": "agrin:DiagnosticEvent",
    "schema:identifier": liveEvent.id || "FLORA-LIVE-EVENT",
    "schema:dateCreated": new Date().toISOString(),
    "agrin:detectedVector": {
      "@type": "fao:Pest",
      "schema:name": liveEvent.pest_name || "Unnamed hazard",
      "agrin:commonName": liveEvent.affected_crop || liveEvent.pest_name || "Unnamed hazard",
      "agrin:severity": liveEvent.severity || "unknown",
      "agrin:vectorDirection": liveEvent.vector_direction || "Stationary",
      "agrin:dateObserved": liveEvent.date_observed || "not published by source"
    },
    "agrin:recommendedIntervention": {
      "@type": "agrin:BioRemedy",
      "schema:name": "Consult live advisory feed before acting",
      "agrin:activeAgent": "No canned prescription — see /api/v1/farm/recommendations",
      "agrin:sourceInstitute": "FloraNet live pipeline",
      "agrin:countryCode": liveEvent.origin_country || "unknown"
    },
    "schema:location": {
      "@type": "schema:GeoCoordinates",
      "geo:lat": liveEvent.latitude,
      "geo:long": liveEvent.longitude
    },
    "agrin:telemetryContext": {
      "@type": "agrin:TelemetryData",
      "agrin:note": "Pair with live GET /api/v1/soil/live and /api/v1/farm/weather-telemetry for the same coordinates"
    }
  } : null;

  return (
    <div className="min-h-screen bg-[#F6F9F7] text-[#111827] pb-24">
      {/* Header */}
      <div className="w-full bg-white border-b border-[#E8EFEA] pt-8 pb-6 px-6 md:px-12 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col">
            <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-semibold text-emerald-700 hover:text-emerald-800 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#EAF5EC] rounded-xl flex items-center justify-center text-[#075C32]">
                <DatabaseZap className="w-5 h-5" strokeWidth={2} />
              </div>
              <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight text-[#111827]">
                Digital Public Goods Schema Hub
              </h1>
            </div>
            <p className="text-[15px] text-[#4B5563] font-medium max-w-2xl">
              FAIR-Compliant AgriN Open Data Exporter. Federate real-time diagnostic telemetry across the BRICS Agricultural Research Platform (BARP).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/policy-dashboard"
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F0F5F2] text-[#075C32] text-[13px] font-bold rounded-xl border border-[#D9E7DD] transition-all"
            >
              <Workflow size={16} />
              <span>Heatmap &amp; SOC Tracker</span>
            </Link>

            {/* OGC GeoJSON Export Trigger Button */}
            <button
              type="button"
              onClick={() => setIsGeoJsonOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#075C32] hover:bg-[#064E2A] text-white text-[13px] font-bold rounded-xl shadow-xs transition-all cursor-pointer hover:scale-102"
            >
              <Globe size={16} className="text-emerald-300" />
              <span>Export OGC GeoJSON</span>
            </button>

            <div className="flex items-center gap-2 bg-[#F0F5F2] px-4 py-2.5 rounded-xl border border-[#E0EBE4]">
              <Network className="w-4 h-4 text-[#075C32]" />
              <span className="text-[13.5px] font-bold text-[#111827]">Federation: <span className="text-[#075C32]">Active</span></span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-6 md:px-12 mt-10 flex flex-col gap-12">

        {/* ── 1. Standardized AgriN Open Data Schema (JSON-LD / OpenAPI) ── */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#075C32]">
              01 · Interoperability
            </span>
            <h2 className="text-[22px] font-bold text-[#111827]">
              Standardized AgriN Open Data Schema (JSON-LD / OpenAPI)
            </h2>
            <p className="text-[15px] text-[#4B5563] max-w-3xl leading-relaxed">
              The contract this node publishes so cross-border institutions — ICAR in India, Embrapa in
              Brazil, ARC in South Africa — can ingest and share localized disease models without vendor
              lock-in. Class definitions and the endpoint catalogue are generated by the backend from its
              own Pydantic models and router, so the manifest can never drift from the implementation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={downloadOpenApi}
              disabled={downloading === 'openapi'}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#075C32] hover:bg-[#064E2A] disabled:opacity-60 text-white text-[13px] font-bold rounded-xl transition-all"
            >
              <Download size={15} />
              <span>{downloading === 'openapi' ? 'Fetching spec…' : 'Download OpenAPI 3 (JSON)'}</span>
            </button>

            <a
              href={`${getApiBaseUrl()}/docs`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F0F5F2] text-[#111827] text-[13px] font-bold rounded-xl border border-[#D9E7DD] transition-all"
            >
              <BookOpen size={15} className="text-[#075C32]" />
              <span>Interactive Swagger Docs</span>
            </a>

            <a
              href={`${getApiBaseUrl()}/api/v1/dpg/schema`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F0F5F2] text-[#111827] text-[13px] font-bold rounded-xl border border-[#D9E7DD] transition-all font-mono"
            >
              <FileCode size={15} className="text-[#075C32]" />
              <span>GET /api/v1/dpg/schema</span>
            </a>
          </div>

          {downloadError && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-[13px] text-amber-800">
              {downloadError}
            </div>
          )}

          {schemaStatus === 'loading' && (
            <div className="bg-white border border-[#E8EFEA] rounded-[24px] p-8 text-center text-[14px] text-[#4B5563]">
              Fetching AgriN schema manifest…
            </div>
          )}
          {schemaStatus === 'unavailable' && (
            <div className="bg-amber-50 border border-amber-200 rounded-[24px] p-8 text-center">
              <p className="text-[14px] font-bold text-amber-800">Schema endpoint unreachable</p>
              <p className="text-[12.5px] text-amber-700 mt-1">
                Backend /api/v1/dpg/schema did not respond — no substitute schema is shown.
              </p>
            </div>
          )}
          {schemaStatus === 'live' && schema && (
            <JsonLdViewer
              title="AgriN Open Data Schema (JSON-LD)"
              description="W3C DCAT-aligned class + endpoint manifest, derived from the live Pydantic models."
              payload={schema}
            />
          )}
        </section>

        {/* ── 2. Model federation: ingest and share localized disease models ── */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#075C32]">
              02 · Model Federation
            </span>
            <h2 className="text-[22px] font-bold text-[#111827]">
              Ingest &amp; Share Localized Disease Models
            </h2>
            <p className="text-[15px] text-[#4B5563] max-w-3xl leading-relaxed">
              Institutions push a model through <span className="font-mono text-[13px]">POST /api/v1/dpg/ingest</span>{" "}
              and read the shared set back through{" "}
              <span className="font-mono text-[13px]">GET /api/v1/dpg/models</span> — a two-way exchange
              rather than a write-only sink. The registry reports its actual storage backend, so an empty
              list is never mistaken for lost data.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <ModelFederationNode />
            <ModelRegistry />
          </div>
        </section>

        {/* ── 3. Live JSON-LD datasets + Swagger playground ── */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#075C32]">
              03 · Data Exchange
            </span>
            <h2 className="text-[22px] font-bold text-[#111827]">
              Open Data Endpoints &amp; API Playground
            </h2>
            <p className="text-[15px] text-[#4B5563] max-w-3xl leading-relaxed">
              Browse every published JSON-LD dataset live, then try the calls against the interactive
              OpenAPI console. Every response is served in its original units from the cited public
              source — nothing on this page is simulated.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <JsonLdExplorer />
            <ApiPlayground />
          </div>
        </section>

        {/* ── 4. Single-record diagnostic export ── */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#075C32]">
              04 · Verifiable Credential
            </span>
            <h2 className="text-[22px] font-bold text-[#111827]">Export Diagnostic Record</h2>
            <p className="text-[15px] text-[#4B5563] max-w-3xl leading-relaxed">
              This payload is built from the latest live transboundary hazard event (NASA EONET via the backend).
              By exporting this schema, local agricultural ministries can ingest the data into their national
              surveillance grids without vendor lock-in.
            </p>
          </div>

          {payloadStatus === 'loading' && (
            <div className="bg-white border border-[#E8EFEA] rounded-[24px] p-8 text-center text-[14px] text-[#4B5563]">
              Fetching live hazard event…
            </div>
          )}
          {payloadStatus === 'unavailable' && (
            <div className="bg-amber-50 border border-amber-200 rounded-[24px] p-8 text-center">
              <p className="text-[14px] font-bold text-amber-800">Live hazard feed unavailable</p>
              <p className="text-[12.5px] text-amber-700 mt-1">Backend /api/v1/dpg/outbreaks unreachable — no substitute payload is shown.</p>
            </div>
          )}
          {payloadStatus === 'live' && diagnosticPayload && (
          <JsonLdViewer
            title="AgriN Diagnostic Event (JSON-LD)"
            description="W3C DCAT Schema mapped to FAO AGROVOC thesaurus."
            payload={diagnosticPayload}
          />
          )}
        </section>

      </main>

      {/* Mount GeoJSON Modal */}
      <GeoJsonExportModal
        isOpen={isGeoJsonOpen}
        onClose={() => setIsGeoJsonOpen(false)}
      />
    </div>
  );
}
