"""
Soil Advisory API Router — FloraNet
GET /api/v1/soil/advisory?lat=&lng=&soil_type=&current_crop=&country=
GET /api/v1/soil/live    → Real-time Open-Meteo soil readings
GET /api/v1/soil/schema  → AgriN JSON-LD schema (DPG interoperability)
GET /api/v1/soil/sentinel2 → Real Copernicus Sentinel-2 acquisition metadata
GET /api/v1/soil/ndvi     → Real per-pixel Sentinel-2 NDVI from open COGs
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from app.services.rag import rag_service
from app.services import real_data

router = APIRouter()


# ──────────────────────────────────────────────────────────────────────────────
# Soil Advisory (Full RAG + Gemini Pipeline)
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/advisory")
async def get_soil_advisory(
    lat: float = Query(18.5204, description="Latitude of field"),
    lng: float = Query(73.8567, description="Longitude of field"),
    soil_type: str = Query("Black Cotton (Vertisol)", description="Soil classification"),
    current_crop: str = Query("Maize", description="Current season crop"),
    country: str = Query("India", description="BRICS nation"),
):
    """
    **FloraNet RAG Soil Advisory**

    Gemini-generated 3-year crop rotation plan grounded in verified
    ICAR / Embrapa / ARC / CAAS manuals, enriched with live Open-Meteo soil
    readings and real ISRIC SoilGrids properties. Without GEMINI_API_KEY the
    endpoint returns the real live readings with `rotation_plan: []` and an
    explanatory `_note` — never a fabricated plan.
    """
    advisory = await rag_service.get_soil_advisory(
        lat=lat,
        lng=lng,
        soil_type=soil_type,
        current_crop=current_crop,
        country=country,
    )
    return JSONResponse(content=advisory)


# ──────────────────────────────────────────────────────────────────────────────
# Live Open-Meteo Soil Readings (+ real SoilGrids properties)
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/live")
async def get_live_soil_readings(
    lat: float = Query(18.5204),
    lng: float = Query(73.8567),
):
    """
    Real-time soil moisture/temperature (Open-Meteo) and laboratory-modeled
    soil properties (ISRIC SoilGrids). No synthetic fill values.
    """
    try:
        data = await real_data.open_meteo_forecast(lat, lng)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Open-Meteo unavailable: {exc}")

    hourly = data.get("hourly", {})

    def _first(key: str):
        vals = hourly.get(key) or []
        return vals[0] if vals else None

    m01, m13, m39 = _first("soil_moisture_0_to_1cm"), _first("soil_moisture_1_to_3cm"), _first("soil_moisture_3_to_9cm")
    t0, t6, et0 = _first("soil_temperature_0cm"), _first("soil_temperature_6cm"), _first("evapotranspiration")

    layers = {
        "0_1cm": {"moisture_pct": round(m01 * 100, 2) if m01 is not None else None,
                  "temp_c": round(t0, 1) if t0 is not None else None},
        "1_3cm": {"moisture_pct": round(m13 * 100, 2) if m13 is not None else None},
        "3_9cm": {"moisture_pct": round(m39 * 100, 2) if m39 is not None else None,
                  "temp_c": round(t6, 1) if t6 is not None else None},
        "evapotranspiration_mm": round(et0, 2) if et0 is not None else None,
    }

    result = {
        "lat": lat,
        "lng": lng,
        "source": "Open-Meteo API (CC-BY 4.0)",
        "layers": layers,
    }

    # Attach real SoilGrids properties (SOC, pH, texture) — optional enrichment
    try:
        soil = real_data.soilgrids_summary(await real_data.soilgrids_point(lat, lng))
        result["soilgrids"] = soil
    except Exception as exc:
        result["soilgrids"] = {"available": False, "error": str(exc)}

    return JSONResponse(content=result)


# ──────────────────────────────────────────────────────────────────────────────
# ERA5-Land multi-depth soil profile (Open-Meteo Archive, spec-exact bands)
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/profile")
async def get_soil_profile(
    lat: float = Query(18.5204),
    lng: float = Query(73.8567),
    days: int = Query(7, ge=1, le=92),
):
    """
    Real ERA5-Land reanalysis soil profile from the Open-Meteo Archive API:
    mean volumetric moisture for the canonical 0-7cm and 7-28cm bands over the
    last `days` days (hourly observations, m³/m³), plus the 7-28cm soil
    temperature. Keyless, CC-BY 4.0.
    """
    try:
        profile = await real_data.era5_soil_profile(lat, lng, days=days)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Open-Meteo Archive unavailable: {exc}")
    return JSONResponse(content=profile)


# ──────────────────────────────────────────────────────────────────────────────
# ISRIC SoilGrids multi-depth property profile
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/soilgrids-profile")
async def get_soilgrids_profile(
    lat: float = Query(18.5204),
    lng: float = Query(73.8567),
):
    """
    Real ISRIC SoilGrids 2.0 properties across depth bands (0-5, 5-15,
    15-30, 30-60 cm): SOC, pH, clay, sand, nitrogen density. Bands that fail
    or have no coverage are reported in `errors` — a partial profile is
    returned with explicit gaps, never filled.
    """
    try:
        profile = await real_data.soilgrids_multidepth(lat, lng)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"SoilGrids unavailable: {exc}")
    return JSONResponse(content=profile)


# ──────────────────────────────────────────────────────────────────────────────
# Real Sentinel-2 scene metadata (Copernicus catalogue)
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/sentinel2")
async def get_sentinel2_scene(
    lat: float = Query(18.5204),
    lng: float = Query(73.8567),
):
    """
    Latest real Sentinel-2 L2A acquisition covering the point, from the
    Copernicus Data Space catalogue (open data). Returns actual scene id,
    sensing time and MGRS tile. Pixel-level NDVI requires authenticated raster
    access and is therefore not fabricated here.
    """
    try:
        scene = await real_data.sentinel2_latest_pass(lat, lng)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Copernicus catalogue unavailable: {exc}")
    if not scene:
        return {"lat": lat, "lng": lng, "scene": None,
                "note": "No Sentinel-2 L2A scene found in the last 30 days for this point."}
    return {"lat": lat, "lng": lng, "scene": scene}


# ──────────────────────────────────────────────────────────────────────────────
# Copernicus STAC search — real Sentinel-2 L2A scenes + red-edge assets
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/stac-scenes")
async def get_stac_scenes(
    lat: float = Query(18.5204),
    lng: float = Query(73.8567),
    days: int = Query(21, ge=1, le=90),
):
    """
    Real Sentinel-2 L2A scenes covering the point from the Copernicus Data
    Space **STAC API** (open, keyless): scene ids, sensing datetimes, cloud
    cover and the per-band COG asset list — including the red-edge bands
    (B05/B06/B07/B8A) that NDRE requires. Index math from pixels is NOT
    performed here; the payload states what is openly available instead.
    """
    try:
        scenes = await real_data.sentinel2_stac_scenes(lat, lng, days=days)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Copernicus STAC unavailable: {exc}")
    return {
        "lat": lat,
        "lng": lng,
        "count": len(scenes),
        "scenes": scenes,
        "note": (
            "Open STAC search results. Multi-spectral band assets (incl. red-edge "
            "for NDRE) are listed; per-pixel index computation requires reading "
            "the COGs and is not fabricated here."
        ),
    }


@router.get("/ndvi")
async def get_sentinel2_ndvi(
    lat: float = Query(18.5204),
    lng: float = Query(73.8567),
):
    """
    **Real per-pixel Sentinel-2 NDVI** computed from the open Sentinel-2 L2A
    COG band assets (red + NIR, 10 m) served keylessly by AWS Earth Search.
    Pixels are read over HTTP Range requests, cloud/shadow/no-data masked with
    the 20 m SCL band, and NDVI = (NIR − RED) / (NIR + RED) aggregated over a
    5.12 km window. Values below raise an explicit 503 instead of a placeholder.
    """
    try:
        from app.services import sentinel2_cog
        result = await sentinel2_cog.ndvi_point(lat, lng)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Sentinel-2 COG NDVI unavailable: {exc}")
    return {"lat": lat, "lng": lng, **result}


# ──────────────────────────────────────────────────────────────────────────────
# AgriN JSON-LD Schema (DPG Digital Public Good Interoperability)
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/schema")
def get_agrin_jsonld_schema():
    """
    **AgriN JSON-LD Schema** — Standardized DPG interoperability endpoint.

    Exposes FloraNet's SoilAdvisory data as Schema.org-compatible JSON-LD,
    enabling cross-institution data sharing across BRICS agricultural networks.

    AgriN conformance: this is a human-readable capability manifest. The
    canonical, machine-federable AgriN context is `AGRIIN_CONTEXT` in
    app.models.agrin, and the soil records themselves are emitted as
    `agrin:SoilProfile` by `GET /api/v1/agrin/soil-profiles`. The `agrin` prefix
    below is pinned to that same namespace — a divergent context IRI here would
    make records unfederable, so `scripts/check_agrin.mjs` guards against it.
    """
    schema = {
        "@context": {
            "@vocab": "https://schema.org/",
            "agrin": "https://floranet.ai/schema/agrin/term/",
            "floranet": "https://floranet.ai/schema/v1/",
            "skos": "https://www.w3.org/2004/02/skos/core#",
        },
        "@type": "Dataset",
        "@id": "https://floranet.ai/api/v1/soil/schema",
        "name": "FloraNet BRICS Soil Intelligence Schema",
        "description": (
            "Standardized JSON-LD schema for cross-border soil telemetry, crop rotation advisories, "
            "and soil organic carbon (SOC) tracking across BRICS agricultural corridors."
        ),
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "creator": {
            "@type": "Organization",
            "name": "FloraNet",
            "url": "https://floranet.ai",
            "sameAs": "https://digitalpublicgoods.net/registry/floranet",
        },
        "spatialCoverage": {
            "@type": "Place",
            "name": "BRICS Nations",
            "containsPlace": [
                {"@type": "Country", "name": "India", "identifier": "IN"},
                {"@type": "Country", "name": "Brazil", "identifier": "BR"},
                {"@type": "Country", "name": "South Africa", "identifier": "ZA"},
                {"@type": "Country", "name": "China", "identifier": "CN"},
                {"@type": "Country", "name": "Russia", "identifier": "RU"},
                {"@type": "Country", "name": "Egypt", "identifier": "EG"},
                {"@type": "Country", "name": "Ethiopia", "identifier": "ET"},
                {"@type": "Country", "name": "Iran", "identifier": "IR"},
                {"@type": "Country", "name": "United Arab Emirates", "identifier": "AE"},
            ],
        },
        "variableMeasured": [
            {
                "@type": "PropertyValue",
                "name": "agrin:SoilOrganicCarbon",
                "description": "Soil Organic Carbon percentage (0–5cm horizon, ISRIC SoilGrids)",
                "unitCode": "P1",
                "valueReference": {"@type": "QuantitativeValue", "minValue": 0.0, "maxValue": 10.0},
            },
            {
                "@type": "PropertyValue",
                "name": "agrin:SoilMoisture",
                "description": "Volumetric soil moisture (m³/m³) from Open-Meteo",
                "unitCode": "C62",
            },
            {
                "@type": "PropertyValue",
                "name": "floranet:CropRotationPlan",
                "description": "3-year Gemini RAG-generated regenerative crop rotation plan",
                "valueReference": {"@type": "StructuredValue", "schema": "floranet:RotationPlanV1"},
            },
            {
                "@type": "PropertyValue",
                "name": "agrin:CarbonCredit",
                "description": "Estimated carbon sequestration (t CO2e / acre / year)",
                "unitCode": "TNE",
            },
        ],
        "floranet:endpoints": {
            "soil_advisory": "GET /api/v1/soil/advisory?lat=&lng=&soil_type=&current_crop=&country=",
            "live_readings": "GET /api/v1/soil/live?lat=&lng=",
            "sentinel2_scene": "GET /api/v1/soil/sentinel2?lat=&lng=",
            "pest_outbreaks": "GET /api/v1/dpg/outbreaks",
            "soc_tracker": "GET /api/v1/dpg/soc-tracker",
            "leaf_diagnosis": "POST /api/v1/doctor/diagnose",
        },
        "skos:note": (
            "This schema is aligned with the GODAN (Global Open Data for Agriculture and Nutrition) "
            "metadata standards and the DPG Alliance interoperability framework. "
            "All served values originate from the cited public APIs (Open-Meteo, ISRIC SoilGrids, "
            "NASA EONET/POWER, Copernicus, World Bank WDI) — no simulated data."
        ),
    }
    return JSONResponse(content=schema, media_type="application/ld+json")
