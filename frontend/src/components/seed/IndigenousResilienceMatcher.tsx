"use client";

import React, { useState } from 'react';
import {
  Droplets,
  ThermometerSun,
  ShieldCheck,
  AlertTriangle,
  Info,
  Loader2,
} from 'lucide-react';
import {
  fetchResilienceMatch,
  type RankedCandidate,
  type ResilienceMatchResponse,
} from '@/services/seedApi';

/**
 * Indigenous Resilience Matcher.
 *
 * Renders the LIVE observed drought signal at a point alongside the ranked,
 * explained response from the open/indigenous seed registry.
 *
 * Two honesty rules this component enforces visually, not just in prose:
 *  - the observed SPEI and a caller-supplied scenario uplift are rendered in
 *    SEPARATE, explicitly labelled cards, because NASA POWER reports observed
 *    agro-climatology and issues no probabilities;
 *  - the ranking is described as a rule-based score, not "AI confidence", since
 *    it is a deterministic weighted trait score a user can recompute by hand.
 */

const ZONES = [
  { label: 'Maharashtra, India', lat: 19.7515, lng: 75.7139 },
  { label: 'Deccan Plateau, India', lat: 17.32, lng: 76.42 },
  { label: 'Rajasthan, India', lat: 27.02, lng: 74.17 },
  { label: 'Highveld, South Africa', lat: -29.2, lng: 26.2 },
  { label: 'Cerrado, Brazil', lat: -15.6, lng: -47.8 },
];

