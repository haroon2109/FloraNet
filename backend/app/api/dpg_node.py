"""
DPG Node API Router — FloraNet
Serves REAL cross-border data via JSON-LD (AgriN schema).

  GET /schema     → the AgriN Open Data Schema itself (derived from these models)
  GET /openapi    → OpenAPI 3 document scoped to this node (derived from app.openapi())
  GET /outbreaks  → live NASA EONET natural-hazard events over BRICS nations
  GET /soc-tracker→ real World Bank WDI agri indicators + disclosed carbon estimate
  GET /models     → federated disease-model registry (share what was ingested)
  POST /ingest    → real ingestion registry (Supabase when configured, else in-memory)

No synthetic numbers are generated anywhere in this router. If an upstream
source is unreachable, the endpoint returns an explicit error payload. The only
computed figure (the SOC carbon estimate) carries its rate, method and basis
indicator so consumers can re-derive it.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.models.brics_schema import (
    CarbonEstimate,
    DiseaseModelCollectionLD,
    DiseaseModelIngest,
    DiseaseModelRecord,
    OutbreakCollectionLD,
    PestOutbreakVector,
    SOCTrackerCollectionLD,
    SOCTrackerSummary,
    SOCRegionStats,
)
from app.services import real_data

router = APIRouter()

# JSON-LD prefixes shared by every document this node emits.
AGRN_CONTEXT: Dict[str, str] = {
    "agrin": "https://floranet.ai/schema/agrin/term/",
    "fao": "http://aims.fao.org/aos/agrovoc/",
    "schema": "https://schema.org/",
    "geo": "http://www.w3.org/2003/01/geo/wgs84_pos#",
    "dcat": "http://www.w3.org/ns/dcat#",
    "void": "http://rdfs.org/ns/void#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
}

# Sequestration rate assumption applied to the real WDI arable-land datum.
# This is an ASSUMPTION, not an observation: it is published in every payload
# (summary.rate_t_c_per_ha + each CarbonEstimate.rate_t_c_per_ha) so consumers
# can re-derive or override the figure. 0.4 t C/ha/yr is the conventional
# planning default for mineral soils under improved management (IPCC-style
# Tier 1 cropland guidance); it is deliberately NOT presented as a measurement.
SOC_RATE_T_C_PER_HA = 0.4
SOC_RATE_BASIS = (
    "Disclosed planning assumption: 0.4 t C/ha/yr (IPCC-style Tier 1 default for "
    "mineral cropland under improved management). Applied to WDI arable land; "
    "re-derive with your own rate if your jurisdiction publishes one."
)


# ──────────────────────────────────────────────────────────────────────────────
# GET /schema — the AgriN Open Data Schema (derived from the live Pydantic models)
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/schema")
def get_agrin_schema() -> Dict[str, Any]:
    """
    **AgriN Open Data Schema (JSON-LD)** — the standardized contract this node
    publishes so cross-border institutions (ICAR, Embrapa, ARC …) can ingest and
    share localized disease models without vendor lock-in.

    Everything here is derived at request time from this process's own Pydantic
    models and APIRouter, so the manifest can never drift from the implementation:
    class properties come from `model_json_schema()` and the endpoint catalogue
    from `router.routes`.
    """
    classes = []
    for model in (
        DiseaseModelIngest,
        DiseaseModelRecord,
        DiseaseModelCollectionLD,
        PestOutbreakVector,
        OutbreakCollectionLD,
        CarbonEstimate,
        SOCRegionStats,
        SOCTrackerSummary,
        SOCTrackerCollectionLD,
    ):
        schema = model.model_json_schema()
        props = schema.get("properties") or {}
        required = set(schema.get("required") or [])
        title = schema.get("title") or model.__name__
        properties = []
        for name, spec in props.items():
            spec = spec if isinstance(spec, dict) else {}
            resolved = spec.get("type")
            if not resolved and isinstance(spec.get("anyOf"), list) and spec["anyOf"]:
                first = spec["anyOf"][0]
                resolved = first.get("type") if isinstance(first, dict) else None
            properties.append(
                {
                    "@id": f"agrin:{title}.{name}",
                    "name": name,
                    "required": name in required,
                    "type": resolved or "any",
                    "description": spec.get("description"),
                    "format": spec.get("format"),
                }
            )
        classes.append(
            {
                "@id": f"agrin:{title}",
                "@type": "rdfs:Class",
                "rdfs:comment": (schema.get("description") or "").strip(),
                "property_count": len(properties),
                "properties": properties,
            }
        )

    endpoints = [
        {
            "method": sorted(route.methods - {"HEAD", "OPTIONS"})[0]
            if (route.methods - {"HEAD", "OPTIONS"})
            else "GET",
            "path": f"/api/v1/dpg{route.path}",
            "summary": route.summary,
            "operation_id": route.operation_id,
        }
        for route in router.routes
        if getattr(route, "methods", None)
    ]

    return {
        "@context": AGRN_CONTEXT,
        "@type": "agrin:SchemaDefinition",
        "schema:name": "AgriN Open Data Schema",
        "schema:version": "1.0.0",
        "schema:license": "https://creativecommons.org/licenses/by/4.0/",
        "schema:dateCreated": datetime.utcnow().isoformat() + "Z",
        "agrin:alignedWith": [
            "FAO AGROVOC thesaurus",
            "W3C DCAT",
            "GODAN open-data metadata profile",
            "BRICS Agricultural Research Platform (BARP)",
        ],
        "agrin:intendedConsumers": [
            "ICAR — Indian Council of Agricultural Research",
            "Embrapa — Empresa Brasileira de Pesquisa Agropecuária",
            "Agricultural Research Council (South Africa)",
        ],
        "agrin:endpoints": endpoints,
        "agrin:classes": classes,
        "agrin:derivation": (
            "Generated from app.models.brics_schema + the live APIRouter — "
            "not a hand-maintained copy."
        ),
        "agrin:openapi": "/api/v1/dpg/openapi",
    }


# ──────────────────────────────────────────────────────────────────────────────
# GET /openapi — OpenAPI 3 document scoped to this DPG node
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/openapi")
def get_dpg_openapi() -> Dict[str, Any]:
    """
    **OpenAPI 3 description of this node only.**

    Derived from FastAPI's generated `app.openapi()` and filtered to the
    `/api/v1/dpg/*` paths, so an institution can codegen a client against the
    interoperability contract without wading through the rest of FloraNet.
    Paths are relative to the `servers` URL (`/api/v1/dpg`).
    """
    from app.main import app  # imported lazily: app.main imports this module

    full = app.openapi()
    prefix = "/api/v1/dpg"
    scoped: Dict[str, Any] = {}
    for path, operations in (full.get("paths") or {}).items():
        if path.startswith(prefix):
            scoped[path[len(prefix):] or "/"] = operations

    if not scoped:
        raise HTTPException(status_code=503, detail="No DPG operations found in OpenAPI spec")

    info = full.get("info") or {}
    return {
        "openapi": full.get("openapi", "3.0.2"),
        "info": {
            "title": "FloraNet AgriN Interoperability & Policy Node (DPG)",
            "version": info.get("version", "0.1.0"),
            "description": (
                "Standardized AgriN open-data endpoints for cross-border institutions "
                "to ingest and share localized disease models, transboundary outbreak "
                "vectors, and SOC / policy macro-analytics. Observations are served in "
                "their original units from cited public sources (NASA EONET, World Bank "
                "WDI); the SOC carbon figure is a disclosed derived estimate."
            ),
            "license": {
                "name": "CC-BY 4.0 (data)",
                "url": "https://creativecommons.org/licenses/by/4.0/",
            },
        },
        "servers": [{"url": prefix, "description": "AgriN DPG node"}],
        "paths": scoped,
        # The full component set is kept so no $ref dangles after filtering.
        "components": full.get("components") or {},
        "x-agrin-node": {
            "context": AGRN_CONTEXT,
            "schema": f"{prefix}/schema",
            "registry": f"{prefix}/models",
            "docs": "/docs",
        },
    }


# ──────────────────────────────────────────────────────────────────────────────
# GET /crop-stats — REAL national crop statistics (World Bank WDI, CC-BY 4.0)
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/crop-stats")
async def get_crop_stats():
    """
    Real national crop-production statistics for all five BRICS nations from
    the World Bank WDI v2 API (keyless, CC-BY 4.0):

      - cereal_yield_kg_ha    → AG.YLD.CREL.KG (cereal yield, kg per hectare)
      - fertilizer_intensity  → AG.CON.FERT.PT.ZS (fertilizer consumption,
                                % of fertilizer production)

    Each value carries its WDI data year. No synthetic values: if WDI has no
    datum for a country that field is null, and if none have data the endpoint
    returns 503.
    """
    countries = list(real_data.WB_ISO3.keys())
    try:
        yield_data = await real_data.world_bank_indicator(countries, "AG.YLD.CREL.KG")
        fert_data = await real_data.world_bank_indicator(
            countries, real_data.WB_INDICATORS["fertilizer_intensity"]
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"World Bank API unavailable: {exc}")

    stats = []
    for c in countries:
        y = yield_data.get(c)
        f = fert_data.get(c)
        if not y and not f:
            continue
        stats.append({
            "country": c,
            "iso3": real_data.WB_ISO3[c],
            "cereal_yield_kg_ha": (
                {"value": round(float(y["value"]), 1), "year": y["year"]} if y else None
            ),
            "fertilizer_intensity": (
                {"value": round(float(f["value"]), 1), "year": f["year"]} if f else None
            ),
        })

    if not stats:
        raise HTTPException(status_code=503, detail="World Bank returned no data for BRICS nations")

    return {
        "source": "World Bank WDI v2 (CC-BY 4.0)",
        "indicators": {
            "cereal_yield_kg_ha": "AG.YLD.CREL.KG",
            "fertilizer_intensity": "AG.CON.FERT.PT.ZS",
        },
        "stats": stats,
    }


# ──────────────────────────────────────────────────────────────────────────────
# GET /outbreaks — REAL live hazard events (NASA EONET, public domain)
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/outbreaks", response_model=OutbreakCollectionLD, response_model_by_alias=True)
async def get_outbreaks():
    """
    Live natural-hazard events (severe storms, droughts, wildfires, floods)
    currently open over BRICS nations, sourced from NASA EONET v3.

    Severity is derived from the event category and recency of observation —
    never randomized. Events are returned in their original units/coordinates.
    """
    try:
        events: List[dict] = real_data.eonet_brics_events(limit_per_country=8)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"NASA EONET unavailable: {exc}")

    vectors = [
        PestOutbreakVector(
            id=e["id"],
            pest_name=e["title"] or e["category"],
            latitude=e["lat"],
            longitude=e["lng"],
            severity=_severity_from_event(e),
            vector_direction=_direction_from_track(e),
            affected_crop=e["category"],
            origin_country=e["country"],
            date_observed=e.get("date"),
        )
        for e in events
    ]
    return OutbreakCollectionLD(data=vectors)


def _severity_from_event(event: dict) -> str:
    """Deterministic severity: category weight + how recent the observation is."""
    category = (event.get("category") or "").lower()
    weight = 1
    if any(w in category for w in ("severe storm", "drought", "wildfire")):
        weight = 3
    elif any(w in category for w in ("flood", "volcan", "landslide")):
        weight = 2
    date = event.get("date") or ""
    try:
        obs_day = datetime.fromisoformat(date.replace("Z", "+00:00"))
        age_days = (datetime.utcnow().replace(tzinfo=obs_day.tzinfo) - obs_day).days if obs_day.tzinfo else 7
    except ValueError:
        age_days = 7
    if weight >= 3 and age_days <= 2:
        return "critical"
    if weight >= 2 and age_days <= 4:
        return "high"
    if weight >= 2:
        return "medium"
    return "low"


def _direction_from_track(event: dict) -> str:
    """Compass bearing from the event's first to latest observation, if tracked."""
    return "Stationary"  # EONET v3 point feeds do not carry a track; do not invent one


