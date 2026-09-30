"""
FloraNet Agro-Agent — Ollama tool-calling loop
==============================================

An agentic endpoint where a local open-weights model (tool-trained:
Qwen 2.5 / Llama 3.1 class) autonomously orchestrates FloraNet's real-data
services to answer field questions:

  - get_soil_properties      → ISRIC SoilGrids (live)
  - get_weather_forecast     → Open-Meteo (live)
  - get_active_hazards       → NASA EONET (live)
  - search_knowledge_base    → FAISS RAG over ICAR/Embrapa/ARC corpus

The model decides which tools to call, in what order, and how to combine
the results. Every tool returns real data (or an explicit error) — nothing
is fabricated at any layer. The final answer, the tool trace and the data
sources used are returned together so the reasoning is fully auditable.

100% open source and offline-capable: inference runs on the local Ollama
server; the data tools call free public APIs (or degrade explicitly).
"""

from __future__ import annotations

import asyncio
import concurrent.futures
import json
import math
import os
import time
from typing import Any, Callable, Dict, List, Optional

from pydantic import BaseModel, Field

from app.services import llm, real_data
from app.services.rag import rag_service

# Tool-trained models only — Gemma 3 does NOT support tools in Ollama.
OLLAMA_AGENT_MODEL = os.environ.get("OLLAMA_AGENT_MODEL", "qwen2.5:3b")
AGENT_MAX_STEPS = int(os.environ.get("AGENT_MAX_STEPS", "6"))

AGENT_SYSTEM_PROMPT = (
    "You are FloraNet's field agronomy agent for BRICS smallholder farmers. "
    "You answer farmer questions by calling the provided tools to gather LIVE "
    "soil, weather, hazard and verified-knowledge data, then synthesize a "
    "practical, concise answer.\n"
    "Rules:\n"
    "- Always ground claims in tool results; quote the actual observed values.\n"
    "- Prefer the knowledge base for agronomic protocols (ICAR / Embrapa / ARC).\n"
    "- If a tool fails or returns no data, say so explicitly — never invent numbers.\n"
    "- Keep the final answer under 200 words and name the institutions/sources used."
)


# ──────────────────────────────────────────────────────────────────────────────
# Tool implementations (thin sync wrappers around the real-data services)
# ──────────────────────────────────────────────────────────────────────────────

def _run_async(coro, timeout: float = 40.0):
    """Bridge async real-data calls into this synchronous loop context."""
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(coro)
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        return pool.submit(asyncio.run, coro).result(timeout=timeout)


def _tool_get_soil_properties(lat: float, lng: float) -> dict:
    """Live ISRIC SoilGrids properties (SOC %, pH, texture) for the farm point."""
    raw = _run_async(real_data.soilgrids_point(lat, lng))
    return real_data.soilgrids_summary(raw)


def _tool_get_weather_forecast(lat: float, lng: float) -> dict:
    """Live current conditions + 7-day daily forecast summary (Open-Meteo)."""
    raw = _run_async(real_data.open_meteo_forecast(lat, lng))

    current = raw.get("current", {})
    daily = raw.get("daily", {})
    days = daily.get("time", [])

    def _series(key: str) -> list:
        vals = daily.get(key) or []
        return vals if len(vals) == len(days) else [None] * len(days)

    return {
        "current": {
            "temperature_c": current.get("temperature_2m"),
            "condition": real_data.wmo_to_condition(current.get("weather_code")),
            "humidity_pct": current.get("relative_humidity_2m"),
            "wind_kmh": current.get("wind_speed_10m"),
            "precipitation_mm": current.get("precipitation"),
        },
        "soil_moisture_0_1cm_pct": next(
            (round((v or 0) * 100, 1) for v in (raw.get("hourly", {}).get("soil_moisture_0_to_1cm") or [None]) if v is not None),
            None,
        ),
        "forecast_7d": [
            {
                "date": days[i],
                "temp_max_c": _series("temperature_2m_max")[i],
                "temp_min_c": _series("temperature_2m_min")[i],
                "precipitation_mm": _series("precipitation_sum")[i],
                "condition": real_data.wmo_to_condition(_series("weather_code")[i]),
            }
            for i in range(min(7, len(days)))
        ],
    }


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2 - p1
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _tool_get_active_hazards(lat: float, lng: float, radius_km: float = 500.0) -> dict:
    """Live NASA EONET natural-hazard events within radius_km of the farm."""
    try:
        events = real_data.eonet_brics_events(limit_per_country=20)
    except Exception as exc:
        return {"error": f"NASA EONET unavailable: {exc}", "hazards": []}

    nearby = []
    for e in events:
        dist = _haversine_km(lat, lng, e["lat"], e["lng"])
        if dist <= radius_km:
            nearby.append({
                "title": e["title"],
                "category": e["category"],
                "date": e["date"],
                "distance_km": round(dist, 0),
            })
    nearby.sort(key=lambda h: h["distance_km"])
    return {"hazards": nearby[:8], "checked_radius_km": radius_km}


