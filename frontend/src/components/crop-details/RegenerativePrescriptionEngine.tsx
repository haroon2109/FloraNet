"use client";

import React, { useEffect, useState } from 'react';
import {
  FlaskConical, Sprout, Bug, AlertCircle, Loader2, Microscope,
  CloudSun, ShieldCheck, Sparkles, Info, ChevronDown, Wind,
} from 'lucide-react';
import {
  fetchRegenerativePrescription,
  RegenerativePrescription,
  BioRemedy,
  CompanionStrategy,
} from '@/services/farmApi';
import { useFarm } from '@/context/farmContext';
import WhatsAppPrescriptionShare from '@/components/ui/WhatsAppPrescriptionShare';

/**
 * Regenerative Bio-Input Prescription Engine (UI)
 *
 * Calls GET /api/v1/regenerative/prescription which returns:
 *  - CITED organic remedies (Trichoderma, neem, compost tea…) — reference protocols
 *  - CITED preventative companion-planting strategies (marigold for nematodes…)
 *  - Live tailoring notes computed from Open-Meteo + ISRIC SoilGrids
 *  - An optional local-Ollama narrative (ai_narrative = null when model is down)
 *
 * Honesty rules preserved: when the backend is unreachable we show an explicit
 * unavailable state; live readings that are missing render "Not available now";
 * AI narrative is only rendered when actually generated.
 */

const PROBLEM_PRESETS = [
  { tag: 'root_rot', label: 'Root rot / damping off' },
  { tag: 'nematodes', label: 'Nematodes' },
  { tag: 'fall_armyworm', label: 'Fall armyworm' },
  { tag: 'leaf_blight', label: 'Leaf blight / fungal disease' },
  { tag: 'sucking_pests', label: 'Sucking pests (aphid/whitefly)' },
  { tag: 'low_soc', label: 'Low soil organic carbon' },
  { tag: 'low_microbiota', label: 'Depleted soil microbiota' },
  { tag: 'general_fertility', label: 'General fertility rebuild' },
] as const;

type RxState = 'idle' | 'loading' | 'ready' | 'unavailable';

