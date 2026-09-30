"""
Farm API Router — FloraNet
All telemetry, advisories, prices and AI responses in this router are derived
from LIVE sources:

  - Open-Meteo    → weather, soil moisture/temperature, 7-day forecast
  - ISRIC SoilGrids → SOC, pH, texture at the farm coordinates
  - NASA EONET    → active natural-hazard alerts near the farm
  - Yahoo Finance → real CBOT/ICE futures + BRICS FX for mandi pricing
  - Gemini 2.0 Flash + FAISS RAG → agronomy chat (real model output or 503)

Nothing is randomized. Values that require on-farm IoT sensors (water pumped,
device-level metrics) are omitted rather than fabricated.
"""

import math
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services import real_data
from app.services.rag import rag_service

router = APIRouter()


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────
def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2 - p1
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


async def _live_context(lat: float, lng: float) -> Dict[str, Any]:
    """Gather all live contextual data for a farm location."""
    weather = await real_data.current_weather_summary(lat, lng)
    forecast_raw = await real_data.open_meteo_forecast(lat, lng)
    try:
        soil = real_data.soilgrids_summary(await real_data.soilgrids_point(lat, lng))
    except Exception as exc:
        soil = {"source": f"SoilGrids unavailable: {exc}"}

    try:
        hazards = [
            e for e in real_data.eonet_brics_events(limit_per_country=20)
            if _haversine_km(lat, lng, e["lat"], e["lng"]) <= 500
        ]
    except Exception:
        hazards = []

    return {"weather": weather, "forecast_raw": forecast_raw, "soil": soil, "hazards": hazards}


# ──────────────────────────────────────────────────────────────────────────────
# GET /metrics — computed from LIVE sources (requires farm coordinates)
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/metrics")
async def get_farm_metrics(
    lat: float = Query(18.5204, description="Farm latitude"),
    lng: float = Query(73.8567, description="Farm longitude"),
) -> Dict[str, Any]:
    """
    Live farm-level metrics computed from real weather, soil and hazard feeds.
    Sensor-only figures (water pumped, cost saved) are NOT fabricated and are
    therefore omitted until an IoT gateway is registered.
    """
    ctx = await _live_context(lat, lng)
    weather, soil, hazards = ctx["weather"], ctx["soil"], ctx["hazards"]

    # Deterministic soil-health score from real SoilGrids values
    soc = soil.get("soc_percent")
    ph = soil.get("ph")
    score = 50.0
    if soc is not None:
        score += min(25.0, soc * 12.5)          # 2% SOC → +25
    if ph is not None:
        score += max(0.0, 25.0 - abs(ph - 6.5) * 12.5)  # pH 6.5 → +25
    moisture = weather.get("soil_moisture_pct")
    if moisture is not None and moisture < 15:
        score -= 15.0
    overall = round(max(0.0, min(100.0, score)), 1)

    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "location": {"lat": lat, "lng": lng},
        "overall_health_score": overall,
        "soil": {k: soil[k] for k in ("soc_percent", "ph", "texture_class") if k in soil},
        "humidity_pct": weather.get("humidity"),
        "ambient_temp_c": weather.get("current_temp"),
        "soil_moisture_pct": moisture,
        "soil_temp_c": weather.get("soil_temp_c"),
        "active_alerts_count": len(hazards),
        "active_alerts": [
            {"title": h["title"], "category": h["category"], "distance_km": round(_haversine_km(lat, lng, h["lat"], h["lng"]), 0)}
            for h in hazards[:5]
        ],
        "sources": ["Open-Meteo", "ISRIC SoilGrids 2.0", "NASA EONET"],
    }


# ──────────────────────────────────────────────────────────────────────────────
# GET /fields — field registry (requires registered IoT/user farm data)
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/fields")
def get_fields_telemetry() -> List[Dict[str, Any]]:
    """
    Field-level telemetry requires a registered farm/plot (Supabase
    `farm_plots`) or an IoT sensor gateway. None is registered in this
    deployment, so an empty registry is returned — never synthetic fields.
    """
    return []


# ──────────────────────────────────────────────────────────────────────────────
# Mutations — logged, honestly labeled as un-actuated without a gateway
# ──────────────────────────────────────────────────────────────────────────────
class IrrigationToggleRequest(BaseModel):
    field_id: str
    active: bool


MUTATION_LOG: List[Dict[str, Any]] = []


