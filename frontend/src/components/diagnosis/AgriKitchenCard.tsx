"use client";

/**
 * AgriKitchenCard — the "Agri-Kitchen" guide on the diagnostic card.
 *
 * Sustainability pillar: puts LOCALLY MADE, farm-waste bio-inputs in front of
 * the farmer ahead of imported chemical fertilisers, with an audio read-aloud
 * guide so it works on a phone in the field without reading a screen.
 *
 * Honesty rules this component enforces in the UI:
 *  - a recipe not validated for the farmer's country is BADGED, not hidden;
 *  - the institutional guidance each recipe rests on is always shown;
 *  - when the backend is unreachable the card says so and shows NO recipe,
 *    because inventing a "local remedy" is exactly the failure mode this
 *    platform exists to avoid.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ChefHat,
  Volume2,
  Square,
  Loader2,
  Leaf,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  ShoppingBasket,
} from 'lucide-react';
import { fetchAgriKitchen, AgriKitchenRecipe } from '@/services/farmApi';
import { speakText, stopSpeaking, speechLocaleFor } from '@/lib/speech';

interface Props {
  country?: string;
  /** Disease or symptom text from the diagnostic card, used to rank recipes. */
  problem?: string;
  className?: string;
}

export default function AgriKitchenCard({ country, problem, className = '' }: Props) {
  const [recipes, setRecipes] = useState<AgriKitchenRecipe[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreachable, setUnreachable] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [localeNote, setLocaleNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setUnreachable(false);

    fetchAgriKitchen(country, problem, 3)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setUnreachable(true);
          setRecipes([]);
          return;
        }
        setRecipes(data.records ?? []);
      })
      .catch(() => {
        if (!cancelled) setUnreachable(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      stopSpeaking();
    };
  }, [country, problem]);

  // The audio guide is generated server-side from the SAME recipe record the
  // text guide renders, so the two can never disagree.
  const speak = (recipe: AgriKitchenRecipe) => {
    if (speakingId === recipe.id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    setLocaleNote(null);
    const ok = speakText(recipe.spoken_script, speechLocaleFor(country), {
      onEnd: () => setSpeakingId(null),
      // Never claim a language was spoken when the device fell back to English.
      onFallback: () =>
        setLocaleNote(
          'No voice installed for your language on this device, so this guide is being read in English.',
        ),
    });
    if (ok) setSpeakingId(recipe.id);
  };

  const localCount = useMemo(
    () => (recipes ?? []).filter((r) => r.locally_validated).length,
    [recipes],
  );

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-[12.5px] text-[#5A6E62] ${className}`}>
        <Loader2 size={14} className="animate-spin" />
        Loading local bio-input recipes…
      </div>
    );
  }

  if (unreachable) {
    return (
      <div className={`rounded-xl border border-[#E5E0D3] bg-[#FCFAF4] p-3.5 ${className}`}>
        <div className="flex items-start gap-2">
          <AlertTriangle size={15} className="text-[#9A7B2F] mt-0.5 shrink-0" />
          <div>
            <p className="text-[12.5px] font-bold text-[#5C4A17]">
              Bio-input formulations unavailable
            </p>
            <p className="text-[11.5px] text-[#7A6535] mt-0.5 leading-relaxed">
              Backend <span className="font-mono">/api/v1/agrin/agri-kitchen</span> is
              unreachable, so no recipe is shown. No substitute recipes are displayed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) return null;

  return (
    <div className={`rounded-2xl border border-[#CDE5D5] bg-gradient-to-b from-[#F4FBF6] to-[#EAF6EE] overflow-hidden ${className}`}>
      <div className="px-4 pt-3.5 pb-3 border-b border-[#D8EBDF]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="bg-[#168A45] text-white rounded-lg p-1.5 shrink-0">
              <ChefHat size={16} />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#0F3D22] leading-tight">
                The Agri-Kitchen Guide
              </h3>
              <p className="text-[11.5px] text-[#4A6B55] mt-0.5 leading-snug">
                Farm-made bio-inputs from local materials — preferred over imported
                chemical fertilisers.
              </p>
            </div>
          </div>
          <span className="shrink-0 bg-white/80 border border-[#B9DCC5] text-[#0F5132] text-[10px] font-bold px-2 py-1 rounded-full">
            {localCount}/{recipes.length} validated for {country ?? 'your region'}
          </span>
        </div>
      </div>
      <RecipeRows
        recipes={recipes}
        openId={openId}
        setOpenId={setOpenId}
        speakingId={speakingId}
        speak={speak}
        localeNote={localeNote}
      />
    </div>
  );
}


function RecipeRows({
  recipes,
  openId,
  setOpenId,
  speakingId,
  speak,
  localeNote,
}: {
  recipes: AgriKitchenRecipe[];
  openId: string | null;
  setOpenId: (id: string | null) => void;
  speakingId: string | null;
  speak: (r: AgriKitchenRecipe) => void;
  localeNote: string | null;
}) {
  return (
    <div className="divide-y divide-[#D8EBDF]">
      {recipes.map((recipe) => {
        const isOpen = openId === recipe.id;
        return (
          <div key={recipe.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-[13px] font-bold text-[#123A22]">{recipe.name}</h4>
                  <span className="text-[10.5px] text-[#6B7F72] font-medium">
                    {recipe.local_name}
                  </span>
                  {recipe.locally_validated ? (
                    <span className="inline-flex items-center gap-1 bg-[#DCF3E4] border border-[#A8DCBB] text-[#0B5C31] text-[9.5px] font-bold px-1.5 py-0.5 rounded-full">
                      <MapPin size={9} /> Validated here
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-[#FDF4E0] border border-[#EBD3A0] text-[#8A6314] text-[9.5px] font-bold px-1.5 py-0.5 rounded-full">
                      <AlertTriangle size={9} /> Not validated locally
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[11px] text-[#4A6B55]">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} /> {recipe.prep_time}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Leaf size={11} />
                    <span className="font-semibold text-[#0B5C31]">
                      {recipe.sustainability_metrics.score}% local
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FlaskConical size={11} /> {recipe.batch}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => speak(recipe)}
                  aria-label={speakingId === recipe.id ? 'Stop audio guide' : 'Play audio guide'}
                  className={`p-2 rounded-full border transition-colors ${
                    speakingId === recipe.id
                      ? 'bg-[#075C32] text-white border-[#075C32]'
                      : 'bg-white text-[#075C32] border-[#B9DCC5] hover:bg-[#EAF6EE]'
                  }`}
                >
                  {speakingId === recipe.id ? <Square size={13} /> : <Volume2 size={14} />}
                </button>
                <button
                  onClick={() => setOpenId(isOpen ? null : recipe.id)}
                  className="px-2.5 py-1.5 text-[11px] font-bold text-[#0B5C31] bg-white border border-[#B9DCC5] rounded-full hover:bg-[#EAF6EE] transition-colors"
                >
                  {isOpen ? 'Hide' : 'How to make'}
                </button>
              </div>
            </div>

            {localeNote && speakingId === recipe.id && (
              <p className="text-[10.5px] text-[#8A6314] mt-2 flex items-start gap-1">
                <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                {localeNote}
              </p>
            )}

            {isOpen && (
              <div className="mt-3 space-y-3 animate-in fade-in duration-200">
                <RecipeDetail recipe={recipe} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


function RecipeDetail({ recipe }: { recipe: AgriKitchenRecipe }) {
  return (
    <>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#2F5C41] mb-1.5 flex items-center gap-1.5">
          <ShoppingBasket size={12} /> What you need
        </p>
        <ul className="space-y-1">
          {recipe.ingredients.map((ing) => (
            <li key={ing.name} className="text-[12px] text-[#264A33] flex items-start gap-2">
              <span
                className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                  ing.local ? 'bg-[#168A45]' : 'bg-[#C08A2E]'
                }`}
              />
              <span>
                <span className="font-bold">{ing.quantity}</span> {ing.name}
                <span className="text-[#5F7A68]"> — {ing.source_hint}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#2F5C41] mb-1.5">
          Step by step
        </p>
        <ol className="space-y-1.5">
          {recipe.steps.map((step, i) => (
            <li key={i} className="text-[12px] text-[#264A33] flex items-start gap-2">
              <span className="shrink-0 w-4 h-4 rounded-full bg-[#168A45] text-white text-[9.5px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-white/70 border border-[#CFE7D8] rounded-lg p-2.5">
        <p className="text-[11.5px] text-[#264A33]">
          <span className="font-bold">Apply:</span> {recipe.dose} via {recipe.application}.
        </p>
        <p className="text-[11.5px] text-[#5F7A68] mt-1">
          <span className="font-bold text-[#264A33]">Keep:</span> {recipe.shelf_life}.{' '}
          <span className="font-bold text-[#264A33]">Why it works:</span> {recipe.mechanism}
        </p>
        <p className="text-[11.5px] text-[#5F7A68] mt-1">
          <span className="font-bold text-[#264A33]">Sustainability:</span> {recipe.sustainability}
        </p>
      </div>

      {/* Provenance — always visible, never collapsed away */}
      <div className="flex items-start gap-1.5 text-[10.5px] text-[#4A6B55] border-t border-[#D8EBDF] pt-2">
        <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-[#168A45]" />
        <span>
          {recipe.validation_note}
          <span className="block mt-0.5">
            Validated in {recipe.validated_in.join(', ')} · {recipe.source}
          </span>
        </span>
      </div>
    </>
  );
}
