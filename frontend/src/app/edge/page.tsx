"use client";

import React, { useCallback, useState, useEffect } from "react";
import EdgeDiagnosticsCard, {
  type LiveDiagnosis,
} from "@/components/field-monitor/EdgeDiagnosticsCard";
import FarmerAdvisoryCards from "@/components/edge/FarmerAdvisoryCards";
import OfflineCaptureQueue, {
  type CaptureReplayResult,
} from "@/components/edge/OfflineCaptureQueue";
import {
  Mic,
  CloudOff,
  AlertTriangle,
  Leaf,
  CheckCircle2,
  Info,
  ShieldAlert,
  Volume2,
  Square,
} from "lucide-react";
import Link from "next/link";
import WhatsAppPrescriptionShare from "@/components/ui/WhatsAppPrescriptionShare";
import DiagnosticShareSheet from "@/components/ui/DiagnosticShareSheet";
import SatelliteScanPipeline from "@/components/field-monitor/SatelliteScanPipeline";

import { useFarm } from "@/context/farmContext";
import { useToast } from "@/context/toastContext";
import { getPendingCaptures } from "@/lib/offlineDb";
import { edgeAdvisorySpeechTags, resolveEdgeAdvisoryKey } from "@/data/edgeAdvisoryTranslations";
import { speakText, stopSpeaking } from "@/lib/speech";

/**
 * Edge Diagnostics & Advisory page.
 *
 * Everything on this page performs a REAL backend round-trip:
 *  - EdgeDiagnosticsCard  → POST /api/v1/doctor/diagnose (local vision model)
 *  - OfflineCaptureQueue  → IndexedDB queue, real multipart uploads on sync
 *  - FarmerAdvisoryCards  → GET /api/v1/farm/recommendations (live rule engine)
 *  - SatelliteScanPipeline→ Copernicus + Open-Meteo + ISRIC live metadata
 * No sample diagnoses, no synthetic transcripts, no fake sync states.
 */