@router.post("/irrigation/toggle")
def toggle_field_irrigation(req: IrrigationToggleRequest) -> Dict[str, Any]:
    entry = {
        "event": "irrigation_toggle",
        "field_id": req.field_id,
        "active": req.active,
        "at": datetime.utcnow().isoformat() + "Z",
        "actuated": False,
        "note": "Logged locally. Physical valve actuation requires a registered LoRa/sensor gateway.",
    }
    MUTATION_LOG.append(entry)
    return {"success": True, "logged": entry}


class AlertResolveRequest(BaseModel):
    alert_id: str


@router.post("/alerts/resolve")
def resolve_farm_alert(req: AlertResolveRequest) -> Dict[str, Any]:
    entry = {
        "event": "alert_resolve",
        "alert_id": req.alert_id,
        "at": datetime.utcnow().isoformat() + "Z",
    }
    MUTATION_LOG.append(entry)
    return {"success": True, "logged": entry}


# ──────────────────────────────────────────────────────────────────────────────
# GET /recommendations — deterministic agronomy rules on LIVE data
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/recommendations")
async def get_recommendations(
    lat: float = Query(18.5204),
    lng: float = Query(73.8567),
    crop: str = Query("Maize"),
) -> List[Dict[str, Any]]:
    ctx = await _live_context(lat, lng)
    weather, soil, hazards, forecast_raw = ctx["weather"], ctx["soil"], ctx["hazards"], ctx["forecast_raw"]
    recs: List[Dict[str, Any]] = []

    moisture = weather.get("soil_moisture_pct")
    if moisture is not None:
        if moisture < 20:
            recs.append({
                "id": "rec-irrigation-low",
                "title": f"Irrigate soon — root-zone moisture at {moisture}%",
                "priority": "High",
                "description": f"Live Open-Meteo soil moisture (0-1cm) is {moisture}%, below the 20% stress threshold for {crop}.",
                "source": "Open-Meteo soil moisture (0-1cm)",
            })
        elif moisture > 55:
            recs.append({
                "id": "rec-irrigation-high",
                "title": f"Pause irrigation — saturated soil at {moisture}%",
                "priority": "Medium",
                "description": f"Live soil moisture is {moisture}%. Risk of root hypoxia; hold irrigation until it drops below 45%.",
                "source": "Open-Meteo soil moisture (0-1cm)",
            })

    # Rain window from real 7-day forecast
    daily = (forecast_raw.get("daily") or {})
    rain = daily.get("precipitation_sum") or []
    rain_days = daily.get("time") or []
    rain_72h = sum(r or 0 for r in rain[:3]) if rain else 0
    if rain_72h >= 20:
        recs.append({
            "id": "rec-rain-window",
            "title": f"Skip fertilizer/chemical spray — {rain_72h:.0f} mm rain expected in 72h",
            "priority": "Medium",
            "description": "Open-Meteo forecast shows significant precipitation within 3 days; apply inputs after it passes to avoid leaching/runoff.",
            "source": "Open-Meteo 7-day precipitation forecast",
        })

    ph = soil.get("ph")
    if ph is not None and (ph < 5.5 or ph > 8.0):
        recs.append({
            "id": "rec-ph",
            "title": f"Soil pH {ph} outside optimal band (5.5–8.0)",
            "priority": "Medium",
            "description": f"ISRIC SoilGrids reports pH {ph}. Apply lime (acidic) or gypsum/organic matter (alkaline) per local ICAR/Embrapa/ARC guidance.",
            "source": "ISRIC SoilGrids 2.0 (pH H2O, 0-5cm)",
        })

    soc = soil.get("soc_percent")
    if soc is not None and soc < 1.0:
        recs.append({
            "id": "rec-soc",
            "title": f"Low soil organic carbon ({soc}%) — add biomass",
            "priority": "Medium",
            "description": f"SoilGrids SOC is {soc}% in the top 5cm. Include legume cover crops / compost to build humus.",
            "source": "ISRIC SoilGrids 2.0 (SOC, 0-5cm)",
        })

    for h in hazards[:2]:
        recs.append({
            "id": f"rec-hazard-{h.get('id', 'x')}",
            "title": f"Hazard nearby: {h['title']}",
            "priority": "High",
            "description": f"NASA EONET reports an active {h['category']} event within 500 km. Review field drainage/shelter plans.",
            "source": "NASA EONET v3",
        })

    if not recs:
        # All live indicators are within safe bands — say so with the real readings.
        recs.append({
            "id": "rec-nominal",
            "title": "No advisories triggered — live conditions within safe bands",
            "priority": "Info",
            "description": (
                f"Live check at {lat:.3f},{lng:.3f}: soil moisture {weather.get('soil_moisture_pct')}%, "
                f"air temp {weather.get('current_temp')}°C, {weather.get('condition')}. "
                "No rain-leaching window, no pH/SOC flag, no hazards within 500 km."
            ),
            "source": "Open-Meteo + ISRIC SoilGrids + NASA EONET (live)",
        })

    return recs


