"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CloudOff,
  Droplets,
  Info,
  Leaf,
  RefreshCw,
  Satellite,
  ShieldAlert,
  Square,
  Thermometer,
  Volume2,
} from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { useToast } from '@/context/toastContext';
import { fetchLiveSoil, fetchRecommendations } from '@/services/farmApi';
import {
  edgeAdvisoryLocaleNames,
  edgeAdvisorySpeechTags,
  edgeAdvisoryTranslations,
  fillAdvisoryTemplate,
  resolveEdgeAdvisoryKey,
} from '@/data/edgeAdvisoryTranslations';
import { speakText, stopSpeaking as cancelSpeech } from '@/lib/speech';

/**
 * Farmer Edge — Localized Advisory Cards
 *
 * Renders the backend rule-engine advisories (GET /api/v1/farm/recommendations,
 * computed from live Open-Meteo + ISRIC SoilGrids + NASA EONET readings) in the
 * farmer's own language, together with the live soil profile.
 *
 * Localization strategy (never fabricates content):
 *   - The advisory ID + the REAL numeric values are pulled from the live
 *     response (and cross-checked against GET /api/v1/soil/live) and injected
 *     into translated `{token}` templates.
 *   - If a token cannot be resolved from live data, the backend's own English
 *     sentence is shown verbatim instead of a half-filled template.
 */

interface LiveAdvisory {
  id: string;
  title: string;
  priority: string;
  description: string;
  source: string;
}

interface LiveSoil {
  layers?: {
    '0_1cm'?: { moisture_pct?: number | null; temp_c?: number | null };
    '1_3cm'?: { moisture_pct?: number | null };
    '3_9cm'?: { moisture_pct?: number | null; temp_c?: number | null };
    evapotranspiration_mm?: number | null;
  };
  soilgrids?: { ph?: number | null; soc_percent?: number | null; available?: boolean };
  source?: string;
}

/** Normalize a backend advisory id (`rec-hazard-eonet-123` → `rec-hazard`). */
function baseAdvisoryId(id: string): string {
  if (id.startsWith('rec-hazard')) return 'rec-hazard';
  return id;
}

/**
 * Pull the real numeric context for an advisory out of the backend's own
 * deterministic prose (and the live soil endpoint where it is authoritative).
 * Returns only values that were actually observed — never defaults.
 */
function extractAdvisoryValues(
  advisory: LiveAdvisory,
  crop: string,
  soil: LiveSoil | null,
): Record<string, string | number | undefined> {
  const text = `${advisory.title} ${advisory.description}`;
  const values: Record<string, string | number | undefined> = {
    crop,
    moisture: soil?.layers?.['0_1cm']?.moisture_pct ?? undefined,
    ph: soil?.soilgrids?.ph ?? undefined,
    soc: soil?.soilgrids?.soc_percent ?? undefined,
  };

  const id = baseAdvisoryId(advisory.id);

  if (id.startsWith('rec-irrigation') && values.moisture === undefined) {
    const m = text.match(/(?:at|is)\s+([\d.]+)%/);
    if (m) values.moisture = m[1];
  }
  if (id === 'rec-rain-window') {
    const m = text.match(/([\d.]+)\s*mm/);
    if (m) values.rain72 = m[1];
  }
  if (id === 'rec-ph' && values.ph === undefined) {
    const m = text.match(/pH\s+([\d.]+)/);
    if (m) values.ph = m[1];
  }
  if (id === 'rec-soc' && values.soc === undefined) {
    const m = text.match(/\(([\d.]+)%\)/);
    if (m) values.soc = m[1];
  }
  if (id === 'rec-hazard') {
    const name = advisory.title.match(/:\s*(.+)$/);
    if (name) values.hazard = name[1].trim();
    const category = advisory.description.match(/active\s+(\w+)\s+event/i);
    if (category) values.category = category[1];
  }

  return values;
}

/** True when every `{token}` in the template was resolved with real data. */
function templateIsComplete(template: string, values: Record<string, string | number | undefined>): boolean {
  const tokens = template.match(/\{(\w+)\}/g) || [];
  return tokens.every((t) => values[t.slice(1, -1)] !== undefined);
}

const PRIORITY_STYLES: Record<string, string> = {
  High: 'bg-[#FEF2F2] text-[#991B1B] border-[#FEE2E2]',
  Medium: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
  Info: 'bg-[#EFF6FF] text-[#1E40AF] border-[#DBEAFE]',
  Low: 'bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7]',
};

