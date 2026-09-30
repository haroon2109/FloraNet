/**
 * AgriN Seed Lineage & Carbon Services — FloraNet
 *
 * Clients for the two AgriN pillar-4 endpoints:
 *   GET /api/v1/agrin/carbon-metadata   → cover-crop / green-manure carbon metadata
 *   GET /api/v1/agrin/resilience-match  → ranked indigenous seed response to a signal
 *
 * Both follow the existing `farmApi.resilientFetch` contract: on failure this
 * returns the supplied fallback (null / []) so the UI can render an explicit
 * "unavailable" state. We never substitute fabricated numbers for live data —
 * a made-up drought score or a made-up t C/ha figure is worse than no figure,
 * because a farmer will act on it.
 */

import { getApiBaseUrl } from '@/lib/apiConfig';

async function resilientFetch<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      signal: controller.signal,
      headers: { Accept: 'application/ld+json' },
    });

    clearTimeout(timeoutId);
    if (!res.ok) {
      // A 503 from /resilience-match is a deliberate refusal to rank without a
      // real observation, so the status is preserved for the caller to explain
      // rather than being flattened into "no data".
      const detail = await res.json().catch(() => null);
      throw new Error(
        (detail && typeof detail.detail === 'string' && detail.detail) ||
          `HTTP ${res.status}`
      );
    }
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export interface DroughtSignal {
  available: boolean;
  index?: number | null;
  category?: string;
  description?: string;
  reason?: string;
  windowMonths?: number;
  referenceMeanMm?: number;
  referenceStdMm?: number;
  latestAccumulatedBalanceMm?: number;
  monthsInReference?: number;
  source?: string;
}

export interface RankedCandidate {
  id: string;
  name: string;
  origin?: string;
  country?: string;
  institution?: string;
  accessionNumber?: string | null;
  openAccess: boolean;
  score: number;
  components: { drought: number; heat: number; germination: number; openAccess: number };
  contributions: Record<string, number>;
  missingTraits: string[];
  whyRecommended: string[];
  traitsAreReferenceData: boolean;
}

export interface ResilienceMatchResponse {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  observedAt?: string;
  analysisMethod?: string;
  droughtSignal?: DroughtSignal;
  scenarioUpliftPct?: number | null;
  scenarioIsCallerSupplied?: boolean;
  droughtSeverityFactor?: number;
  scoring?: { method?: string; weights?: Record<string, number>; traitSource?: string };
  rankedCandidates: RankedCandidate[];
  limitations: string[];
  poolSize?: number;
}

export interface Range {
  low: number;
  high: number;
}

export interface CarbonProfile {
  id: string;
  name: string;
  description?: string;
  cropRole?: string;
  institutionCode?: string;
  institutionRef?: string;
  isoCountryCode?: string;
  validatedInSystem?: string;
  fixesNitrogen?: boolean;
  additionalBenefits: string[];
  biomassDryMatterKgPerHaPerCycle?: Range;
  biomassCarbonInputKgPerHaPerCycle?: (Range & { dryMatterCarbonFraction?: Range }) | null;
  socStockChangeTCPerHaPerYear?: Range;
  socStockChangeTCO2ePerHaPerYear?: Range;
  measurementDepthCm?: number;
  accountingMethod?: string;
  citation?: string;
  creditClaimable: boolean;
  derived: boolean;
  isReference: boolean;
  creditReadiness: string[];
}

export interface CarbonMetadataResponse {
  records: CarbonProfile[];
  count: number;
  disclaimer: string;
}

/**
 * Ranked indigenous/patent-free cultivars for a point.
 *
 * `scenarioUpliftPct` models a hypothetical outlook ("30% higher chance of
 * drought"). It is a PLANNING SCENARIO supplied by the caller, never a forecast:
 * NASA POWER reports observed agro-climatology and issues no probabilities, so
 * the UI must present it as such.
 */
export async function fetchResilienceMatch(params: {
  lat: number;
  lng: number;
  scenarioUpliftPct?: number | null;
  countries?: string;
  limit?: number;
}): Promise<ResilienceMatchResponse | null> {
  const q = new URLSearchParams({ lat: String(params.lat), lng: String(params.lng) });
  if (params.scenarioUpliftPct != null) {
    q.set('scenarioUpliftPct', String(params.scenarioUpliftPct));
  }
  if (params.countries) q.set('countries', params.countries);
  if (params.limit) q.set('limit', String(params.limit));
  return resilientFetch<ResilienceMatchResponse | null>(
    `/api/v1/agrin/resilience-match?${q.toString()}`,
    null
  );
}

/** Carbon-sequestration metadata for indigenous cover crops and green manures. */
export async function fetchCarbonMetadata(params?: {
  country?: string;
  fixesNitrogen?: boolean;
}): Promise<CarbonMetadataResponse | null> {
  const q = new URLSearchParams();
  if (params?.country) q.set('country', params.country);
  if (params?.fixesNitrogen != null) q.set('fixesNitrogen', String(params.fixesNitrogen));
  const qs = q.toString();
  return resilientFetch<CarbonMetadataResponse | null>(
    `/api/v1/agrin/carbon-metadata${qs ? `?${qs}` : ''}`,
    null
  );
}