def hourly_tz(raw: dict):
    """Return the timezone Open-Meteo localizes its naive timestamps to."""
    from datetime import timezone
    # Open-Meteo returns naive local times with 'timezone'/'utc_offset_seconds'.
    offset = raw.get("utc_offset_seconds", 0) or 0
    return timezone(timedelta(seconds=offset))


# ──────────────────────────────────────────────────────────────────────────────
# GET /weather-telemetry — real Open-Meteo current + 7-day forecast + derived blocks
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/weather-telemetry")
async def get_weather_telemetry(
    lat: float = Query(18.5204),
    lng: float = Query(73.8567),
) -> Dict[str, Any]:
    weather = await real_data.current_weather_summary(lat, lng)
    raw = await real_data.open_meteo_forecast(lat, lng)

    daily = raw.get("daily", {})
    days = daily.get("time", [])

    def _series(key: str) -> List[Optional[Any]]:
        vals = daily.get(key) or []
        return vals if len(vals) == len(days) else [None] * len(days)

    # Split real daily arrays into past 7 days and upcoming forecast days.
    today = datetime.now(hourly_tz(raw)).date().isoformat()
    past_idx = [i for i, d in enumerate(days) if d < today]
    future_idx = [i for i, d in enumerate(days) if d >= today]

    tmax = _series("temperature_2m_max")
    tmin = _series("temperature_2m_min")
    precip = _series("precipitation_sum")
    rain_pct = _series("precipitation_probability_max")
    codes = _series("weather_code")
    wind_max = _series("wind_speed_10m_max")
    wind_dir = _series("wind_direction_10m_dominant")
    uv_max = _series("uv_index_max")

    weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    def _fmt_date(iso: str) -> str:
        try:
            return datetime.fromisoformat(iso).strftime("%b %-d")
        except ValueError:
            return iso

    # Upcoming forecast rows (day/date/high/low/condition/rain) — real values.
    forecast = []
    for i in future_idx:
        dt = datetime.fromisoformat(days[i])
        forecast.append({
            "day": weekday[dt.weekday()],
            "date": _fmt_date(days[i]),
            "high": tmax[i],
            "low": tmin[i],
            "condition": real_data.wmo_to_condition(codes[i]),
            "rain_pct": rain_pct[i],
            "precipitation_mm": precip[i],
        })

    # Real hourly forecast for the next 9 hours (now onward) from the hourly
    # arrays — no interpolation, no invention.
    hourly_out = []
    hourly = raw.get("hourly", {})
    h_times = hourly.get("time") or []
    now_hour = datetime.now(hourly_tz(raw)).strftime("%Y-%m-%dT%H:00")
    h_temp = hourly.get("temperature_2m") or []
    h_code = hourly.get("weather_code") or []
    h_wind = hourly.get("wind_speed_10m") or []
    h_rain = hourly.get("precipitation_probability") or []
    for j, ht in enumerate(h_times):
        if ht < now_hour:
            continue
        hh = datetime.fromisoformat(ht).strftime("%-I %p").lstrip("0")
        hourly_out.append({
            "time": hh,
            "temp_c": h_temp[j] if j < len(h_temp) else None,
            "condition": real_data.wmo_to_condition(h_code[j] if j < len(h_code) else None),
            "wind_kmh": h_wind[j] if j < len(h_wind) else None,
            "rain_pct": h_rain[j] if j < len(h_rain) else None,
        })
        if len(hourly_out) >= 9:
            break

    # Past-7-days summary (max/min temp, rainfall) — real observed values.
    past7 = []
    for i in past_idx[-7:]:
        past7.append({
            "date": _fmt_date(days[i]),
            "max_temp_c": tmax[i],
            "min_temp_c": tmin[i],
            "rainfall_mm": precip[i],
        })

    # Real week-over-week trend series (past 7 observed days).
    temp_trend = [
        {"date": _fmt_date(days[i]), "max_temp": tmax[i], "min_temp": tmin[i]}
        for i in past_idx[-7:]
    ]
    rain_trend = [
        {"date": _fmt_date(days[i]), "rainfall": precip[i]}
        for i in past_idx[-7:]
    ]

    # Weather alert heuristics derived from REAL forecast values only.
    alerts: List[Dict[str, Any]] = []
    for i in future_idx[:7]:
        if tmax[i] is not None and tmax[i] >= 40:
            alerts.append({
                "id": f"heat-{days[i]}", "title": "Heat Stress Warning",
                "description": f"High of {tmax[i]}°C expected on {_fmt_date(days[i])}.",
                "badge_text": "High Priority", "badge_type": "high", "time": "Forecast",
            })
        if precip[i] is not None and precip[i] >= 20:
            alerts.append({
                "id": f"rain-{days[i]}", "title": "Heavy Rain Alert",
                "description": f"{precip[i]} mm rainfall likely on {_fmt_date(days[i])}.",
                "badge_text": "Medium Priority", "badge_type": "medium", "time": "Forecast",
            })
        if wind_max[i] is not None and wind_max[i] >= 35:
            alerts.append({
                "id": f"wind-{days[i]}", "title": "Strong Wind Advisory",
                "description": f"Gusts up to {wind_max[i]} km/h on {_fmt_date(days[i])}.",
                "badge_text": "Low Priority", "badge_type": "low", "time": "Forecast",
            })
    alerts = alerts[:4]

    # Agronomic advisories computed from real forecast/soil values (deterministic).
    soil_moisture = weather.get("soil_moisture_pct")
    recommendations: List[Dict[str, Any]] = []
    next_rain_idx = next((i for i in future_idx if (precip[i] or 0) >= 1), None)
    if next_rain_idx is not None:
        recommendations.append({
            "id": "rec-irrigate-early",
            "title": "Irrigate early morning",
            "description": f"{precip[next_rain_idx]} mm rain expected {_fmt_date(days[next_rain_idx])}; lower evaporation before it arrives.",
            "badge_text": "High Impact", "badge_type": "high", "icon_type": "leaf",
        })
    hot_idx = next((i for i in future_idx if (tmax[i] or 0) >= 35), None)
    if hot_idx is not None:
        recommendations.append({
            "id": "rec-heat-shield",
            "title": "Protect crops from heat",
            "description": f"Peak of {tmax[hot_idx]}°C on {_fmt_date(days[hot_idx])}; use mulching and shade nets.",
            "badge_text": "Medium Impact", "badge_type": "medium", "icon_type": "shield",
        })
    if soil_moisture is not None and soil_moisture < 20:
        recommendations.append({
            "id": "rec-soil-moisture",
            "title": "Soil moisture running low",
            "description": f"Top-soil moisture at {soil_moisture}%; schedule irrigation for the driest plots first.",
            "badge_text": "Recommended", "badge_type": "medium", "icon_type": "rain",
        })
    recommendations = recommendations[:3]

    sunrise_raw = (_series("sunrise")[future_idx[0]] if future_idx else None)
    sunset_raw = (_series("sunset")[future_idx[0]] if future_idx else None)
    uv_today = uv_max[future_idx[0]] if future_idx else None
    wind_dir_today = next((wd for i in future_idx for wd in [wind_dir[i]] if wd is not None), None)

    return {
        **weather,
        "forecast": forecast,
        "hourly": hourly_out,
        "temp_trend": temp_trend,
        "rain_trend": rain_trend,
        "past7_days": past7,
        "alerts": alerts,
        "recommendations": recommendations,
        "sunrise": sunrise_raw,
        "sunset": sunset_raw,
        "uv_index_max": uv_today,
        "uv_label": real_data.uv_index_label(uv_today),
        "wind_direction": real_data.wind_direction_label(wind_dir_today),
        "wind_direction_deg": wind_dir_today,
        "moon_phase": real_data.moon_phase_summary(),
        "sources": ["Open-Meteo API (CC-BY 4.0)"],
    }