# ──────────────────────────────────────────────────────────────────────────────
# GET /soc-tracker — REAL World Bank indicators (CC-BY 4.0) + disclosed estimate
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/soc-tracker", response_model=SOCTrackerCollectionLD, response_model_by_alias=True)
async def get_soc_tracker():
    """
    Real agricultural-intensity and land indicators per BRICS nation from the
    World Bank WDI v2 API, wrapped with regional macro-aggregates:

      - fertilizer_intensity_pct → AG.CON.FERT.PT.ZS (fertilizer consumption,
                                   % of production — synthetic-input intensity)
      - agri_land_pct            → AG.LND.AGRI.ZS (agricultural land, % of area)
      - arable_land_ha           → AG.LND.ARBL.HA (arable land, hectares)
      - carbon_estimate          → DERIVED: arable_land_ha × SOC_RATE_T_C_PER_HA,
                                   flagged `derived: true` with the rate, the exact
                                   method and the basis indicator in the payload.

    `data_vintage` carries the WDI data year(s) behind each row. No value is
    randomized; if WDI has no datum for a country the field is null, and if
    nothing has data the endpoint returns 503.
    """
    countries = list(real_data.WB_ISO3.keys())
    try:
        snapshot = await real_data.world_bank_agri_snapshot(countries)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"World Bank API unavailable: {exc}")

    arable_code = real_data.WB_INDICATORS["arable_land_ha"]
    stats: List[SOCRegionStats] = []
    for country in countries:
        snap = snapshot.get(country, {})
        fert = snap.get("fertilizer_intensity")
        agri = snap.get("agri_land_pct")
        arable = snap.get("arable_land_ha")
        if not (fert or agri or arable):
            continue

        arable_val = float(arable["value"]) if arable else None
        carbon: Optional[CarbonEstimate] = None
        if arable_val is not None:
            tonnes_c = arable_val * SOC_RATE_T_C_PER_HA
            carbon = CarbonEstimate(
                value_t_c_per_year=round(tonnes_c, 1),
                value_tco2e_per_year=round(tonnes_c * 44 / 12, 1),
                rate_t_c_per_ha=SOC_RATE_T_C_PER_HA,
                derived=True,
                method=f"{arable_code} {arable['year']} × {SOC_RATE_T_C_PER_HA} t C/ha/yr",
                basis_indicator=arable_code,
                rate_basis=SOC_RATE_BASIS,
            )

        years = [
            f"{label} {src['year']}"
            for label, src in (
                ("fertilizer", fert),
                ("agri-land", agri),
                ("arable", arable),
            )
            if src
        ]
        stats.append(
            SOCRegionStats(
                region=country,
                country=country,
                fertilizer_intensity_pct=round(float(fert["value"]), 1) if fert else None,
                agri_land_pct=round(float(agri["value"]), 1) if agri else None,
                arable_land_ha=arable_val,
                carbon_estimate=carbon,
                data_vintage=("WDI " + ", ".join(years)) if years else "No WDI data",
            )
        )

    if not stats:
        raise HTTPException(status_code=503, detail="World Bank returned no data for BRICS nations")

    def _mean(values: List[float]) -> Optional[float]:
        return round(sum(values) / len(values), 1) if values else None

    fert_vals = [s.fertilizer_intensity_pct for s in stats if s.fertilizer_intensity_pct is not None]
    agri_vals = [s.agri_land_pct for s in stats if s.agri_land_pct is not None]
    arable_vals = [s.arable_land_ha for s in stats if s.arable_land_ha is not None]
    carbon_vals = [
        s.carbon_estimate.value_t_c_per_year
        for s in stats
        if s.carbon_estimate is not None
    ]

    summary = SOCTrackerSummary(
        countries_reporting=len(stats),
        mean_fertilizer_intensity_pct=_mean(fert_vals),
        mean_agri_land_pct=_mean(agri_vals),
        total_arable_land_ha=round(sum(arable_vals), 0) if arable_vals else None,
        total_carbon_estimate_t_c_per_year=(
            round(sum(carbon_vals), 1) if carbon_vals else None
        ),
        rate_t_c_per_ha=SOC_RATE_T_C_PER_HA,
    )
    return SOCTrackerCollectionLD(summary=summary, data=stats)


