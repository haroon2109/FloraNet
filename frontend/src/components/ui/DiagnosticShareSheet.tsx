"use client";

import React, { forwardRef, useRef, useState } from "react";
import {
  Download, Loader2, MessageCircle, Printer, FileText, AlertTriangle,
} from "lucide-react";
import { useToast } from "@/context/toastContext";
import { useFarm } from "@/context/farmContext";
import { useUILocale } from '@/lib/useUILocale';
import type { LiveDiagnosis } from "@/components/field-monitor/EdgeDiagnosticsCard";

/**
 * One-Click Diagnostic Share Sheet — lightweight printable / WhatsApp-shareable
 * prescription card for local agricultural extension officers.
 *
 * Built ONLY from the real backend diagnosis (LiveDiagnosis). If any required
 * section has no data (no remedies, no confidence) it renders an explicit
 * "not provided" line rather than filler — the printed card never invents
 * content the model did not return. The two export actions are real:
 *   - Print / Save as PDF → browser print dialog on the hidden A4 sheet
 *   - WhatsApp            → wa.me deep link with the same prescription text
 */

interface DiagnosticShareSheetProps {
  diagnosis: LiveDiagnosis;
  /** Optional captured-photo data URL printed as evidence on the card. */
  capturedPhotoDataUrl?: string | null;
}