# ──────────────────────────────────────────────────────────────────────────────
# POST /chat — local LLM grounded in the verified RAG corpus, with conversation
# memory so spoken follow-ups keep their antecedent.
# ──────────────────────────────────────────────────────────────────────────────
PERSONA_FRAMING = {
    "precision": (
        "You are a precision agronomist. Give data-driven, quantitative guidance "
        "(rates, timings, thresholds) drawn from the supplied knowledge base."
    ),
    "regenerative": (
        "You are a regenerative agriculture guide. Prioritize organic/biological "
        "inputs, cover cropping and soil biology."
    ),
    "sage": (
        "You are a traditional-farming sage. Blend agro-climatic wisdom and "
        "rotation heritage with practical safety."
    ),
}


class ChatTurn(BaseModel):
    """One prior turn of the conversation, replayed so follow-ups keep context."""

    role: str  # "user" | "assistant" (anything else is discarded)
    content: str


class ChatRequest(BaseModel):
    prompt: str
    persona: str = "precision"
    country: str = "India"
    crop: str = "Maize"
    # Regional voice interface — the answer comes back in the farmer's own language.
    language: str = "English"
    # Conversation memory, oldest turn first.
    history: List[ChatTurn] = Field(default_factory=list)
    # Prior crop history (rotation / what was grown before), most recent last.
    crop_history: List[str] = Field(default_factory=list)