# ──────────────────────────────────────────────────────────────────────────────
# POST /ingest — REAL registry (Supabase if configured, else in-process memory)
# ──────────────────────────────────────────────────────────────────────────────
INGESTED_MODELS: List[Dict[str, Any]] = []


@router.post("/ingest")
async def ingest_disease_model(payload: DiseaseModelIngest):
    """Register a shared disease model. Persists to Supabase when configured."""
    record = payload.model_dump()
    record["received_at"] = datetime.utcnow().isoformat() + "Z"

    try:
        from app.config import settings

        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            from supabase import create_client

            sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            resp = sb.table("disease_model_registry").insert(record).execute()
            registry_id = str(resp.data[0].get("id")) if resp.data else "supabase-accepted"
            storage = "supabase"
        else:
            INGESTED_MODELS.append(record)
            registry_id = f"mem-{len(INGESTED_MODELS):06d}"
            # `record` is the same dict that was just stored, so the receipt id
            # is written back into it — GET /models then returns it verbatim.
            record["registry_id"] = registry_id
            storage = "in-memory (SUPABASE_URL/KEY not configured)"
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Ingestion persistence failed: {exc}")

    return {
        "status": "success",
        "message": f"Disease model '{payload.model_name}' from {payload.institution} registered.",
        "registry_id": registry_id,
        "storage": storage,
    }