/** The hidden A4 sheet that the print/PDF pipeline renders. */
export const PrintableSheet = forwardRef<HTMLDivElement, DiagnosticShareSheetProps>(
  function PrintableSheet({ diagnosis, capturedPhotoDataUrl }, ref) {
    // Printed prescription dates follow the profile language.
    const locale = useUILocale();
    const confidence =
      diagnosis.confidence_score != null
        ? `${Math.round(diagnosis.confidence_score * 100)}% (local multimodal model)`
        : "not provided by the model";
    const remedies = diagnosis.organic_remedies ?? [];

    return (
      <div
        ref={ref}
        id="floranet-printable-share-sheet"
        className="bg-white text-gray-900 font-sans p-10 w-[794px]"
        style={{ minHeight: "1000px" }}
      >
        {/* Header */}
        <div className="border-b-4 border-[#075C32] pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-[#075C32]">FloraNet AgriN</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
              Field Diagnostic Prescription Card
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="font-bold">{new Date().toLocaleDateString(locale)}</p>
            <p className="text-gray-500">
              Generated {new Date().toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        {/* Diagnosis summary */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-xl font-bold mb-2">
            Diagnosis:{" "}
            <span className="text-[#991B1B]">
              {diagnosis.disease_identification || "Not identified by the model"}
            </span>
          </h2>
          {diagnosis.severity && (
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-bold">Severity:</span> {diagnosis.severity}
            </p>
          )}
          <p className="text-sm text-gray-700">
            <span className="font-bold">Model confidence:</span> {confidence}
          </p>
          {diagnosis.additional_notes && (
            <p className="text-[13px] text-gray-600 mt-3 leading-relaxed border-t border-gray-200 pt-3">
              {diagnosis.additional_notes}
            </p>
          )}
        </div>

        {/* Evidence photo when available */}
        {capturedPhotoDataUrl && (
          <div className="mb-6">
            <h3 className="font-bold text-base border-b pb-1.5 mb-3">Field Evidence</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedPhotoDataUrl}
              alt="Captured leaf sample"
              className="max-h-[220px] rounded-lg border border-gray-300"
            />
          </div>
        )}

        {/* Prescription */}
        <div className="bg-[#F2F8F4] p-6 rounded-lg border border-[#CDE5D5] mb-8">
          <h3 className="font-bold text-lg text-[#1E4D30] border-b border-[#CDE5D5] pb-2 mb-3">
            Prescribed Remedies (RAG-grounded)
          </h3>
          {remedies.length === 0 ? (
            <p className="text-sm text-gray-600 italic">
              No remedies were returned by the diagnosis pipeline — verify with a local
              extension officer before applying any treatment.
            </p>
          ) : (
            <ol className="space-y-3">
              {remedies.map((r, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-black bg-[#DCEBDF] text-[#075C32] w-6 h-6 flex items-center justify-center rounded-full text-sm shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed">
                    <span className="font-bold">{r.name}:</span> {r.description}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Footer — honesty statement, not decoration */}
        <div className="mt-10 border-t pt-4 text-[11px] text-gray-500 leading-relaxed">
          <p>
            Source: live FloraNet backend diagnosis (POST /api/v1/doctor/diagnose → local
            open-weights vision model grounded in the verified ICAR / Embrapa / ARC / CAAS /
            VNIIEA corpus). No content on this card is simulated.
          </p>
          <p className="mt-1">
            AI-assisted advisory — consult local agricultural extension officers for complex or
            recurring cases before large-scale application.
          </p>
        </div>
      </div>
    );
  }
);

/** Compact plain-text prescription for WhatsApp (kept under WhatsApp's limits). */
export function buildWhatsAppPrescriptionText(
  diagnosis: LiveDiagnosis,
  farmName: string,
  location: string
): string {
  const lines: string[] = [];
  lines.push("🌱 *FloraNet Diagnostic Prescription Card*");
  lines.push(`📍 ${farmName || "Farm"}${location ? ` — ${location}` : ""}`);
  lines.push(
    `🦠 *Diagnosis:* ${diagnosis.disease_identification || "Not identified"}${
      diagnosis.severity ? ` (${diagnosis.severity})` : ""
    }`
  );
  if (diagnosis.confidence_score != null) {
    lines.push(`📊 Confidence: ${Math.round(diagnosis.confidence_score * 100)}% (local AI model)`);
  }
  const remedies = diagnosis.organic_remedies ?? [];
  if (remedies.length > 0) {
    lines.push("");
    lines.push("📋 *Prescribed Remedies:*");
    remedies.forEach((r, i) => lines.push(`  ${i + 1}. ${r.name} — ${r.description}`));
  } else {
    lines.push("");
    lines.push("📋 No remedies returned by the model — verify with your extension officer.");
  }
  if (diagnosis.additional_notes) {
    lines.push("");
    lines.push(`ℹ️ ${diagnosis.additional_notes}`);
  }
  lines.push("");
  lines.push("_Live diagnosis via FloraNet Edge AI (local model + verified ICAR/Embrapa/ARC corpus)_");
  return lines.join("\n");
}

export default function DiagnosticShareSheet({
  diagnosis,
  capturedPhotoDataUrl,
}: DiagnosticShareSheetProps) {
  const { userProfile } = useFarm();
  const { showToast } = useToast();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  /** Real PDF export via html2pdf.js (HTML→canvas→jsPDF), then download. */
  const handleDownloadPdf = async () => {
    if (!sheetRef.current || exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const filename = `floranet_prescription_${Date.now()}.pdf`;
      await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(sheetRef.current)
        .save();
      showToast("Prescription card downloaded as PDF", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "PDF export failed";
      setExportError(`${msg} — use Print → “Save as PDF” as a fallback.`);
    } finally {
      setExporting(false);
    }
  };

  /** Real browser print of the hidden A4 sheet (also the PDF fallback path). */
  const handlePrint = () => {
    window.print();
  };

  /** Real WhatsApp deep link with the same prescription text. */
  const handleWhatsAppShare = () => {
    const text = buildWhatsAppPrescriptionText(
      diagnosis,
      userProfile.farmName,
      userProfile.farmLocation
    );
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="not-printable">
      {/* Action row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D8176] mr-1 flex items-center gap-1.5">
          <FileText size={12} /> Extension Share Sheet
        </span>

        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#075C32] hover:bg-[#064E2A] disabled:opacity-60 text-white text-[12px] font-bold transition-colors cursor-pointer"
        >
          {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          {exporting ? "Building PDF…" : "Download PDF"}
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE8DF] bg-white hover:bg-[#F3FAF5] text-[12px] font-bold text-[#102A20] transition-colors cursor-pointer"
        >
          <Printer size={13} />
          Print
        </button>

        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#1DA851] hover:text-[#128C41] text-[12px] font-bold transition-colors cursor-pointer"
        >
          <MessageCircle size={13} />
          WhatsApp
        </button>
      </div>

      {exportError && (
        <div className="mt-2 flex items-start gap-2 bg-[#FFF9F2] border border-[#FFE9D4] rounded-xl px-3.5 py-2.5">
          <AlertTriangle size={14} className="text-[#C2410C] shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-[#9A3412] font-medium leading-snug">{exportError}</p>
        </div>
      )}

      {/* Hidden printable sheet (off-screen; html2pdf + print read this node) */}
      <div className="absolute -left-[9999px] top-0" aria-hidden="true">
        <PrintableSheet
          ref={sheetRef}
          diagnosis={diagnosis}
          capturedPhotoDataUrl={capturedPhotoDataUrl ?? null}
        />
      </div>
    </div>
  );
}