# Upper bound on replayed turns. Keeps a long voice session from overrunning the
# local model's context window, which on a 4B CPU model is the real constraint.
MAX_HISTORY_TURNS = 10


def _history_messages(history: List[ChatTurn]) -> List[Dict[str, str]]:
    """
    Normalize client-supplied history into provider messages.

    Only `user`/`assistant` roles survive (a client cannot inject a system
    message and hijack the persona), blanks are dropped, the window is trimmed
    to the most recent MAX_HISTORY_TURNS, and a leading dangling assistant turn
    is dropped so the replayed conversation starts on a question.
    """
    cleaned: List[Dict[str, str]] = []
    for turn in history or []:
        role = (turn.role or "").strip().lower()
        content = (turn.content or "").strip()
        if role in ("user", "assistant") and content:
            cleaned.append({"role": role, "content": content})

    window = cleaned[-MAX_HISTORY_TURNS:]
    if window and window[0]["role"] == "assistant":
        window = window[1:]
    return window


def _retrieval_query(prompt: str, history: List[Dict[str, str]]) -> str:
    """
    Build the RAG query for this turn.

    A spoken follow-up ("how much neem extract should I dilute per litre?")
    names neither the crop nor the disease, so the previous user turn is
    prepended. Without it retrieval returns generic passages and the answer
    silently loses its grounding in the specific case under discussion.
    """
    prior_user_turns = [m["content"] for m in history if m["role"] == "user"]
    if not prior_user_turns:
        return prompt
    return f"{prior_user_turns[-1]}\n{prompt}"


@router.post("/chat")
async def chat_with_agronomist(req: ChatRequest) -> Dict[str, Any]:
    if not req.prompt.strip():
        raise HTTPException(status_code=422, detail="prompt must not be empty")

    history = _history_messages(req.history)
    query = _retrieval_query(req.prompt.strip(), history)
    context, sources = rag_service.retrieve_context(query, top_k=3)

    persona = PERSONA_FRAMING.get(req.persona.lower(), PERSONA_FRAMING["precision"])
    language = (req.language or "English").strip() or "English"

    system_parts = [persona]
    if language.lower() not in ("english", "en"):
        system_parts.append(
            f"The farmer speaks {language}. Write the entire answer in {language}, "
            "in plain words a smallholder farmer can act on. Keep chemical names, "
            "units and numbers in Latin script and Arabic digits so a dose stays "
            "unambiguous."
        )
    if req.crop_history:
        crops = [str(c).strip() for c in req.crop_history if str(c).strip()]
        if crops:
            system_parts.append(
                "Crop history for this farm (most recent last): " + ", ".join(crops)
            )
    system_parts.append(
        "Ground every answer ONLY in the supplied knowledge base. Cite the "
        "institution(s) you used. If the knowledge base does not cover the "
        "question, say so plainly. Never invent rates, doses or thresholds."
    )
    system = "\n".join(system_parts)

    messages: List[Dict[str, str]] = list(history)
    messages.append(
        {
            "role": "user",
            "content": (
                f"Farmer question: {req.prompt.strip()}\n"
                f"Country: {req.country}; Crop: {req.crop}\n\n"
                "VERIFIED AGRONOMIC KNOWLEDGE BASE (ICAR / Embrapa / ARC / CAAS / VNIIEA):\n"
                f"{context}\n\n"
                "Answer concisely (max 180 words)."
            ),
        }
    )

    try:
        content = await real_data.gemini_generate_conversation(messages, system=system)
    except ValueError as exc:
        # Malformed turn list (e.g. no user turn) — the caller's payload is at fault.
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        # Local model down or empty response — surface a real error, never canned text.
        raise HTTPException(status_code=503, detail=str(exc))

    return {
        "id": f"ai-{uuid.uuid4().hex[:10]}",
        "role": "assistant",
        "persona": req.persona,
        "language": language,
        "content": content,
        "timestamp": datetime.now().strftime("%I:%M %p"),
        "sources": [s.get("source", "") for s in sources],
        "source": "FloraNet RAG + local Ollama LLM (live generation)",
        "turns_in_context": len(messages),
    }