export default function IndigenousResilienceMatcher() {
  const [zoneIndex, setZoneIndex] = useState(0);
  const [uplift, setUplift] = useState(30);
  const [useScenario, setUseScenario] = useState(true);
  const [data, setData] = useState<ResilienceMatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const zone = ZONES[zoneIndex];

  const run = async () => {
    setLoading(true);
    setUnavailable(false);
    setHasRun(true);
    const result = await fetchResilienceMatch({
      lat: zone.lat,
      lng: zone.lng,
      scenarioUpliftPct: useScenario ? uplift : null,
      limit: 6,
    });
    setData(result);
    if (!result) setUnavailable(true);
    setLoading(false);
  };

  const signal = data?.droughtSignal;
  const severity = data?.droughtSeverityFactor ?? 0;
  const isDrought = severity > 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 text-white shadow-md overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-800">
        <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
          <Droplets size={20} />
          Indigenous Resilience Matcher
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Live NASA POWER agro-climatology → ranked open / patent-free cultivars for that
          point.
        </p>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="irm-zone"
              className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2"
            >
              Cultivation Zone
            </label>
            <select
              id="irm-zone"
              value={zoneIndex}
              onChange={(e) => setZoneIndex(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-emerald-500"
            >
              {ZONES.map((z, i) => (
                <option key={z.label} value={i}>
                  {z.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="irm-uplift"
              className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2"
            >
              Drought-risk scenario (optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="irm-uplift"
                type="range"
                min={0}
                max={100}
                step={5}
                value={uplift}
                disabled={!useScenario}
                onChange={(e) => setUplift(Number(e.target.value))}
                className="flex-1 accent-emerald-500 disabled:opacity-40"
              />
              <span className="text-sm font-bold text-emerald-300 w-14 text-right">
                +{uplift}%
              </span>
            </div>
            <label className="flex items-center gap-2 mt-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={useScenario}
                onChange={(e) => setUseScenario(e.target.checked)}
                className="accent-emerald-500"
              />
              Apply a hypothetical uplift on top of observed conditions
            </label>
          </div>
        </div>

        <button
          onClick={run}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Reading NASA POWER series…
            </>
          ) : (
            <>
              <Droplets size={18} /> Match indigenous seed
            </>
          )}
        </button>

        {useScenario && !loading && !hasRun && (
          <p className="text-[11px] text-amber-300/90 flex items-start gap-1.5">
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            The +{uplift}% uplift is a <strong>planning scenario you supply</strong>, not a
            forecast. NASA POWER reports observed agro-climatology and issues no
            probabilities; FloraNet does not invent one.
          </p>
        )}
      </div>
{/* Unavailable state — never silently blank */}
      {unavailable && (
        <div className="mx-6 mb-5 rounded-lg border border-amber-700/60 bg-amber-950/40 p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-semibold text-amber-200">
              No ranking issued — NASA POWER unavailable.
            </p>
            <p className="text-xs text-amber-300/80 mt-1">
              The backend returns HTTP 503 rather than ranking cultivars without a real
              observation, because recommending drought-tolerant seed on an invented
              signal would misdirect farmers during a drought.
            </p>
          </div>
        </div>
      )}

      {data && !unavailable && (
        <div className="px-6 pb-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Observed signal — deliberately distinct from the scenario card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`rounded-lg border p-4 ${
                signal?.available
                  ? isDrought
                    ? 'border-red-700/60 bg-red-950/30'
                    : 'border-emerald-700/60 bg-emerald-950/30'
                  : 'border-slate-700 bg-slate-800'
              }`}
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Observed signal · NASA POWER
              </p>
              {signal?.available ? (
                <>
                  <p className="text-2xl font-extrabold text-white mt-1">
                    SPEI {signal.index?.toFixed(2)}
                  </p>
                  <p
                    className={`text-sm font-semibold mt-0.5 ${
                      isDrought ? 'text-red-300' : 'text-emerald-300'
                    }`}
                  >
                    {signal.category}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">{signal.description}</p>
                  <p className="text-[10px] text-slate-500 mt-2">
                    {signal.windowMonths}-month water balance · {signal.monthsInReference}{' '}
                    reference months
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-300 mt-1">
                  Not computable — {signal?.reason}
                </p>
              )}
            </div>

            {data.scenarioIsCallerSupplied && (
              <div className="rounded-lg border border-amber-700/60 bg-amber-950/30 p-4">
                <p className="text-[10px] font-bold text-amber-300/80 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle size={11} /> Scenario applied
                </p>
                <p className="text-2xl font-extrabold text-amber-200 mt-1">
                  +{data.scenarioUpliftPct}%
                </p>
                <p className="text-[11px] text-amber-300/80 mt-1">
                  Caller-supplied hypothetical drought-risk uplift. The observed SPEI above
                  is unchanged and reported separately.
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800 pb-2 mb-3">
              <h3 className="text-sm font-bold text-white">
                Ranked open / indigenous cultivars
              </h3>
              <span className="text-[11px] text-slate-500">
                severity {severity.toFixed(2)}
                {data.scoring?.weights
                  ? ' · ' +
                    Object.entries(data.scoring.weights)
                      .map(([k, v]) => `${k} ${v.toFixed(2)}`)
                      .join(' ')
                  : ''}
              </span>
            </div>
            <div className="space-y-3">
              {data.rankedCandidates?.map((c: RankedCandidate, i: number) => (
                <CandidateCard key={c.id} candidate={c} rank={i + 1} />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-800/50 p-4">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
              <Info size={12} /> Method &amp; limits
            </p>
            <p className="text-[11px] text-slate-400 mt-1.5">{data.analysisMethod}</p>
            <p className="text-[11px] text-slate-400 mt-1.5">{data.scoring?.method}</p>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Trait source: {data.scoring?.traitSource}
</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              {data.limitations?.map((l, idx) => (
                <li key={idx} className="text-[11px] text-amber-200/80">
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function CandidateCard({ candidate, rank }: { candidate: RankedCandidate; rank: number }) {
  const c = candidate.components;
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-800/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-700 text-emerald-300 text-xs font-bold flex items-center justify-center">
            {rank}
          </span>
          <div>
            <p className="font-bold text-sm text-white">{candidate.name}</p>
            <p className="text-[11px] text-slate-400">
              {candidate.institution} · {candidate.country}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-extrabold text-emerald-300">
            {candidate.score.toFixed(1)}
          </p>
          <p className="text-[9px] text-slate-500 uppercase font-bold">score</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <TraitBar
          label="Drought"
          value={c.drought}
          icon={<Droplets size={11} />}
          barClass="bg-sky-400"
        />
        <TraitBar
          label="Heat"
          value={c.heat}
          icon={<ThermometerSun size={11} />}
          barClass="bg-orange-400"
        />
        <TraitBar
          label="Germ."
          value={c.germination}
          icon={<ShieldCheck size={11} />}
          barClass="bg-emerald-400"
        />
      </div>

      {candidate.openAccess && (
        <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-900/40 border border-emerald-800 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-300">
          Patent-free / open access
        </p>
      )}

      <ul className="mt-2 space-y-0.5">
        {candidate.whyRecommended.map((r, i) => (
          <li key={i} className="text-[11px] text-slate-400">
            • {r}
          </li>
        ))}
      </ul>

      {candidate.missingTraits?.length > 0 && (
        <p className="mt-1.5 text-[10px] text-amber-300/80">
          Not recorded in the registry: {candidate.missingTraits.join(', ')}. Left blank
          rather than estimated.
        </p>
      )}
    </div>
  );
}

function TraitBar({
  label,
  value,
  icon,
  barClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  barClass: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
        <span className="flex items-center gap-1">
          {icon}
          {label}
        </span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-700">
        <div className={`h-1.5 rounded-full ${barClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}