export default function RegenerativePrescriptionEngine() {
  const { userProfile } = useFarm();

  // Default problem tag selected per problem list; empty string = no selection.
  const [problem, setProblem] = useState<string>('root_rot');
  const [state, setState] = useState<RxState>('loading');
  const [prescription, setPrescription] = useState<RegenerativePrescription | null>(null);
  const [openRemedy, setOpenRemedy] = useState<string | null>(null);
  const [openCompanion, setOpenCompanion] = useState<string | null>(null);

  const crop = userProfile.primaryCrop || 'Maize';
  // Profile benchmark coordinates (real place, per-country config) — the same
  // legitimate default the rest of the app uses for live API calls.
  const coords = userProfile.defaultCoordinates;

  /** Fetch + set result. Only mutates state AFTER the await (event-handler safe). */
  const runPrescription = React.useCallback(async () => {
    const data = await fetchRegenerativePrescription(
      crop,
      problem,
      coords.lat,
      coords.lng
    );
    if (data) {
      setPrescription(data);
      setState('ready');
    } else {
      setPrescription(null);
      setState('unavailable');
    }
  }, [crop, problem, coords.lat, coords.lng]);

  // Initial load — state updates happen inside .then(), never synchronously.
  useEffect(() => {
    if (coords.lat == null || coords.lng == null) return;
    let mounted = true;
    fetchRegenerativePrescription(crop, problem, coords.lat, coords.lng).then((data) => {
      if (!mounted) return;
      if (data) {
        setPrescription(data);
        setState('ready');
      } else {
        setPrescription(null);
        setState('unavailable');
      }
    });
    return () => { mounted = false; };
  }, [coords.lat, coords.lng, crop, problem]);

  const handleGenerate = () => {
    setState('loading');
    runPrescription();
  };

  const remedies: BioRemedy[] = prescription?.bio_remedies ?? [];
  const companions: CompanionStrategy[] = prescription?.companion_plantings ?? [];

  return (
    <div className="bg-white border border-[#E1E8E4] rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[#F0F4F1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#075C32] animate-pulse" />
            <h3 className="text-[17px] font-bold text-[#102A20]">
              Regenerative Bio-Input Prescription Engine
            </h3>
          </div>
          <p className="text-[12.5px] text-[#55695F] mt-0.5">
            Organic &amp; bio-remedies for soil microbiota + preventative companion planting — cited ICAR / Embrapa / ARC protocols
          </p>
        </div>
        <span className="text-[11px] font-bold text-[#075C32] bg-[#EAF5EC] px-3 py-1 rounded-full border border-[#C4E7D0] w-fit shrink-0">
          Reference Protocols · Not Lab Tests
        </span>
      </div>

      {/* Controls: crop (from profile), problem selector, generate */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-5">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F8F6] border border-[#E2EBE5] rounded-xl shrink-0">
          <Sprout size={14} className="text-[#075C32]" />
          <span className="text-[12.5px] font-bold text-[#102A20]">{crop}</span>
          <span className="text-[10px] text-[#607469] font-semibold">from profile</span>
        </div>

        <div className="relative flex-1">
          <Bug size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52645D] pointer-events-none" />
          <select
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="w-full appearance-none bg-white border border-[#E1E7E3] rounded-xl pl-8 pr-8 py-2 text-[12.5px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#168A45]/20"
          >
            {PROBLEM_PRESETS.map((p) => (
              <option key={p.tag} value={p.tag}>{p.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52645D] pointer-events-none" />
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={state === 'loading'}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#075C32] hover:bg-[#054324] disabled:opacity-60 text-white text-[12.5px] font-bold rounded-xl shadow-xs transition-all shrink-0"
        >
          {state === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <FlaskConical size={14} />}
          <span>{state === 'loading' ? 'Preparing…' : 'Generate Prescription'}</span>
        </button>
      </div>

      {/* Unavailable state */}
      {state === 'unavailable' && (
        <div className="bg-[#FFF8EF] border border-[#F3E3C3] rounded-xl p-5 text-center mb-2">
          <AlertCircle size={22} className="mx-auto text-amber-600 mb-2" />
          <p className="text-[13px] font-bold text-[#102A20]">Prescription engine unavailable</p>
          <p className="text-[12px] text-[#607469] mt-1">
            The backend could not be reached. No substitute protocols are shown without its knowledge base.
          </p>
        </div>
      )}

      {/* Loading state */}
      {state === 'loading' && (
        <div className="bg-[#F8FAF8] border border-[#E2ECE5] rounded-xl p-6 text-center mb-2">
          <Loader2 size={22} className="mx-auto text-[#075C32] animate-spin mb-2" />
          <p className="text-[12.5px] font-semibold text-[#4A5E53]">
            Matching cited protocols and live soil/weather tailoring…
          </p>
        </div>
      )}

      {/* Ready state */}
      {state === 'ready' && prescription && (
        <div className="space-y-4">

          {/* Live tailoring strip */}
          <div className="bg-[#F8FAF8] border border-[#E2ECE5] rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6A7E74] mb-2">
              <CloudSun size={12} />
              Live Tailoring Context
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: 'Soil Moisture', value: prescription.inputs.live_moisture_pct, unit: '%' },
                { label: 'Temperature', value: prescription.inputs.live_temp_c, unit: '°C' },
                { label: 'Soil pH', value: prescription.inputs.soil_ph, unit: '' },
                { label: 'SOC', value: prescription.inputs.soil_soc_pct, unit: '%' },
              ].map((m) => (
                <div key={m.label} className="bg-white p-2.5 rounded-lg border border-[#E3ECE6]">
                  <span className="text-[10px] text-[#6A7E74] block">{m.label}</span>
                  <span className={`text-[14px] font-bold ${m.value != null ? 'text-[#075C32]' : 'text-[#889B91]'}`}>
                    {m.value != null ? `${m.value}${m.unit}` : 'Not available now'}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-1.5 mt-2.5">
              <Info size={11} className="text-[#6A7E74] mt-0.5 shrink-0" />
              <p className="text-[10.5px] text-[#6A7E74] leading-snug">
                Live readings from Open-Meteo + ISRIC SoilGrids at your coordinates; protocols below are cited reference
                data — calibrate doses to your soil test and local extension guidance.
              </p>
            </div>
          </div>

          {/* Section 1: Organic & Bio-Remedies */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Microscope size={15} className="text-[#075C32]" />
              <h4 className="text-[14px] font-bold text-[#102A20]">Organic &amp; Bio-Remedies</h4>
              <span className="text-[10.5px] font-semibold text-[#607469]">
                prioritized for soil-microbiota restoration
              </span>
            </div>
            <div className="space-y-2.5">
              {remedies.map((r) => {
                const isOpen = openRemedy === r.id;
                return (
                  <div
                    key={r.id}
                    className={`rounded-xl border transition-all ${
                      isOpen ? 'bg-[#FAFCFA] border-[#075C32] ring-1 ring-[#075C32]/15' : 'bg-white border-[#E5EDE7] hover:border-[#CFDDD3]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenRemedy(isOpen ? null : r.id)}
                      className="w-full p-3.5 flex items-center justify-between gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13.5px] font-bold text-[#102A20]">{r.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF5EC] text-[#075C32] border border-[#C4E7D0]">
                            {r.category}
                          </span>
                          {r.restores_microbiota && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF0FB] text-[#1A5FB8] border border-[#D0E2FB]">
                              Restores microbiota
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] text-[#55695F] mt-1 truncate">
                          Targets: {r.targets.join(' · ')}
                        </p>
                      </div>
                      <ChevronDown
                        size={15}
                        className={`text-[#52645D] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-3.5 pb-3.5 space-y-2.5">
                        <div className="bg-white border border-[#E3ECE6] rounded-lg p-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6A7E74] block mb-1">
                            Application Protocol
                          </span>
                          <p className="text-[12px] text-[#2C4837] leading-relaxed">{r.protocol}</p>
                          <span className="text-[10px] text-[#607469] block mt-1">Form: {r.form}</span>
                        </div>

                        <div className="bg-white border border-[#E3ECE6] rounded-lg p-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6A7E74] block mb-1">
                            How It Works
                          </span>
                          <p className="text-[12px] text-[#4A5E53] leading-relaxed">{r.mechanism}</p>
                        </div>

                        {/* Live tailoring notes for this remedy */}
                        {r.tailored_notes && r.tailored_notes.length > 0 && (
                          <div className="bg-[#F4FAF6] border border-[#CDE5D4] rounded-lg p-3">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#075C32] mb-1">
                              <Wind size={12} />
                              Live-Condition Adjustments
                            </div>
                            <ul className="space-y-1">
                              {r.tailored_notes.map((n, i) => (
                                <li key={i} className="text-[11.5px] text-[#2C4837] leading-snug flex gap-1.5">
                                  <span className="text-[#075C32]">•</span>
                                  <span>{n}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-start gap-1.5 px-0.5">
                          <ShieldCheck size={11} className="text-[#6A7E74] mt-0.5 shrink-0" />
                          <p className="text-[10.5px] text-[#6A7E74] leading-snug">
                            Source: {r.source} · {r.citation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Preventative Companion Planting */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Sprout size={15} className="text-[#075C32]" />
              <h4 className="text-[14px] font-bold text-[#102A20]">Preventative Companion Planting</h4>
              <span className="text-[10.5px] font-semibold text-[#607469]">
                intercrop to prevent recurring infections
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {companions.map((c) => {
                const isOpen = openCompanion === c.id;
                return (
                  <div
                    key={c.id}
                    className={`rounded-xl border p-3.5 transition-all cursor-pointer ${
                      isOpen ? 'bg-[#FAFCFA] border-[#075C32] ring-1 ring-[#075C32]/15' : 'bg-white border-[#E5EDE7] hover:border-[#CFDDD3]'
                    }`}
                    onClick={() => setOpenCompanion(isOpen ? null : c.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-bold text-[#102A20] leading-snug">{c.name}</span>
                      <ChevronDown
                        size={14}
                        className={`text-[#52645D] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </div>
                    <p className="text-[11px] text-[#55695F] mt-1.5 line-clamp-2">{c.strategy}</p>

                    {isOpen && (
                      <div className="mt-2.5 space-y-2">
                        <div className="bg-[#F8FAF8] border border-[#E2ECE5] rounded-lg p-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6A7E74] block mb-0.5">
                            Prevention Cycle
                          </span>
                          <p className="text-[11.5px] text-[#2C4837] leading-snug">{c.prevention_note}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
                          <span className="px-2 py-0.5 rounded bg-[#EAF5EC] text-[#075C32]">Spacing: {c.spacing}</span>
                          <span className="px-2 py-0.5 rounded bg-[#F0F4F1] text-[#52645D]">
                            Best with: {c.main_crops.slice(0, 3).join(', ')}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#6A7E74] leading-snug">
                          Source: {c.source} · {c.citation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI narrative (only when actually generated) */}
          {prescription.ai_narrative && (
            <div className="bg-[#F4FAF6] border border-[#CDE5D4] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#075C32] mb-1.5">
                <Sparkles size={13} />
                <span>AI Agronomist Action Plan (local model, grounded in the cited protocols)</span>
              </div>
              <p className="text-[12.5px] text-[#1E4D30] leading-relaxed whitespace-pre-line">
                {prescription.ai_narrative}
              </p>
            </div>
          )}
          {prescription._note && (
            <div className="flex items-start gap-2 bg-[#FDF7EC] border border-[#F3E3C3] rounded-xl px-3.5 py-2.5">
              <Info size={13} className="text-[#854D0E] mt-0.5 shrink-0" />
              <p className="text-[11.5px] text-[#854D0E] font-medium leading-snug">{prescription._note}</p>
            </div>
          )}

          {/* Monitoring + share + data basis */}
          <div className="pt-3 border-t border-[#F0F4F1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-[10.5px] text-[#6A7E74] leading-snug max-w-md">
              {prescription.monitoring[0]} · {prescription.data_basis}
            </p>
            <WhatsAppPrescriptionShare
              title={`Regenerative Prescription: ${prescription.inputs.problems.join(', ') || 'General'}`}
              field={crop}
              prescription={
                remedies
                  .slice(0, 3)
                  .map((r) => `${r.name}: ${r.protocol}`)
                  .join('\n') || 'See the prescription panel in FloraNet.'
              }
              actionItems={companions.slice(0, 3).map((c) => `Intercrop: ${c.name}`)}
              variant="pill"
            />
          </div>
        </div>
      )}
    </div>
  );
}