def _tool_search_knowledge_base(query: str) -> dict:
    """Retrieve verified ICAR/Embrapa/ARC protocol chunks from the FAISS RAG store."""
    context, sources = rag_service.retrieve_context(query, top_k=2)
    return {
        "context": context[:3500],  # keep the tool payload bounded
        "sources": [s.get("source", s.get("id", "")) for s in sources],
    }


# ──────────────────────────────────────────────────────────────────────────────
# OpenAI-format tool schemas (consumed by Ollama's chat API)
# ──────────────────────────────────────────────────────────────────────────────

AGENT_TOOLS: List[dict] = [
    {
        "type": "function",
        "function": {
            "name": "get_soil_properties",
            "description": (
                "Get live soil properties for a farm location from ISRIC SoilGrids: "
                "soil organic carbon %, pH, clay/sand content and texture class."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "lat": {"type": "number", "description": "Farm latitude"},
                    "lng": {"type": "number", "description": "Farm longitude"},
                },
                "required": ["lat", "lng"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_weather_forecast",
            "description": (
                "Get live current weather and the 7-day daily forecast for a farm "
                "location from Open-Meteo, including topsoil moisture."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "lat": {"type": "number", "description": "Farm latitude"},
                    "lng": {"type": "number", "description": "Farm longitude"},
                },
                "required": ["lat", "lng"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_active_hazards",
            "description": (
                "Get active natural-hazard events (storms, droughts, floods, wildfires) "
                "near a farm location from NASA EONET, within a radius in km."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "lat": {"type": "number", "description": "Farm latitude"},
                    "lng": {"type": "number", "description": "Farm longitude"},
                    "radius_km": {"type": "number", "description": "Search radius in km (default 500)"},
                },
                "required": ["lat", "lng"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_knowledge_base",
            "description": (
                "Search the verified agronomic knowledge base (ICAR India, Embrapa Brazil, "
                "ARC South Africa, CAAS China, VNIIEA Russia protocols) for regenerative "
                "rotation, bio-remedy and soil-carbon guidance."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search phrase, e.g. 'black cotton soil sorghum rotation'"},
                },
                "required": ["query"],
            },
        },
    },
]

_TOOL_FUNCS: Dict[str, Callable[..., dict]] = {
    "get_soil_properties": _tool_get_soil_properties,
    "get_weather_forecast": _tool_get_weather_forecast,
    "get_active_hazards": _tool_get_active_hazards,
    "search_knowledge_base": _tool_search_knowledge_base,
}


def _execute_tool(name: str, arguments: dict) -> dict:
    """Run a tool by name with defensive argument coercion. Never raises."""
    func = _TOOL_FUNCS.get(name)
    if func is None:
        return {"error": f"Unknown tool: {name}"}
    try:
        # Coerce numeric params the model may pass as strings.
        coerced: Dict[str, Any] = {}
        for key, value in arguments.items():
            if key in {"lat", "lng", "radius_km"} and isinstance(value, str):
                try:
                    coerced[key] = float(value)
                except ValueError:
                    coerced[key] = value
            else:
                coerced[key] = value
        return func(**coerced)
    except Exception as exc:
        return {"error": f"{name} failed: {exc}"}


# ──────────────────────────────────────────────────────────────────────────────
# Response schema
# ──────────────────────────────────────────────────────────────────────────────

class AgentStep(BaseModel):
    step: int
    tool: str
    arguments: Dict[str, Any]
    ok: bool
    summary: str = Field(description="One-line summary of what the tool returned")


class AgentAdviseResponse(BaseModel):
    answer: str
    location: Optional[Dict[str, float]] = None
    steps: List[AgentStep]
    sources: List[str]
    model: str
    elapsed_seconds: float


# ──────────────────────────────────────────────────────────────────────────────
# The agent loop
# ──────────────────────────────────────────────────────────────────────────────

def _summarize_result(result: dict) -> str:
    """Compact one-line description of a tool result for the audit trail."""
    if result.get("error"):
        return f"error: {result['error']}"
    if "data_gap" in result:
        return f"SoilGrids: no coverage values at this cell ({result.get('data_gap', '')[:60]})"
    if "texture_class" in result or "soc_percent" in result or "ph" in result:
        return f"SoilGrids: SOC {result.get('soc_percent')}%, pH {result.get('ph')}, {result.get('texture_class', 'texture n/a')}"
    if "snapped_coord" in result:
        return "SoilGrids: values from snapped coordinate ~110m away"
    if "current" in result and "forecast_7d" in result:
        cur = result["current"]
        return f"Weather: {cur.get('condition')}, {cur.get('temperature_c')}°C, soil moisture {result.get('soil_moisture_0_1cm_pct')}%"
    if "hazards" in result:
        n = len(result.get("hazards", []))
        return f"{n} active hazard(s) within {result.get('checked_radius_km', '?')} km"
    if "context" in result:
        src = ", ".join(result.get("sources", [])) or "no match"
        return f"Knowledge retrieved from: {src}"
    return "ok"


def _collect_sources(steps: List[AgentStep], kb_sources: List[str]) -> List[str]:
    """Derive the cited-source list from the tool trace (no model invention)."""
    sources: List[str] = []
    for step in steps:
        if not step.ok:
            continue
        if step.tool == "get_soil_properties":
            sources.append("ISRIC SoilGrids 2.0")
        elif step.tool == "get_weather_forecast":
            sources.append("Open-Meteo API")
        elif step.tool == "get_active_hazards":
            sources.append("NASA EONET v3")
    for s in kb_sources:
        if s and s not in sources:
            sources.append(s)
    return sources


def run_agent(question: str, lat: Optional[float] = None, lng: Optional[float] = None) -> dict:
    """
    Full tool-calling loop against the local Ollama agent model.

    Returns the model's final answer plus an auditable trace: every tool
    call it made, whether it succeeded, a one-line summary, and the derived
    source list. Raises LLMUnavailableError when the model server is down.
    """
    if not question.strip():
        raise ValueError("question must not be empty")

    started = time.monotonic()

    location_hint = (
        f"The farm is at latitude {lat}, longitude {lng}."
        if lat is not None and lng is not None
        else "No farm coordinates were provided; ask for them via a tool only if needed."
    )
    messages: List[dict] = [
        {"role": "system", "content": f"{AGENT_SYSTEM_PROMPT}\n{location_hint}"},
        {"role": "user", "content": question},
    ]

    steps: List[AgentStep] = []
    kb_sources: List[str] = []

    for step_index in range(1, AGENT_MAX_STEPS + 1):
        response = llm._get_client().chat.completions.create(
            model=OLLAMA_AGENT_MODEL,
            messages=messages,
            tools=AGENT_TOOLS,
            temperature=0.2,
        )
        choice = response.choices[0]
        tool_calls = getattr(choice.message, "tool_calls", None)

        if not tool_calls:
            # Final natural-language answer
            return AgentAdviseResponse(
                answer=(choice.message.content or "").strip(),
                location={"lat": lat, "lng": lng} if lat is not None and lng is not None else None,
                steps=steps,
                sources=_collect_sources(steps, kb_sources),
                model=OLLAMA_AGENT_MODEL,
                elapsed_seconds=round(time.monotonic() - started, 1),
            ).model_dump()

        # Execute every tool call in this turn, feed results back, continue.
        messages.append(choice.message.model_dump(exclude_none=True))
        for call in tool_calls:
            name = call.function.name
            try:
                arguments = json.loads(call.function.arguments or "{}")
            except json.JSONDecodeError:
                arguments = {}
            result = _execute_tool(name, arguments)
            ok = "error" not in result
            if ok and name == "search_knowledge_base":
                kb_sources.extend(result.get("sources", []))
            steps.append(AgentStep(
                step=step_index,
                tool=name,
                arguments=arguments,
                ok=ok,
                summary=_summarize_result(result),
            ))
            messages.append({
                "role": "tool",
                "tool_call_id": getattr(call, "id", "") or name,
                "content": json.dumps(result, default=str)[:6000],
            })

    # Step budget exhausted — force a text-only wrap-up from what was gathered.
    trace = "\n".join(f"- {s.tool}: {s.summary}" for s in steps) or "(no tool results)"
    final = llm.generate_text(
        f"Farmer question: {question}\n\nData gathered so far:\n{trace}\n\n"
        "Write the final answer now using ONLY the data above. "
        "If data is missing, say what could not be verified.",
        system=AGENT_SYSTEM_PROMPT,
        temperature=0.2,
    )
    return AgentAdviseResponse(
        answer=final,
        location={"lat": lat, "lng": lng} if lat is not None and lng is not None else None,
        steps=steps,
        sources=_collect_sources(steps, kb_sources),
        model=OLLAMA_AGENT_MODEL,
        elapsed_seconds=round(time.monotonic() - started, 1),
    ).model_dump()
