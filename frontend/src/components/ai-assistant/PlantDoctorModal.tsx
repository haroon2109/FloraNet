"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  Camera,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RotateCw,
  FlaskConical,
} from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { useToast } from '@/context/toastContext';
import { queueOfflineMutation } from '@/lib/offlineDb';
import { getApiBaseUrl } from '@/lib/apiConfig';
import DiagnosticShareSheet from '@/components/ui/DiagnosticShareSheet';
import AgriKitchenCard from '@/components/diagnosis/AgriKitchenCard';

// Live backend diagnosis shape (POST /api/v1/doctor/diagnose returns a Celery
// task; the task result resolves to DiagnosisResponse JSON). We render ONLY
// that result — there are no canned sample diagnoses anywhere in this file.
interface LiveDiagnosis {
  disease_identification: string;
  confidence_score: number;
  organic_remedies: Array<{ name: string; description: string; type: string }>;
  chemical_alternatives?: Array<{ name: string; description: string; type: string }>;
  additional_notes?: string;
}

interface PlantDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlantDoctorModal({ isOpen, onClose }: PlantDoctorModalProps) {
  const { userProfile } = useFarm();
  const { showToast } = useToast();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<LiveDiagnosis | null>(null);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const pollTask = async (taskId: string): Promise<LiveDiagnosis> => {
    const base = getApiBaseUrl();
    for (let attempt = 0; attempt < 30; attempt++) {
      await new Promise((r) => setTimeout(r, 2000));
      const res = await fetch(`${base}/api/v1/tasks/${encodeURIComponent(taskId)}`);
      if (!res.ok) continue;
      const body = await res.json();
      if (body?.status === 'SUCCESS' && body?.result) return body.result as LiveDiagnosis;
      if (body?.status === 'FAILURE') throw new Error(typeof body?.result === 'string' ? body.result : 'Diagnosis task failed');
    }
    throw new Error('Diagnosis timed out — the worker may be offline (Redis/Celery required).');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSelectedImage(result);
        runScan(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const runScan = async (file: File) => {
    // Live path only: POST the photo to the Celery-backed diagnose endpoint,
    // then poll the task. Any failure renders an explicit error — never a
    // canned disease card.
    setIsScanning(true);
    setDiagnosis(null);
    setDiagnosisError(null);
    setIsApplied(false);

    try {
      const coords = userProfile.defaultCoordinates
        ? `${userProfile.defaultCoordinates.lat},${userProfile.defaultCoordinates.lng}`
        : '';
      const form = new FormData();
      form.append('image', file);
      form.append('query', `Diagnose crop disease or deficiency in this leaf sample (${userProfile.primaryCrop || 'unknown crop'}, ${userProfile.country || 'unknown country'}).`);
      form.append('coordinates', coords);

      const res = await fetch(`${getApiBaseUrl()}/api/v1/doctor/diagnose`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        let detail = '';
        try {
          const err = await res.json();
          detail = err?.detail ? ` — ${JSON.stringify(err.detail)}` : '';
        } catch { /* ignore parse errors */ }
        throw new Error(`Diagnose request rejected (HTTP ${res.status}${detail}).`);
      }
      const { task_id } = await res.json();
      if (!task_id) throw new Error('Backend did not return a task id.');
      const result = await pollTask(task_id);
      setDiagnosis(result);
      showToast(`Detected: ${result.disease_identification} (${Math.round(result.confidence_score * 100)}% confidence)`, 'info');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Live diagnosis unavailable.';
      setDiagnosisError(`${msg} No substitute diagnosis is shown.`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyToField = () => {
    if (!diagnosis) return;
    setIsApplied(true);
    
    // Queue offline action
    queueOfflineMutation('APPLY_BIO_RECIPE', '/api/v1/doctor/prescriptions', {
      disease: diagnosis.disease_identification,
      recipe: diagnosis.organic_remedies?.[0]?.name || 'organic remedy',
      appliedAt: new Date().toISOString()
    });

    showToast(`Bio-Recipe "${diagnosis.organic_remedies?.[0]?.name || 'organic remedy'}" queued for application!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-[24px] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[#DCE6DE] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#EEF3EF] flex items-center justify-between bg-[#F8FAF8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF5EC] text-[#075C32] flex items-center justify-center border border-[#C4E7D0]">
              <FlaskConical size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#102A20] leading-tight">
                AI Plant Doctor & Pathology Scanner
              </h2>
              <p className="text-[12px] text-[#55695F]">
                Grounded across ICAR, Embrapa, and CAAS botanical diagnostic models
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#55695F] hover:text-[#102A20] hover:bg-[#EAEFEA] rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Upload / Image Selection Area */}
          {!selectedImage ? (
            <div className="space-y-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />

              {/* Drag & Drop Target */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#C4E7D0] hover:border-[#075C32] bg-[#F5FAF6] hover:bg-[#EEF7F1] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white text-[#075C32] shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera size={26} strokeWidth={2} />
                </div>
                <h3 className="text-[15px] font-bold text-[#102A20] mb-1">
                  Upload or Capture Plant / Leaf Photo
                </h3>
                <p className="text-[12.5px] text-[#55695F] max-w-sm">
                  Drag and drop a leaf image or click to select from your device. Supports JPG, PNG, WebP.
                </p>
              </div>

              <p className="text-[12px] text-[#55695F] bg-[#F5FAF6] border border-[#DDE6DF] rounded-xl px-3.5 py-2.5">
                Uploaded photos are sent to the live backend (POST /api/v1/doctor/diagnose → local vision model + RAG).
                No sample or canned results are shown — only the live task result.
              </p>

            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Image Preview & Scanning Overlay */}
              <div className="relative w-full h-[220px] rounded-2xl overflow-hidden bg-black/5 border border-[#DDE6DF]">
                <Image 
                  src={selectedImage} 
                  alt="Scanned Plant Leaf" 
                  fill 
                  className="object-cover object-center" 
                />

                {/* Laser Scanning Animation */}
                {isScanning && (
                  <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xs flex flex-col items-center justify-center">
                    <div className="w-full h-1 bg-[#168A45] shadow-[0_0_15px_#168A45] animate-pulse absolute top-1/2 -translate-y-1/2" />
                    <div className="bg-white/90 px-4 py-2 rounded-xl text-[13px] font-bold text-[#075C32] flex items-center gap-2 shadow-lg z-10">
                      <RotateCw size={16} className="animate-spin" />
                      <span>Extracting Leaf Cellular Pathologies...</span>
                    </div>
                  </div>
                )}

                {/* Retake Button */}
                {!isScanning && (
                  <button
                    type="button"
                    onClick={() => { setSelectedImage(null); setDiagnosis(null); setDiagnosisError(null); }}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[11.5px] font-bold text-[#102A20] hover:bg-white transition-all shadow-sm"
                  >
                    Scan Another Leaf
                  </button>
                )}
              </div>

              {/* Diagnosis Output Results */}
              {diagnosisError && !isScanning && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-[13px] text-red-800">
                  {diagnosisError}
                </div>
              )}
              {diagnosis && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

                  {/* Diagnosis Card */}
                  <div className="bg-[#FAFDFB] border border-[#C4E7D0] rounded-2xl p-4.5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[18px] font-bold text-[#102A20]">
                            {diagnosis.disease_identification}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF5EC] text-[#075C32] border border-[#C4E7D0]">
                            {Math.round(diagnosis.confidence_score * 100)}% Match
                          </span>
                        </div>
                        {diagnosis.additional_notes && (
                          <p className="text-[12.5px] text-[#55695F]">
                            {diagnosis.additional_notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Organic Remedies (live backend output) */}
                    <div className="bg-white rounded-xl p-4 border border-[#D5E3D8] space-y-2.5">
                      <div className="flex items-center gap-2 text-[#075C32]">
                        <FlaskConical size={16} strokeWidth={2.2} />
                        <h4 className="text-[13.5px] font-bold">
                          Live organic remedies (AI + RAG)
                        </h4>
                      </div>

                      <ul className="grid grid-cols-1 gap-1.5 text-[12.5px] text-[#243A2E]">
                        {diagnosis.organic_remedies.map((remedy, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#168A45] mt-1.5 shrink-0" />
                            <span><span className="font-bold">{remedy.name}:</span> {remedy.description}</span>
                          </li>
                        ))}
                      </ul>

                      {diagnosis.chemical_alternatives && diagnosis.chemical_alternatives.length > 0 && (
                        <div className="text-[12.5px] text-[#4A5E53] border-t border-[#EEF3EF] pt-2">
                          <span className="font-bold text-[#102A20]">Chemical alternatives: </span>
                          {diagnosis.chemical_alternatives.map((c) => `${c.name} — ${c.description}`).join(' | ')}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#075C32] bg-[#EAF5EC] px-2.5 py-1 rounded-lg">
                        <ShieldCheck size={13} />
                        <span>Source: live backend diagnosis (local AI + verified RAG corpus)</span>
                      </div>
                    </div>

                    {/* Agri-Kitchen: verified farm-made bio-input recipes (Sustainability).
                        Placed directly under the AI remedies so the farmer sees the
                        locally-made alternative BEFORE any chemical alternative. */}
                    <AgriKitchenCard
                      country={userProfile?.country}
                      problem={diagnosis.disease_identification}
                    />

                    {/* One-Click Extension Share Sheet (PDF / print / WhatsApp) */}
                    <DiagnosticShareSheet diagnosis={diagnosis} />

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleApplyToField}
                        disabled={isApplied}
                        className={`px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                          isApplied
                            ? 'bg-[#EAF5EC] text-[#075C32] border border-[#C4E7D0]'
                            : 'bg-[#075C32] hover:bg-[#064E2A] text-white hover:scale-102'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Bio-Recipe Queued ✓</span>
                          </>
                        ) : (
                          <>
                            <span>Queue Bio-Treatment</span>
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
