const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7880';

// Helper for resilient fetch with timeout.
// IMPORTANT: on failure this returns the provided fallback (usually null/[])
// so callers can render an explicit "unavailable" state — we never substitute
// fabricated numbers for live data.
async function resilientFetch<T>(endpoint: string, fallbackData: T, options?: RequestInit): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data as T;
  } catch {
    return fallbackData;
  }
}

// 1. Farm Metrics (live: Open-Meteo + SoilGrids + NASA EONET). null when backend unreachable.
export async function fetchFarmMetrics(lat?: number, lng?: number) {
  const qs = lat != null && lng != null ? `?lat=${lat}&lng=${lng}` : '';
  return await resilientFetch<Record<string, any> | null>(`/api/v1/farm/metrics${qs}`, null);
}

// 2. Field Telemetry (requires a registered farm/plot on the backend). Empty registry when none.
export async function fetchFieldsTelemetry(): Promise<any[]> {
  return await resilientFetch<any[]>('/api/v1/farm/fields', []);
}

// 2b. Field-level agronomy recommendations derived from live feeds. null when unreachable.
export async function fetchRecommendations(lat?: number, lng?: number, crop?: string) {
  const params = new URLSearchParams();
  if (lat != null) params.set('lat', String(lat));
  if (lng != null) params.set('lng', String(lng));
  if (crop) params.set('crop', crop);
  return await resilientFetch<any[] | null>(`/api/v1/farm/recommendations?${params}`, null);
}

// 3. Soil Advisory (RAG + local Ollama LLM pipeline with live Open-Meteo readings)
//    Backend: GET /api/v1/soil/advisory?lat=&lng=&soil_type=&current_crop=&country=
export interface SoilAdvisory {
  advisory_id?: string;
  location?: { lat: number; lng: number; country: string };
  soil_profile?: { type: string; live_moisture_pct: number | null; temp_c: number | null; available?: boolean };
  rotation_plan?: Array<{
    year: number;
    kharif_rabi: string;
    rationale: string;
    n_saving_kg_acre: number;
    soc_gain_pct: number;
  }>;
  soc_3yr_target_pct?: number;
  carbon_credit_t_co2e_acre_yr?: number;
  pest_management?: string;
  water_advisory?: string;
  input_cost_reduction_pct?: number;
  sources?: string[];
  error?: string;
  _note?: string;
}

export async function fetchSoilAdvisory(
  lat: number,
  lng: number,
  soilType: string,
  currentCrop: string,
  country: string
): Promise<SoilAdvisory | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    soil_type: soilType,
    current_crop: currentCrop,
    country,
  });

  return await resilientFetch<SoilAdvisory | null>(`/api/v1/soil/advisory?${params}`, null);
}

// 3b. Live soil moisture/temperature readings (Open-Meteo, no API key needed)
//     Backend: GET /api/v1/soil/live?lat=&lng=
export async function fetchLiveSoil(lat: number, lng: number) {
  return await resilientFetch<Record<string, any> | null>(
    `/api/v1/soil/live?lat=${lat}&lng=${lng}`,
    null
  );
}

// 4. Satellite Regenerative Plan Scan (async Celery task)
//    Backend: GET /api/v1/satellite/advisory?lat=&lon=&soil_type=
//    Returns { task_id, status } — poll /api/v1/tasks/{task_id} for the result.
export async function triggerSatelliteScan(lat: number, lon: number, soilType = 'Unknown') {
  return await resilientFetch<{ task_id: string; status: string } | null>(
    `/api/v1/satellite/advisory?lat=${lat}&lon=${lon}&soil_type=${encodeURIComponent(soilType)}`,
    null
  );
}

// 4b. Poll a Celery task's status/result
//     Backend: GET /api/v1/tasks/{task_id}
export async function fetchTaskStatus(taskId: string) {
  return await resilientFetch<{ task_id: string; status: string; result: any } | null>(
    `/api/v1/tasks/${encodeURIComponent(taskId)}`,
    null
  );
}

// 5. DPG Export — real World Bank agri indicators as JSON-LD
//    Backend: GET /api/v1/dpg/soc-tracker
export async function exportDPGMetadata() {
  return await resilientFetch<Record<string, any> | null>(`/api/v1/dpg/soc-tracker`, null);
}

