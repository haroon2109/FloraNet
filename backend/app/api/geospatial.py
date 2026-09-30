"""
Geospatial Soil Health & Regenerative Planner API — FloraNet
============================================================

  GET /api/v1/geospatial/telemetry?lat=&lng=
        → REAL satellite NDVI/EVI (MODIS) + root-zone moisture (SMAP) history
          derived by inverting official NASA GIBS colormaps, plus the
          deterministic baseline Soil Degradation Index.

  GET /api/v1/geospatial/rotation?lat=&lng=&crop=&soil_type=
        → 3-year season-by-season regenerative rotation. Synthesis runs on the
          local open-weights model grounded in live soil/rainfall/history;
          without the model, a DETERMINISTIC knowledge-base rotation is
          returned instead of failing — both paths are honest about their origin.

  GET /api/v1/geospatial/microclimate?lat=&lng=
        → Hyper-local alerts (heatwave / frost / heavy rain) from the real
          Open-Meteo forecast combined with live soil conditions, each with
          actionable prep steps. Deterministic thresholds on real data.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services import geospatial
from app.services import real_data
from app.services import llm
from app.services.rag import rag_service

router = APIRouter()


# ──────────────────────────────────────────────────────────────────────────────
# GET /telemetry — satellite vegetation/moisture + Soil Degradation Index
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/telemetry")
async def get_geospatial_telemetry(
    lat: float = Query(18.5204, description="Farm latitude"),
    lng: float = Query(73.8567, description="Farm longitude"),
    periods: int = Query(12, ge=4, le=24, description="History samples per index"),
) -> Dict[str, Any]:
    """Real satellite indices + deterministic Soil Degradation Index baseline."""
    errors: Dict[str, str] = {}

    # live weather (Open-Meteo) — also used by the SDI cross-check
    try:
        weather = await real_data.current_weather_summary(lat, lng)
    except Exception as exc:
        weather = {}
        errors["weather"] = str(exc)

    # real SoilGrids properties
    try:
        soil = real_data.soilgrids_summary(await real_data.soilgrids_point(lat, lng))
    except Exception as exc:
        soil = {}
        errors["soilgrids"] = str(exc)

    # real satellite series (MODIS NDVI/EVI + SMAP moisture)
    veg = geospatial.gibs_vegetation_block(lat, lng, periods=periods)
    moist = geospatial.gibs_moisture_block(lat, lng, periods=periods)
    for k, v in (veg.get("errors") or {}).items():
        errors[f"satellite_{k}"] = v
    for k, v in (moist.get("errors") or {}).items():
        errors[f"satellite_{k}"] = v

    sdi = geospatial.compute_sdi(veg, moist, soil, weather)

    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "location": {"lat": lat, "lng": lng},
        "vegetation": veg,
        "moisture": moist,
        "soilgrids": {k: soil[k] for k in ("soc_percent", "ph", "texture_class") if k in soil} if soil else None,
        "live_weather": {
            "soil_moisture_pct": weather.get("soil_moisture_pct"),
            "soil_temp_c": weather.get("soil_temp_c"),
            "current_temp": weather.get("current_temp"),
            "condition": weather.get("condition"),
        },
        "soil_degradation": sdi,
        "errors": errors or None,
        "sources": [
            "NASA GIBS Worldview WMS (MODIS NDVI/EVI, SMAP L4) — public domain",
            "ISRIC SoilGrids 2.0 (CC-BY 4.0)",
            "Open-Meteo (CC-BY 4.0)",
        ],
    }


# ──────────────────────────────────────────────────────────────────────────────
# GET /rotation — 3-year dynamic rotation generator
# ──────────────────────────────────────────────────────────────────────────────
class RotationPhase(BaseModel):
    phase_number: int = Field(description="Sequential phase number")
    season: str = Field(description="Season/year label, e.g. 'Year 1 Kharif'")
    recommended_crop: str
    justification: str
    estimated_duration_days: int = Field(description="Duration in days (0–150)")
    role: str = Field(default="", description="legume_n_fixation | cover_crop | cash_crop | biofumigant | …")


class RotationPlan(BaseModel):
    plan_origin: str  # "local-llm-synthesis" | "deterministic-knowledge-base"
    overview: str
    phases: List[RotationPhase]
    estimated_soc_improvement_percent: Optional[float] = None
    n_saving_kg_acre: Optional[float] = None
    sources: List[str] = Field(default_factory=list)


def _knowledge_rotation(crop: str, soil_summary: Dict[str, Any]) -> RotationPlan:
    """
    Deterministic 3-year rotation from the verified knowledge base (ICAR /
    Embrapa / ARC corpus), used verbatim when the local LLM is unavailable.
    Field-specific citations, no invented doses.
    """
    clay = soil_summary.get("clay_g_kg")
    soc = soil_summary.get("soc_percent")
    heavy = "Vertisol" if (clay or 0) >= 350 else "loam soils"
    soc_txt = f"{soc}% SOC" if soc is not None else "topsoil SOC"
    cash = crop or "Maize"

    phases = [
        RotationPhase(
            phase_number=1,
            season="Year 1 · Kharif (monsoon)",
            recommended_crop=cash,
            justification=(
                f"Current cash crop maintained while {soc_txt} is recorded as the "
                "baseline; retain crop residue after harvest (ICAR protocol)."
            ),
            estimated_duration_days=120,
            role="cash_crop",
        ),
        RotationPhase(
            phase_number=2,
            season="Year 1 · Rabi (winter)",
            recommended_crop="Chickpea (legume)",
            justification=(
                "Legume phase: biological N-fixation (~40–45 kg N/acre) breaks the "
                "cereal pest cycle and saves synthetic nitrogen (ICAR rotation model)."
            ),
            estimated_duration_days=105,
            role="legume_n_fixation",
        ),
        RotationPhase(
            phase_number=3,
            season="Year 2 · Kharif",
            recommended_crop="Sorghum or pearl millet",
            justification=(
                f"Deep-rooted cereal diversifies rooting channels and withstands "
                f"moisture swings on {heavy} (ICAR Deccan protocol)."
            ),
            estimated_duration_days=115,
            role="cash_crop",
        ),
        RotationPhase(
            phase_number=4,
            season="Year 2 · Zaid (summer)",
            recommended_crop="Sunn hemp (Crotalaria) cover",
            justification=(
                "High-biomass cover suppresses nematodes and is incorporated as "
                "green manure 45–60 days after sowing (ICAR / FloraNet corpus)."
            ),
            estimated_duration_days=60,
            role="cover_crop",
        ),
        RotationPhase(
            phase_number=5,
            season="Year 3 · Kharif",
            recommended_crop=f"{cash} + marigold borders",
            justification=(
                "Cash crop with preventative French-marigold intercrop borders "
                "against root-knot nematodes (ICAR nematology / Embrapa practice)."
            ),
            estimated_duration_days=120,
            role="cash_crop",
        ),
        RotationPhase(
            phase_number=6,
            season="Year 3 · Rabi",
            recommended_crop="Wheat + brassica biofumigant cover",
            justification=(
                "Glucosinolate release from brassica incorporation biofumigates "
                "soil-borne pathogens before the next cycle (Embrapa practice)."
            ),
            estimated_duration_days=120,
            role="biofumigant",
        ),
        RotationPhase(
            phase_number=7,
            season="Year 3 · Zaid",
            recommended_crop="Dhaincha green manure",
            justification=(
                "Final green-manure phase closes the 3-year cycle with fresh "
                "biomass to raise SOC before returning to the cash crop."
            ),
            estimated_duration_days=55,
            role="cover_crop",
        ),
        RotationPhase(
            phase_number=8,
            season="Year 3 → Year 4",
            recommended_crop="Return to cash crop",
            justification=(
                "Cycle complete — SOC re-assessed against the Year-1 baseline via "
                "satellite NDVI + ISRIC SoilGrids."
            ),
            estimated_duration_days=0,
            role="assessment",
        ),
    ]
    return RotationPlan(
        plan_origin="deterministic-knowledge-base",
        overview=(
            "Deterministic ICAR/Embrapa rotation from the verified knowledge base "
            "(local model unavailable). Alternates cash crop → legume → cover crop, "
            "closing each year with green manure to rebuild SOC."
        ),
        phases=phases,
        estimated_soc_improvement_percent=0.9,
        n_saving_kg_acre=45.0,
        sources=["ICAR (India)", "Embrapa (Brazil)", "FloraNet verified corpus"],
    )


def _llm_rotation(crop: str, soil_summary: Dict[str, Any], forecast: Dict[str, Any],
                  ndvi_block: Optional[Dict[str, Any]],
                  past_yields: str) -> Optional[RotationPlan]:
    """Local-LLM synthesis grounded in live data; returns None when unavailable."""
    if not llm.is_available():
        return None
    try:
        ndvi = (ndvi_block or {}).get("ndvi") or {}
        if ndvi:
            ndvi_line = (
                f"NDVI mean {ndvi.get('mean')} (trend {ndvi.get('trend_per_period')} per 8-day period)"
            )
        else:
            ndvi_line = "NDVI unavailable — say so explicitly and rely on soil/weather."
        daily = (forecast or {}).get("daily") or {}
        rain = daily.get("precipitation_sum") or []
        rain_7d = round(sum(r or 0 for r in rain[:7]), 1) if rain else None
        rag_context, _sources = rag_service.retrieve_context(
            f"{crop} rotation legume cover crop", top_k=2
        )

        prompt = f"""You are a regenerative agronomist planning a 3-YEAR season-by-season rotation.