export default function FarmerAdvisoryCards() {
  const { userProfile } = useFarm();
  const { showToast } = useToast();

  const [advisories, setAdvisories] = useState<LiveAdvisory[] | null>(null);
  const [soil, setSoil] = useState<LiveSoil | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const coords = userProfile.defaultCoordinates;
  const langCode = userProfile.language || 'en';

  // Exact match → show that language; otherwise fall back per the shared
  // BRICS policy and tell the farmer which language they are reading.
  const resolved = useMemo(() => resolveEdgeAdvisoryKey(langCode), [langCode]);
  // The resolver only ever returns keys present in this table, but guard anyway so an
  // unexpected profile value degrades to English instead of crashing the dashboard.
  const copy = edgeAdvisoryTranslations[resolved.key] ?? edgeAdvisoryTranslations.en;

  const loadLiveAdvisories = useCallback(async () => {
    setIsLoading(true);
    const [recs, liveSoil] = await Promise.all([
      fetchRecommendations(coords?.lat, coords?.lng, userProfile.primaryCrop),
      coords ? fetchLiveSoil(coords.lat, coords.lng) : Promise.resolve(null),
    ]);
    setAdvisories(Array.isArray(recs) ? (recs as LiveAdvisory[]) : null);
    setSoil((liveSoil as LiveSoil) || null);
    setIsLoading(false);
  }, [coords, userProfile.primaryCrop]);

  useEffect(() => {
    void loadLiveAdvisories();
  }, [loadLiveAdvisories]);

  // Announce the fallback once per language switch so the choice is never silent.
  useEffect(() => {
    if (!resolved.fallback) return;
    showToast(
      `${edgeAdvisoryLocaleNames[resolved.key]} advisory labels shown — full ${langCode} copy coming soon`,
      'info',
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved.key, resolved.fallback, langCode]);

  /** Build the localized card text for one advisory, using real values only. */
  const localizedCard = useCallback(
    (advisory: LiveAdvisory) => {
      const id = baseAdvisoryId(advisory.id);
      const template = copy.advisories[id];
      const values = extractAdvisoryValues(advisory, userProfile.primaryCrop || '', soil);

      if (!template) {
        // No translated template yet → show the backend's real English text.
        return { title: advisory.title, description: advisory.description, localized: false };
      }

      const titleOk = templateIsComplete(template.title, values);
      const descOk = templateIsComplete(template.description, values);

      return {
        title: titleOk ? fillAdvisoryTemplate(template.title, values) : advisory.title,
        description: descOk ? fillAdvisoryTemplate(template.description, values) : advisory.description,
        localized: titleOk && descOk,
      };
    },
    [copy, soil, userProfile.primaryCrop],
  );

  const speakableCards = useMemo(
    () => (advisories ?? []).map((a) => localizedCard(a)),
    [advisories, localizedCard],
  );

  const stopSpeaking = useCallback(() => {
    // Shared cancel — one implementation for every read-aloud surface.
    cancelSpeech();
    setIsSpeaking(false);
  }, []);

  const readAloud = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    const targetTag = edgeAdvisorySpeechTags[resolved.key] || 'en-US';
    const body = speakableCards.map((c, i) => `${i + 1}. ${c.title}. ${c.description}`).join(' ');

    // Shared TTS helper: closest installed voice, honest English downgrade.
    const started = speakText(body, targetTag, {
      onEnd: () => setIsSpeaking(false),
      onFallback: () => showToast(copy.speechFallbackNotice, 'info'),
    });

    if (!started) {
      showToast(copy.readAloudUnavailable, 'warning');
      return;
    }

    setIsSpeaking(true);
  }, [copy, isSpeaking, resolved.key, showToast, speakableCards, stopSpeaking]);

  useEffect(() => stopSpeaking, [stopSpeaking]);

  const moisture = soil?.layers?.['0_1cm']?.moisture_pct;
  const soilTemp = soil?.layers?.['0_1cm']?.temp_c ?? soil?.layers?.['3_9cm']?.temp_c;
  const et0 = soil?.layers?.evapotranspiration_mm;

  return (
    <section
      lang={edgeAdvisorySpeechTags[resolved.key] || 'en-US'}
      className="w-full bg-white border border-[#E1E8E4] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)]"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] border border-[#CDE5D5] flex items-center justify-center shrink-0">
            <Satellite size={19} className="text-[#075C32]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[16px] font-bold text-[#102A20] leading-tight">{copy.heading}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#075C32] bg-[#EAF6EE] border border-[#CDE5D5] px-1.5 py-0.5 rounded">
                {copy.liveBadge}
              </span>
              {resolved.fallback && (
                <span className="text-[10px] font-bold text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] px-1.5 py-0.5 rounded">
                  {edgeAdvisoryLocaleNames[resolved.key]}
                </span>
              )}
            </div>
            <p className="text-[12.5px] text-[#55695F] leading-relaxed mt-1">{copy.subheading}</p>
            {coords && (
              <p className="text-[11.5px] text-[#6D8176] font-medium mt-1">
                {copy.locationLabel}: {userProfile.farmLocation} · {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={readAloud}
            disabled={speakableCards.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCE8DF] bg-[#FAFCFA] hover:bg-[#F3FAF5] text-[12px] font-bold text-[#075C32] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSpeaking ? <Square size={12} /> : <Volume2 size={13} />}
            {isSpeaking ? copy.stopListening : copy.listen}
          </button>
          <button
            type="button"
            onClick={() => void loadLiveAdvisories()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCE8DF] bg-[#FAFCFA] hover:bg-[#F3FAF5] text-[12px] font-bold text-[#102A20] transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? copy.refreshing : copy.refresh}
          </button>
        </div>
      </header>

      {/* Live soil profile — real Open-Meteo readings, no placeholders */}
      {(moisture != null || soilTemp != null || et0 != null) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {moisture != null && (
            <div className="rounded-xl border border-[#E1E8E4] bg-[#FAFCFA] p-3 flex items-center gap-2.5">
              <Droplets size={17} className="text-[#1D6FA8] shrink-0" />
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-[#6D8176] truncate">{copy.soilMoisture}</p>
                <p className="text-[15px] font-bold text-[#102A20]">{moisture}%</p>
              </div>
            </div>
          )}
          {soilTemp != null && (
            <div className="rounded-xl border border-[#E1E8E4] bg-[#FAFCFA] p-3 flex items-center gap-2.5">
              <Thermometer size={17} className="text-[#B45309] shrink-0" />
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-[#6D8176] truncate">{copy.soilTemp}</p>
                <p className="text-[15px] font-bold text-[#102A20]">{soilTemp}°C</p>
              </div>
            </div>
          )}
          {et0 != null && (
            <div className="rounded-xl border border-[#E1E8E4] bg-[#FAFCFA] p-3 flex items-center gap-2.5">
              <Leaf size={17} className="text-[#075C32] shrink-0" />
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-[#6D8176] truncate">{copy.evapotranspiration}</p>
                <p className="text-[15px] font-bold text-[#102A20]">{et0} mm</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && advisories === null && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[#E1E8E4] bg-[#FAFCFA] text-[13px] font-semibold text-[#55695F]">
          <RefreshCw size={14} className="animate-spin" />
          {copy.loading}
        </div>
      )}

      {/* Backend unreachable → explicit unavailable, never synthetic advice */}
      {!isLoading && advisories === null && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-[#FFE9D4] bg-[#FFF9F2]">
          <CloudOff size={16} className="text-[#C2410C] shrink-0 mt-0.5" />
          <div>
            <p className="text-[13.5px] font-bold text-[#C2410C]">{copy.unavailableTitle}</p>
            <p className="text-[12.5px] text-[#8A5A38] leading-relaxed mt-0.5">{copy.unavailableHint}</p>
          </div>
        </div>
      )}

      {!isLoading && advisories !== null && advisories.length === 0 && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[#E1E8E4] bg-[#FAFCFA]">
          <Info size={15} className="text-[#6D8176] shrink-0" />
          <p className="text-[13px] font-semibold text-[#55695F]">{copy.noAdvisories}</p>
        </div>
      )}

      {/* Advisory cards */}
      {advisories !== null && advisories.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {advisories.map((advisory, idx) => {
            const card = localizedCard(advisory);
            const priorityLabel = copy.priority[advisory.priority as keyof typeof copy.priority] || advisory.priority;
            const priorityStyle = PRIORITY_STYLES[advisory.priority] || PRIORITY_STYLES.Info;

            return (
              <li
                key={`${advisory.id}-${idx}`}
                className="rounded-xl border border-[#E1E8E4] bg-[#FDFEFD] p-3.5 hover:border-[#CDE5D5] transition-colors"
              >
                <div className="flex items-start justify-between gap-2.5 mb-1.5">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="mt-0.5 shrink-0">
                      {advisory.priority === 'High' ? (
                        <ShieldAlert size={15} className="text-[#B91C1C]" />
                      ) : advisory.priority === 'Medium' ? (
                        <AlertTriangle size={15} className="text-[#B45309]" />
                      ) : (
                        <Info size={15} className="text-[#1D6FA8]" />
                      )}
                    </span>
                    <p className="text-[13.5px] font-bold text-[#102A20] leading-snug">{card.title}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${priorityStyle}`}>
                    {priorityLabel}
                  </span>
                </div>

                <p className="text-[12.5px] text-[#55695F] leading-relaxed pl-[23px]">{card.description}</p>

                <div className="flex items-center gap-2 flex-wrap mt-1.5 pl-[23px]">
                  <span className="text-[10.5px] font-semibold text-[#8A9A91]">
                    {copy.sourceLabel}: {advisory.source}
                  </span>
                  {!card.localized && (
                    <span className="text-[10px] font-bold text-[#6D8176] bg-[#F1F5F3] border border-[#E1E8E4] px-1.5 py-0.5 rounded">
                      EN
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