// 5b. Real transboundary hazard events (NASA EONET via backend)
//     Backend: GET /api/v1/dpg/outbreaks
export async function fetchOutbreakEvents() {
  return await resilientFetch<{ data?: any[] } | null>(`/api/v1/dpg/outbreaks`, null);
}

// 5c. Real national crop statistics for the five BRICS nations
//     (World Bank WDI via backend: cereal yield + fertilizer intensity)
//     Backend: GET /api/v1/dpg/crop-stats
export async function fetchCropStats() {
  return await resilientFetch<{
    source: string;
    indicators: Record<string, string>;
    stats: Array<{
      country: string;
      iso3: string;
      cereal_yield_kg_ha: { value: number; year: string } | null;
      fertilizer_intensity: { value: number; year: string } | null;
    }>;
  } | null>(`/api/v1/dpg/crop-stats`, null);
}

// 5d. AgriN Open Data Schema — self-describing JSON-LD manifest derived by the
//     backend from its own Pydantic models + APIRouter (never hand-maintained).
//     Backend: GET /api/v1/dpg/schema
export async function fetchDpgSchema() {
  return await resilientFetch<Record<string, any> | null>(`/api/v1/dpg/schema`, null);
}

// 5e. OpenAPI 3 document scoped to the DPG node (for institutional codegen).
//     Backend: GET /api/v1/dpg/openapi
export async function fetchDpgOpenApi() {
  return await resilientFetch<Record<string, any> | null>(`/api/v1/dpg/openapi`, null);
}

export interface DpgModelRecord {
  model_name: string;
  institution: string;
  target_pathogen: string;
  model_version: string;
  parameters_required: string[];
  endpoint_url: string | null;
  registry_id: string | null;
  received_at: string | null;
}

// 5f. Federated disease-model registry — the read side of POST /api/v1/dpg/ingest.
//     `storage` reports Supabase vs. in-process memory so the UI never implies
//     durability the backend does not have.
//     Backend: GET /api/v1/dpg/models
export async function fetchDpgModels() {
  return await resilientFetch<{
    data?: DpgModelRecord[];
    count?: number;
    storage?: string;
  } | null>(`/api/v1/dpg/models`, null);
}

// 5g. SOC & Policy Tracker — real WDI indicators + regional macro-aggregates.
//     `carbon_estimate` is always a DERIVED figure (`derived: true`) carrying its
//     own rate/method, never a measurement.
//     Backend: GET /api/v1/dpg/soc-tracker
export interface SocCarbonEstimate {
  value_t_c_per_year: number;
  value_tco2e_per_year: number;
  rate_t_c_per_ha: number;
  derived: boolean;
  method: string;
  basis_indicator: string;
  rate_basis: string;
}

export interface SocRegionRow {
  region: string;
  country: string;
  fertilizer_intensity_pct: number | null;
  agri_land_pct: number | null;
  arable_land_ha: number | null;
  carbon_estimate: SocCarbonEstimate | null;
  data_vintage: string;
}

export interface SocTrackerPayload {
  data?: SocRegionRow[];
  summary?: {
    countries_reporting: number;
    mean_fertilizer_intensity_pct: number | null;
    mean_agri_land_pct: number | null;
    total_arable_land_ha: number | null;
    total_carbon_estimate_t_c_per_year: number | null;
    rate_t_c_per_ha: number;
  };
  source?: string;
}

export async function fetchSocTracker() {
  return await resilientFetch<SocTrackerPayload | null>(`/api/v1/dpg/soc-tracker`, null);
}

// 6. Regional commodity benchmark prices (real CBOT/ICE futures converted at live FX)
//     Backend: GET /api/v1/farm/mandi-spot?country=&currency=
//     Returns { timestamp, currency, commodities: [{crop, price, market, trend, direction}] }
export async function fetchBRICSExchangeRates(currency = 'INR'): Promise<any[]> {
  const data = await resilientFetch<{
    timestamp: string;
    currency: string;
    commodities: any[];
  } | null>(`/api/v1/farm/mandi-spot?currency=${encodeURIComponent(currency)}`, null);

  return data?.commodities ?? [];
}