# ──────────────────────────────────────────────────────────────────────────────
# POST /pilot-waitlist + /register — real persistence (Supabase or memory)
# ──────────────────────────────────────────────────────────────────────────────
class PilotWaitlistRequest(BaseModel):
    name: str
    email: str
    organization: str
    country: str = "India"
    role: str = "Farmer"
    acreage: float = 10.0


PILOT_REGISTRATIONS_DB: List[Dict[str, Any]] = []

COUNTRY_NODE_MAP = {
    "in": "BRICS-IND-NODE-01", "india": "BRICS-IND-NODE-01",
    "br": "BRICS-BRA-NODE-02", "brazil": "BRICS-BRA-NODE-02",
    "ru": "BRICS-RUS-NODE-03", "russia": "BRICS-RUS-NODE-03",
    "cn": "BRICS-CHN-NODE-04", "china": "BRICS-CHN-NODE-04",
    "za": "BRICS-ZAF-NODE-05", "south africa": "BRICS-ZAF-NODE-05",
    "eg": "BRICS-EGY-NODE-06", "egypt": "BRICS-EGY-NODE-06",
    "et": "BRICS-ETH-NODE-07", "ethiopia": "BRICS-ETH-NODE-07",
    "ir": "BRICS-IRN-NODE-08", "iran": "BRICS-IRN-NODE-08",
    "ae": "BRICS-ARE-NODE-09", "uae": "BRICS-ARE-NODE-09",
    "united arab emirates": "BRICS-ARE-NODE-09",
}


def _persist(table: str, record: Dict[str, Any]) -> str:
    """Persist to Supabase when configured; otherwise keep in-process."""
    try:
        from app.config import settings

        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            from supabase import create_client

            sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            resp = sb.table(table).insert(record).execute()
            return str(resp.data[0].get("id")) if resp.data else "supabase-accepted"
    except Exception:
        pass
    if table == "pilot_waitlist":
        PILOT_REGISTRATIONS_DB.append(record)
    return f"mem-{uuid.uuid4().hex[:8]}"


@router.post("/pilot-waitlist")
def register_pilot_waitlist(req: PilotWaitlistRequest) -> Dict[str, Any]:
    entry = {
        "id": f"pilot-{uuid.uuid4().hex[:12]}",
        **req.model_dump(),
        "registered_at": datetime.utcnow().isoformat() + "Z",
        "status": "APPROVED_FOR_BATCH_1",
    }
    _persist("pilot_waitlist", entry)
    return {
        "status": "success",
        "message": f"Welcome to FloraNet, {req.name}! Your pilot registration for {req.organization} ({req.country}) is confirmed.",
        "pilot_id": entry["id"],
        "node_assigned": COUNTRY_NODE_MAP.get(req.country.lower(), "BRICS-IND-NODE-01"),
    }


class UserRegisterRequest(BaseModel):
    fullName: str
    email: str
    password: str
    country: str = "India"
    role: str = "Farmer"