export default function EdgeDiagnosticsPage() {
  const { userProfile } = useFarm();
  const { showToast } = useToast();

  // Edge connectivity mirrors the browser's real online state — never a
  // hardcoded "offline demo". Queued captures sync via the offline outbox.
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  // Real pipeline output — only ever set from a confirmed backend response.
  const [diagnosis, setDiagnosis] = useState<LiveDiagnosis | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const refreshQueuedCount = useCallback(async () => {
    const items = await getPendingCaptures();
    setQueuedCount(items.length);
  }, []);

  /** Merge replay results from the offline queue into the page's live state. */
  const handleReplayResult = useCallback(
    (result: CaptureReplayResult) => {
      if (result.kind === "photo" && result.diagnosis) setDiagnosis(result.diagnosis);
      if (result.kind === "voice" && result.transcript) setTranscript(result.transcript);
      void refreshQueuedCount();
    },
    [refreshQueuedCount]
  );

  useEffect(() => {
    let mounted = true;
    getPendingCaptures().then((items) => {
      if (mounted) setQueuedCount(items.length);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const goOffline = () => {
      setIsOffline(true);
      setSynced(false);
    };
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  const handleSync = async () => {
    // Real sync: flush the offline outbox queue, then report the outcome.
    setIsSyncing(true);
    try {
      const { flushOutbox } = await import("@/lib/offlineDb");
      const flushed = await flushOutbox();
      setSynced(flushed > 0 || !isOffline);
      if (!isOffline && flushed === 0) setSynced(true);
      await refreshQueuedCount();
    } catch {
      setSynced(false);
    } finally {
      setIsSyncing(false);
    }
  };

  /** Read the live Agro-Card aloud in the farmer's own language. */
  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    if (!diagnosis) return;

    const localeKey = resolveEdgeAdvisoryKey(userProfile.language || "en").key;
    const targetTag = edgeAdvisorySpeechTags[localeKey] || "en-US";

    const remedies = (diagnosis.organic_remedies || [])
      .map((r) => `${r.name}. ${r.description}`)
      .join(" ");
    const body = [
      diagnosis.disease_identification || "",
      diagnosis.severity ? `Severity: ${diagnosis.severity}` : "",
      remedies,
      diagnosis.additional_notes || "",
    ]
      .filter(Boolean)
      .join(". ");

    // Shared TTS helper: picks the closest installed voice and downgrades to
    // English loudly instead of silently, exactly like the chat read-aloud.
    const started = speakText(body, targetTag, {
      onEnd: () => setIsSpeaking(false),
      onFallback: (used) =>
        showToast(`No voice installed for this language — reading in ${used}.`, "info"),
    });

    if (!started) {
      showToast("Read-aloud is not supported on this device.", "warning");
      return;
    }
    setIsSpeaking(true);
  };

  return (
    <div className="min-h-screen bg-[#F6F9F7] text-[#111827] pb-24">
      {/* Header */}
      <div className="w-full bg-white border-b border-[#E8EFEA] pt-8 pb-6 px-6 md:px-12 sticky top-0 z-40">
        <div className="max-w-[800px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#075C32] hover:text-[#064E2A] mb-4 transition-colors"
            >
              <span>← Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight text-[#111827]">
                Field Diagnostics & Edge AI
              </h1>
            </div>
            <p className="text-[16px] text-[#4B5563] font-medium">
              Edge-first mobile diagnostic tool. Take photos and voice notes directly in the field with
              live orbital telemetry.
            </p>
          </div>

          {/* PWA Offline Status Badge */}
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] border transition-colors ${
              isOffline
                ? "bg-[#FFF9F2] border-[#FFE9D4] text-[#C2410C]"
                : synced
                ? "bg-[#F0FDF4] border-[#DCFCE7] text-[#15803D]"
                : "bg-[#F0F5F2] border-[#E0EBE4] text-[#111827]"
            }`}
          >
            {isOffline ? (
              <>
                <CloudOff className="w-5 h-5" />
                <span className="text-[14px] font-bold">Offline Mode Active</span>
              </>
            ) : synced ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-[14px] font-bold">Backend reachable</span>
              </>
            ) : (
              <>
                <Info className="w-5 h-5" />
                <span className="text-[14px] font-bold">Connectivity unchecked</span>
              </>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-[800px] mx-auto px-6 md:px-12 mt-8 flex flex-col gap-6">
        {/* Offline Warning Banner */}
        {isOffline && (
          <div className="w-full bg-[#FFF9F2] border border-[#FFE9D4] rounded-[16px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#C2410C] shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <h4 className="text-[15px] font-bold text-[#9A3412]">You are currently offline.</h4>
                <p className="text-[14px] text-[#C2410C] font-medium mt-0.5">
                  Records are queued in IndexedDB. Sync when connection is restored.
                </p>
              </div>
            </div>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="whitespace-nowrap px-4 py-2 bg-white border border-[#FFE9D4] rounded-[10px] text-[14px] font-bold text-[#C2410C] hover:bg-[#FFF4E6] transition-colors disabled:opacity-50"
            >
              {isSyncing ? "Connecting..." : "Force Sync Now"}
            </button>
          </div>
        )}

        {/* Live Field Diagnostics — photos, voice, offline queue, localized advisories */}
        <div className="flex flex-col gap-6">
          {/* Live diagnostics — real image POST to /api/v1/doctor/diagnose */}
          <EdgeDiagnosticsCard
            onDiagnosis={(d) => {
              setDiagnosis(d);
              setSynced(true);
            }}
            onQueued={() => void refreshQueuedCount()}
          />

          {/* Offline-First Capture Queue (photos + voice, real multipart uploads on sync) */}
          <OfflineCaptureQueue onResult={handleReplayResult} />

          {/* Localized Advisory Cards — live soil / weather / remedy in the farmer's language */}
          <FarmerAdvisoryCards />

          {queuedCount > 0 && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#FFE9D4] bg-[#FFF9F2]">
              <CloudOff size={15} className="text-[#C2410C] shrink-0" />
              <p className="text-[12.5px] font-semibold text-[#8A5A38]">
                {queuedCount} capture{queuedCount === 1 ? "" : "s"} queued on this device — syncing
                automatically when you reconnect.
              </p>
            </div>
          )}
        </div>

        {/* Satellite Laser-Scan Pipeline Component */}
        <SatelliteScanPipeline fieldId="Registered Farm Location" />

        {/* Voice note transcript — real local Whisper output, never simulated */}
        {transcript && (
          <div className="w-full bg-white border border-[#E8EFEA] rounded-[24px] overflow-hidden shadow-sm">
            <div className="bg-[#F8FAF9] px-6 py-4 border-b border-[#E8EFEA] flex items-center gap-3">
              <Mic className="w-5 h-5 text-[#075C32]" />
              <h3 className="text-[16px] font-bold text-[#111827]">Voice Note Transcript</h3>
              <span className="text-[11px] font-bold text-[#6D8176] bg-white border border-[#E8EFEA] px-2 py-0.5 rounded-full">
                local Whisper
              </span>
            </div>
            <p className="p-6 md:p-8 text-[15px] text-[#111827] leading-relaxed font-medium">
              {transcript}
            </p>
          </div>
        )}

        {/* The Diagnostic Result Card (Agro-Card) — real backend output only */}
        {diagnosis ? (
          <div className="w-full bg-white border border-[#E8EFEA] rounded-[24px] overflow-hidden shadow-sm">
            <div className="bg-[#F8FAF9] px-6 py-4 border-b border-[#E8EFEA] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Leaf className="w-5 h-5 text-[#075C32]" />
                <h3 className="text-[16px] font-bold text-[#111827]">
                  {diagnosis.disease_identification || "Diagnosis complete"}
                </h3>
                {diagnosis.severity && (
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      diagnosis.severity === "High"
                        ? "text-[#991B1B] bg-[#FEF2F2] border-[#FEE2E2]"
                        : diagnosis.severity === "Medium"
                        ? "text-[#92400E] bg-[#FFFBEB] border-[#FDE68A]"
                        : "text-[#15803D] bg-[#F0FDF4] border-[#DCFCE7]"
                    }`}
                  >
                    {diagnosis.severity}
                  </span>
                )}
                {diagnosis.confidence_score != null && (
                  <span className="text-[11px] font-bold text-[#6D8176] bg-white border border-[#E8EFEA] px-2 py-0.5 rounded-full">
                    {Math.round(diagnosis.confidence_score * 100)}% confidence · local vision model
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleReadAloud}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCE8DF] bg-white text-[12px] font-bold text-[#075C32] hover:bg-[#F3FAF5] transition-colors cursor-pointer"
              >
                {isSpeaking ? <Square size={12} /> : <Volume2 size={13} />}
                {isSpeaking ? "Stop" : "Listen"}
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-5">
              {/* Prescribed remedies */}
              {(diagnosis.organic_remedies ?? []).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-5 h-5 text-[#075C32]" />
                    <h4 className="text-[14px] font-bold text-[#111827]">Prescribed Remedies</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {(diagnosis.organic_remedies ?? []).map((r, i) => (
                      <li
                        key={i}
                        className="rounded-xl border border-[#E1EAE3] bg-[#F9FCF9] p-4"
                      >
                        <p className="text-[13.5px] font-bold text-[#075C32]">{r.name}</p>
                        <p className="text-[13px] text-[#4B5563] leading-relaxed mt-1">
                          {r.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {diagnosis.additional_notes && (
                <p className="text-[12.5px] text-[#854D0E] font-medium bg-[#FEFCE8] border border-[#FEF08A] px-4 py-3 rounded-xl">
                  {diagnosis.additional_notes}
                </p>
              )}

              {/* WhatsApp Agro-Card share — grounded in the real diagnosis */}
              <WhatsAppPrescriptionShare
                title="FloraNet Edge Diagnosis"
                field={userProfile.farmName}
                prescription={diagnosis.disease_identification || "Diagnosis"}
                actionItems={[
                  ...(diagnosis.organic_remedies ?? []).map((r) => `${r.name}: ${r.description}`),
                  ...(diagnosis.additional_notes ? [diagnosis.additional_notes] : []),
                ]}
              />

              {/* One-Click Extension Share Sheet: printable PDF + WhatsApp card,
                  built only from the live diagnosis payload */}
              <DiagnosticShareSheet diagnosis={diagnosis} />
            </div>
          </div>
        ) : (
          <div className="w-full bg-white border border-[#E8EFEA] rounded-[24px] overflow-hidden shadow-sm">
            <div className="bg-[#F8FAF9] px-6 py-4 border-b border-[#E8EFEA] flex items-center gap-3">
              <Leaf className="w-5 h-5 text-[#075C32]" />
              <h3 className="text-[16px] font-bold text-[#111827]">Real Diagnosis Pipeline</h3>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[15px] text-[#111827] leading-relaxed font-medium mb-2">
                    No sample diagnosis is displayed — FloraNet only shows real results.
                  </p>
                  <p className="text-[13.5px] text-[#6B7280] leading-relaxed">
                    Capture a leaf photo above and sync it to run the backend multimodal diagnosis
                    (POST /api/v1/doctor/diagnose), grounded in the verified ICAR / Embrapa / ARC
                    corpus. Once a live result exists it will appear here with its real confidence,
                    remedies and microclimate context from live Open-Meteo data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