# ──────────────────────────────────────────────────────────────────────────────
# GET /models — read back the shared registry (the "share" half of ingest/share)
# ──────────────────────────────────────────────────────────────────────────────
def _registry_storage() -> tuple:
    """Resolve the registry backend. Returns (rows, storage_label)."""
    from app.config import settings

    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
        from supabase import create_client

        sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        resp = sb.table("disease_model_registry").select("*").limit(200).execute()
        return list(resp.data or []), "supabase"
    return list(INGESTED_MODELS), "in-memory (SUPABASE_URL/KEY not configured)"


def _to_record(row: Dict[str, Any]) -> DiseaseModelRecord:
    """Normalize a registry row (Supabase has extra id/created_at columns)."""
    return DiseaseModelRecord(
        model_name=row.get("model_name") or "Unnamed model",
        institution=row.get("institution") or "Unknown institution",
        target_pathogen=row.get("target_pathogen") or "unspecified",
        model_version=row.get("model_version") or "0.0",
        parameters_required=list(row.get("parameters_required") or []),
        endpoint_url=row.get("endpoint_url"),
        registry_id=(str(row.get("id")) if row.get("id") is not None else None)
        or row.get("registry_id"),
        received_at=row.get("received_at") or row.get("created_at"),
    )


@router.get("/models", response_model=DiseaseModelCollectionLD, response_model_by_alias=True)
async def list_disease_models():
    """
    **Federated disease-model registry** — the read side of `POST /ingest`.

    Cross-border institutions post localized disease models here and read the
    shared set back through this endpoint (JSON-LD `Dataset`), so the registry
    is a two-way exchange rather than a write-only sink.

    Storage is reported honestly: Supabase when `SUPABASE_URL`/`SUPABASE_KEY`
    are configured, otherwise the process-local list (which is empty after a
    restart — the payload says so via `storage` instead of pretending).
    """
    try:
        rows, storage = _registry_storage()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Disease-model registry unavailable: {exc}")

    records = [_to_record(r) for r in rows]
    # Most recent first when a timestamp is present; stable otherwise.
    records.sort(key=lambda r: r.received_at or "", reverse=True)
    return DiseaseModelCollectionLD(storage=storage, count=len(records), data=records)