FARM CONTEXT (all real data):
- SoilGrids: {soil_summary}
- Recent satellite vegetation: {ndvi_line}
- Open-Meteo 7-day rainfall sum: {rain_7d} mm
- Past yields reported by the farmer: {past_yields or 'not provided'}

VERIFIED KNOWLEDGE BASE:
{rag_context}

RULES:
- 6-8 phases covering 3 years, each with a season label, crop, duration
  (30-150 days), and an agronomic justification citing the institution used.
- Rotate cash crop -> legume (N-fixation) -> cover crop (green manure/biofumigant).
- Quote real observed values where relevant; never invent doses.
"""
        result = llm.generate_json(
            prompt,
            schema=RotationPlan,
            system="You are a precise agronomy planning assistant. Respond with valid JSON only.",
            temperature=0.2,
        )
        result.plan_origin = "local-llm-synthesis"
        return result
    except Exception:
        return None


@router.get("/rotation")
async def get_rotation(
    lat: float = Query(18.5204),
    lng: float = Query(73.8567),
    crop: str = Query("Maize"),
    soil_type: str = Query("", description="Historical soil type if known"),
    past_yields: str = Query("", description="Farmer-reported past yields (free text)"),
) -> Dict[str, Any]:
    """3-year season-by-season regenerative rotation (LLM synthesis or deterministic KB fallback)."""
    errors: Dict[str, str] = {}

    try:
        soil_summary = real_data.soilgrids_summary(await real_data.soilgrids_point(lat, lng))
    except Exception as exc:
        soil_summary = {}
        errors["soilgrids"] = str(exc)

    try:
        forecast = await real_data.open_meteo_forecast(lat, lng)
    except Exception as exc:
        forecast = {}
        errors["open_meteo"] = str(exc)

    try:
        ndvi_block = geospatial.gibs_vegetation_block(lat, lng, periods=6)
    except Exception as exc:
        ndvi_block = {"errors": {"ndvi": str(exc)}}

    plan = _llm_rotation(crop, soil_summary, forecast, ndvi_block, past_yields)
    if plan is None:
        plan = _knowledge_rotation(crop, soil_summary)

    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "location": {"lat": lat, "lng": lng},
        "inputs": {
            "crop": crop,
            "soil_type": soil_type or soil_summary.get("texture_class"),
            "soilgrids": (
                {k: soil_summary[k] for k in ("soc_percent", "ph", "texture_class") if k in soil_summary}
                or None
            ),
            "past_yields": past_yields or None,
        },
        "plan": plan.model_dump(),
        "errors": errors or None,
        "sources": plan.sources or ["ICAR / Embrapa / ARC — FloraNet verified corpus"],
    }


# ──────────────────────────────────────────────────────────────────────────────
# GET /microclimate — hyper-local prep alerts (deterministic, real inputs)
# ──────────────────────────────────────────────────────────────────────────────
class MicroclimateAlert(BaseModel):
    alert_type: str
    severity: str
    trigger_value: Optional[str] = None
    window: Optional[str] = None
    actionable_prep_steps: List[str] = Field(default_factory=list)
    soil_context: Optional[str] = None


@router.get("/microclimate")
async def get_microclimate(
    lat: float = Query(18.5204),
    lng: float = Query(73.8567),
) -> Dict[str, Any]:
    """Hyper-local alerts from the real forecast + live soil conditions."""
    try:
        weather = await real_data.current_weather_summary(lat, lng)
        raw = await real_data.open_meteo_forecast(lat, lng)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Open-Meteo unavailable: {exc}")

    daily = raw.get("daily", {})
    days = daily.get("time", [])
    tmax = daily.get("temperature_2m_max") or []
    tmin = daily.get("temperature_2m_min") or []
    precip = daily.get("precipitation_sum") or []
    wind = daily.get("wind_speed_10m_max") or []

    soil_moisture = weather.get("soil_moisture_pct")
    soil_ctx = f"Live soil moisture {soil_moisture}%" if soil_moisture is not None else None

    def _fmt(iso: str) -> str:
        try:
            return datetime.fromisoformat(iso).strftime("%b %d")
        except ValueError:
            return iso

    def _within(i: int) -> str:
        if i == 0:
            return "Today"
        if i == 1:
            return "Tomorrow"
        return f"in {i} days ({_fmt(days[i])})"

    alerts: List[MicroclimateAlert] = []

    # 1) Heatwave: Tmax >= 40 C within 7 days
    heat_idx = next((i for i, t in enumerate(tmax[:7]) if t is not None and t >= 40), None)
    if heat_idx is not None:
        steps = [
            f"Irrigate in the early morning before the {tmax[heat_idx]}\u00b0C peak to cut evaporation losses.",
            "Apply surface mulch (residue/straw) to buffer topsoil temperature.",
            "Avoid fertilizer or pesticide application during the peak-heat window.",
        ]
        if soil_moisture is not None and soil_moisture < 20:
            steps.insert(0, f"URGENT: live soil moisture is already {soil_moisture}% — pre-irrigate today.")
        alerts.append(MicroclimateAlert(
            alert_type="Heatwave",
            severity="High" if tmax[heat_idx] >= 43 else "Medium",
            trigger_value=f"Tmax {tmax[heat_idx]}\u00b0C",
            window=_within(heat_idx),
            actionable_prep_steps=steps,
            soil_context=soil_ctx,
        ))

    # 2) Frost: Tmin <= 2 C within 7 days
    frost_idx = next((i for i, t in enumerate(tmin[:7]) if t is not None and t <= 2), None)
    if frost_idx is not None:
        alerts.append(MicroclimateAlert(
            alert_type="Frost",
            severity="High" if (tmin[frost_idx] or 0) <= 0 else "Medium",
            trigger_value=f"Tmin {tmin[frost_idx]}\u00b0C",
            window=_within(frost_idx),
            actionable_prep_steps=[
                "Irrigate lightly in the evening — wet soil holds daytime heat and protects roots overnight.",
                "Cover young seedlings with row cover / mulch before nightfall.",
            ],
            soil_context=soil_ctx,
        ))

    # 3) Unseasonal downpour: >= 20 mm in a day within 7 days
    rain_idx = next((i for i, p in enumerate(precip[:7]) if p is not None and p >= 20), None)
    if rain_idx is not None:
        steps = [
            f"Clear field drains before {_fmt(days[rain_idx])} — {precip[rain_idx]} mm expected.",
            "Delay fertilizer/chemical application until after the rain to avoid leaching.",
            "Bring in harvest-ready crops before the window opens.",
        ]
        if soil_moisture is not None and soil_moisture > 55:
            steps.append(f"Caution: soil already at {soil_moisture}% moisture — saturation/root-hypoxia risk.")
        alerts.append(MicroclimateAlert(
            alert_type="Unseasonal Downpour",
            severity="High" if precip[rain_idx] >= 40 else "Medium",
            trigger_value=f"{precip[rain_idx]} mm/day",
            window=_within(rain_idx),
            actionable_prep_steps=steps,
            soil_context=soil_ctx,
        ))

    # 4) Strong wind: >= 35 km/h within 7 days
    wind_idx = next((i for i, w in enumerate(wind[:7]) if w is not None and w >= 35), None)
    if wind_idx is not None:
        alerts.append(MicroclimateAlert(
            alert_type="Strong Wind",
            severity="Medium",
            trigger_value=f"{wind[wind_idx]} km/h",
            window=_within(wind_idx),
            actionable_prep_steps=[
                "Stake tall crops (maize, tomato) before the wind arrives.",
                "Secure protected-culture nets and structures.",
            ],
        ))

    # 5) Dry spell: < 1 mm rain across the 7-day window + low live moisture
    rain_next_7d = sum(p or 0 for p in precip[:7])
    if rain_next_7d < 1 and (soil_moisture is not None and soil_moisture < 20):
        alerts.append(MicroclimateAlert(
            alert_type="Dry Spell",
            severity="High" if soil_moisture < 15 else "Medium",
            trigger_value=f"{rain_next_7d:.0f} mm rain in 7 days; soil at {soil_moisture}%",
            window="Next 7 days",
            actionable_prep_steps=[
                "Prioritize irrigation for the driest plots; irrigate at dawn to cut evaporation.",
                "Mulch open beds to conserve soil moisture.",
            ],
            soil_context=soil_ctx,
        ))

    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "location": {"lat": lat, "lng": lng},
        "soil_moisture_pct": soil_moisture,
        "alerts": [a.model_dump() for a in alerts],
        "no_alerts_note": (
            "No heatwave/frost/downpour/wind triggers in the real 7-day forecast." if not alerts else None
        ),
        "sources": ["Open-Meteo (CC-BY 4.0)"],
    }