@router.post("/register")
def register_user(req: UserRegisterRequest) -> Dict[str, Any]:
    # NOTE: demo-grade registration — passwords are NEVER persisted.
    node = COUNTRY_NODE_MAP.get(req.country.lower(), "BRICS-IND-NODE-01")
    record = {
        "id": f"usr-{uuid.uuid4().hex[:12]}",
        "fullName": req.fullName,
        "email": req.email,
        "role": req.role,
        "country": req.country,
        "node_assigned": node,
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
    _persist("users", record)
    return {"status": "success", "message": "User registered successfully", "user": record}


# ──────────────────────────────────────────────────────────────────────────────
# GET /mandi-spot — REAL CBOT/ICE futures converted with live BRICS FX
# ──────────────────────────────────────────────────────────────────────────────
# Conversion constants: futures quote unit → USD per tonne
_FUTURES_TO_USD_TONNE = {
    "Wheat (CBOT)": lambda cents_per_bu: cents_per_bu / 100.0 * 36.744,   # 27.216 kg/bu
    "Maize (CBOT)": lambda cents_per_bu: cents_per_bu / 100.0 * 39.368,   # 25.401 kg/bu
    "Soybean (CBOT)": lambda cents_per_bu: cents_per_bu / 100.0 * 36.744,
    "Cotton (ICE)": lambda cents_per_lb: cents_per_lb * 22.0462,          # cents/lb → $/t
    "Coffee (ICE)": lambda cents_per_lb: cents_per_lb * 22.0462,
    "Sugar (ICE)": lambda cents_per_lb: cents_per_lb * 22.0462,
    "Rice (CBOT)": lambda cents_per_cwt: cents_per_cwt * 0.220462,        # cents/cwt → $/t
}

CURRENCY_SYMBOLS = {
    "INR": "₹", "BRL": "R$", "RUB": "₽", "CNY": "¥", "ZAR": "R",
    "EGP": "E£", "ETB": "Br", "IRR": "﷼", "AED": "Dh", "USD": "$",
}


@router.get("/mandi-spot")
async def get_mandi_spot_prices(
    currency: str = Query("INR", description="Target currency (INR/BRL/RUB/CNY/ZAR/EGP/ETB/IRR/AED/USD)"),
    country: str = Query("India"),
) -> Dict[str, Any]:
    """
    Real international benchmark prices: CBOT/ICE futures settled quotes,
    converted to USD/tonne with contract-unit math, then to the requested
    currency with live spot FX (Yahoo Finance). These are exchange benchmarks,
    not local retail mandi quotes — labeled accordingly.
    """
    currency = currency.upper() if currency.upper() in CURRENCY_SYMBOLS else "USD"
    try:
        quotes = await real_data.commodity_futures_quotes()
        fx = await real_data.fx_rates_vs_usd()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Market data unavailable: {exc}")

    rate = fx.get(currency, 1.0)
    symbol = CURRENCY_SYMBOLS[currency]
    commodities = []
    for name, conv in _FUTURES_TO_USD_TONNE.items():
        q = quotes.get(name)
        if not q:
            continue
        usd_t = conv(q["price_usd_unit"])
        local_t = usd_t * rate
        change = q["change_pct"]
        commodities.append({
            "crop": name,
            "price": f"{symbol}{local_t:,.0f}/t",
            "price_usd_ton": round(usd_t, 2),
            "fx_rate": round(rate, 4),
            "market": f"{q['exchange']} futures (real-time)",
            "trend": f"{'+' if change >= 0 else ''}{change}%",
            "direction": "up" if change >= 0 else "down",
        })

    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "currency": currency,
        "fx_usd_to_local": round(rate, 4),
        "data_basis": "CBOT/ICE futures benchmark converted at live FX — exchange benchmark, not local mandi retail",
        "sources": ["Yahoo Finance futures quotes", "Yahoo Finance FX"],
        "commodities": commodities,
    }


# ──────────────────────────────────────────────────────────────────────────────
# GET /corpus-stats — real size of the RAG knowledge corpus actually indexed
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/corpus-stats")
def get_corpus_stats() -> Dict[str, Any]:
    """
    Live count of verified agronomic documents the FAISS RAG engine actually
    has embedded, so the UI shows the true corpus size instead of a guess.
    """
    try:
        docs = rag_service.documents
        metas = rag_service.metadata
        status = rag_service.status()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"RAG engine unavailable: {exc}")
    return {
        "document_count": len(docs),
        "indexed": len(docs) > 0,
        "by_source": sorted({m.get("source", "unknown") for m in metas}),
        "embedding_model": status.get("embedding_model"),
        "note": "Inline BRICS verified corpus (ICAR/Embrapa/ARC/CAAS/VNIIEA) + local knowledge markdown, embedded locally into FAISS",
    }