// 6b. Live weather + 7-day forecast (Open-Meteo via backend)
export async function fetchWeatherTelemetry(lat?: number, lng?: number) {
  const qs = lat != null && lng != null ? `?lat=${lat}&lng=${lng}` : '';
  return await resilientFetch<Record<string, any> | null>(`/api/v1/farm/weather-telemetry${qs}`, null);
}

// 6d. Real RAG corpus statistics (document count actually indexed by FAISS)
export async function fetchCorpusStats() {
  return await resilientFetch<{
    document_count: number;
    indexed: boolean;
    by_source: string[];
    note: string;
  } | null>(`/api/v1/farm/corpus-stats`, null);
}

// 6c. Latest real Sentinel-2 scene metadata (Copernicus catalogue via backend)
export async function fetchSentinel2Scene(lat: number, lng: number) {
  return await resilientFetch<{
    lat: number;
    lng: number;
    scene: { scene_id: string; tile: string; sensing_time: string; source: string } | null;
    note?: string;
  } | null>(`/api/v1/soil/sentinel2?lat=${lat}&lng=${lng}`, null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Agri-Kitchen — verified farm-made bio-input formulations (Sustainability)
// ─────────────────────────────────────────────────────────────────────────────
export interface AgriKitchenIngredient {
  name: string;
  quantity: string;
  local: boolean;
  source_hint: string;
}

export interface AgriKitchenSustainability {
  score: number;
  local_share: number | null;
  import_avoid: number | null;
  basis: string;
}

export interface AgriKitchenRecipe {
  id: string;
  name: string;
  local_name: string;
  category: string;
  pillar: string;
  targets: string[];
  countries: string[];
  validated_in: string[];
  validation_note: string;
  batch: string;
  prep_time: string;
  shelf_life: string;
  ingredients: AgriKitchenIngredient[];
  steps: string[];
  application: string;
  dose: string;
  targets_crops: string[];
  mechanism: string;
  sustainability: string;
  source: string;
  citation: string;
  locally_validated: boolean;
  sustainability_metrics: AgriKitchenSustainability;
  relevance: number;
  spoken_script: string;
}

export interface AgriKitchenResponse {
  records: AgriKitchenRecipe[];
  pillar: string;
  count: number;
  country: string | null;
  problem: string | null;
  basis: string;
}

/**
 * Fetch verified bio-input recipes for the farmer's region and problem.
 * Returns null when the backend is unreachable, so the UI can say so rather
 * than falling back to invented recipes.
 */
export async function fetchAgriKitchen(
  country?: string,
  problem?: string,
  limit = 3,
): Promise<AgriKitchenResponse | null> {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (country) qs.set('country', country);
  if (problem) qs.set('problem', problem);
  return await resilientFetch<AgriKitchenResponse | null>(
    `/api/v1/agrin/agri-kitchen?${qs.toString()}`,
    null,
  );
}


// 7. Field Irrigation Mutation (logged on backend; physical actuation needs a gateway)
export async function mutateFieldIrrigation(fieldId: string, active: boolean) {
  return await resilientFetch<{ success: boolean; logged?: any } | null>(
    '/api/v1/farm/irrigation/toggle',
    null,
    {
      method: 'POST',
      body: JSON.stringify({ field_id: fieldId, active }),
    }
  );
}

// 8. Alert Resolution Mutation
export async function mutateResolveAlert(alertId: string) {
  return await resilientFetch<{ success: boolean; logged?: any } | null>(
    '/api/v1/farm/alerts/resolve',
    null,
    {
      method: 'POST',
      body: JSON.stringify({ alert_id: alertId }),
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 9. Regenerative Bio-Input Prescription Engine
//    Backend: GET /api/v1/regenerative/remedies | /companion-planting | /prescription
//    All remedies/companion strategies are CITED reference protocols
//    (ICAR / Embrapa / ARC / extension practice); live tailoring values come
//    from Open-Meteo + ISRIC SoilGrids. ai_narrative is null when the local
//    Ollama model is down — never a canned answer.
// ────────────────────────────────────────────────────────────────────────────

export interface BioRemedy {
  id: string;
  name: string;
  category: string;
  targets: string[];
  form: string;
  protocol: string;
  mechanism: string;
  restores_microbiota: boolean;
  source: string;
  citation: string;
  tailored_notes?: string[];
}

export interface CompanionStrategy {
  id: string;
  name: string;
  targets: string[];
  main_crops: string[];
  strategy: string;
  prevention_note: string;
  spacing: string;
  source: string;
  citation: string;
}

export interface RegenerativePrescription {
  prescription_id: string;
  generated_at: string;
  inputs: {
    crop?: string | null;
    problems: string[];
    live_moisture_pct: number | null;
    live_temp_c: number | null;
    soil_ph: number | null;
    soil_soc_pct: number | null;
    live_data_available: boolean;
  };
  bio_remedies: BioRemedy[];
  companion_plantings: CompanionStrategy[];
  monitoring: string[];
  sources: string[];
  data_basis: string;
  ai_narrative: string | null;
  _note?: string | null;
}

export async function fetchRegenerativeRemedies(crop?: string, targets?: string) {
  const params = new URLSearchParams();
  if (crop) params.set('crop', crop);
  if (targets) params.set('targets', targets);
  return await resilientFetch<
    | null
    | {
        remedies: BioRemedy[];
        known_problem_tags: Record<string, string>;
        data_basis: string;
      }
  >(`/api/v1/regenerative/remedies?${params}`, null);
}

export async function fetchCompanionPlanting(crop?: string, targets?: string) {
  const params = new URLSearchParams();
  if (crop) params.set('crop', crop);
  if (targets) params.set('targets', targets);
  return await resilientFetch<
    | null
    | {
        strategies: CompanionStrategy[];
        data_basis: string;
      }
  >(`/api/v1/regenerative/companion-planting?${params}`, null);
}

export async function fetchRegenerativePrescription(
  crop: string,
  problem: string,
  lat?: number,
  lng?: number
): Promise<RegenerativePrescription | null> {
  const params = new URLSearchParams({ crop, problem });
  if (lat != null && lng != null) {
    params.set('lat', String(lat));
    params.set('lng', String(lng));
  }
  return await resilientFetch<RegenerativePrescription | null>(
    `/api/v1/regenerative/prescription?${params}`,
    null
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 10. Geospatial Soil Health & Regenerative Planner
//     Backend: GET /api/v1/geospatial/telemetry | /rotation | /microclimate
//     Satellite NDVI/EVI (MODIS) + root-zone moisture (SMAP) are derived by
//     inverting official NASA GIBS colormaps (public domain). The Soil
//     Degradation Index is a deterministic screening heuristic over those
//     real inputs — never a lab value.
// ────────────────────────────────────────────────────────────────────────────

export interface SatelliteSeries {
  layer: string;
  palette: string;
  unit: string;
  anchor_date: string;
  series: Array<{ date: string; value: number | null }>;
  mean: number;
  min: number;
  max: number;
  std: number;
  trend_per_period: number;
  samples_resolved: number;
  samples_requested: number;
  pixel_size_m?: number;
  source: string;
}

export interface GeospatialTelemetry {
  timestamp: string;
  location: { lat: number; lng: number };
  vegetation: {
    ndvi?: SatelliteSeries;
    evi?: SatelliteSeries;
    errors?: Record<string, string>;
  };
  moisture: {
    smap_root_zone?: SatelliteSeries | null;
    errors?: Record<string, string>;
  };
  soilgrids: { soc_percent?: number; ph?: number; texture_class?: string } | null;
  live_weather: {
    soil_moisture_pct: number | null;
    soil_temp_c: number | null;
    current_temp: number | null;
    condition: string | null;
  };
  soil_degradation: {
    soil_degradation_index: number;
    band: string;
    scale: string;
    components: Record<string, { available?: boolean; weight?: number; factor?: number; mean?: number; mean_m3m3?: number; soc_percent?: number }>;
    live_open_meteo_soil_moisture_pct: number | null;
    inputs_used: string[];
  };
  errors: Record<string, string> | null;
  sources: string[];
}

export interface RotationPhaseData {
  phase_number: number;
  season: string;
  recommended_crop: string;
  justification: string;
  estimated_duration_days: number;
  role: string;
}

export interface RotationPlanData {
  plan_origin: 'local-llm-synthesis' | 'deterministic-knowledge-base';
  overview: string;
  phases: RotationPhaseData[];
  estimated_soc_improvement_percent: number | null;
  n_saving_kg_acre: number | null;
  sources: string[];
}

export interface MicroclimateAlertData {
  alert_type: string;
  severity: string;
  trigger_value: string | null;
  window: string | null;
  actionable_prep_steps: string[];
  soil_context: string | null;
}

export async function fetchGeospatialTelemetry(lat: number, lng: number, periods = 12) {
  return await resilientFetch<GeospatialTelemetry | null>(
    `/api/v1/geospatial/telemetry?lat=${lat}&lng=${lng}&periods=${periods}`,
    null
  );
}

export async function fetchRotationPlan(lat: number, lng: number, crop: string, pastYields = '') {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng), crop });
  if (pastYields) params.set('past_yields', pastYields);
  return await resilientFetch<{ plan: RotationPlanData; inputs: Record<string, unknown>; errors: Record<string, string> | null } | null>(
    `/api/v1/geospatial/rotation?${params}`,
    null
  );
}

export async function fetchMicroclimateAlerts(lat: number, lng: number) {
  return await resilientFetch<
    | null
    | {
        soil_moisture_pct: number | null;
        alerts: MicroclimateAlertData[];
        no_alerts_note: string | null;
      }
  >(`/api/v1/geospatial/microclimate?lat=${lat}&lng=${lng}`, null);
}

// ────────────────────────────────────────────────────────────────────────────
// 11. Open data source integrations (keyless, per the FloraNet data charter)
//     - ERA5-Land multi-depth soil profile (Open-Meteo Archive, 0-7/7-28cm)
//     - Copernicus STAC Sentinel-2 scenes (red-edge assets flagged for NDRE)
//     - PlantVillage open-dataset grounding (diagnosis vocabulary + provenance)
// ────────────────────────────────────────────────────────────────────────────

export interface Era5SoilProfile {
  source: string;
  days: number;
  bands: {
    '0_7cm'?: { soil_moisture_m3m3: number | null };
    '7_28cm'?: { soil_moisture_m3m3: number | null; soil_temp_c: number | null };
  };
}

export interface StacScene {
  scene_id: string;
  datetime: string;
  cloud_cover_pct: number | null;
  platform: string | null;
  has_red_edge_bands: boolean;
  red_edge_assets: string[];
  ndre_data_available: boolean;
  asset_count: number;
  stac_endpoint: string;
}

export interface SoilGridsBand {
  soc_percent?: number;
  ph?: number;
  nitrogen_percent?: number;
  clay_g_kg?: number;
  sand_g_kg?: number;
}

export async function fetchEra5SoilProfile(lat: number, lng: number, days = 7) {
  return await resilientFetch<Era5SoilProfile | null>(
    `/api/v1/soil/profile?lat=${lat}&lng=${lng}&days=${days}`,
    null
  );
}

export async function fetchSoilGridsProfile(lat: number, lng: number) {
  return await resilientFetch<
    | null
    | {
        source: string;
        bands: Record<string, SoilGridsBand>;
        errors: Record<string, string>;
        bands_returned: string[];
      }
  >(`/api/v1/soil/soilgrids-profile?lat=${lat}&lng=${lng}`, null);
}

export async function fetchStacScenes(lat: number, lng: number, days = 21) {
  return await resilientFetch<
    | null
    | {
        count: number;
        scenes: StacScene[];
        note: string;
      }
  >(`/api/v1/soil/stac-scenes?lat=${lat}&lng=${lng}&days=${days}`, null);
}

export interface PlantVillageGrounding {
  dataset: {
    name: string;
    citation: string;
    image_count: number;
    crop_species: number;
    class_labels: number;
    canonical_repo: string;
    mirrors: string[];
    available: boolean;
    repo?: string;
    stars?: number;
    error?: string;
  };
  class_count: number;
  sample_classes: string[];
  role: string;
}

export async function fetchDiagnosisGrounding() {
  return await resilientFetch<PlantVillageGrounding | null>(
    `/api/v1/doctor/grounding`,
    null
  );
}
