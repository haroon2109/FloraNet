"""
Telemetry Service — FloraNet
Aggregates LIVE agronomic data sources for the regenerative-plan generator:

  - Open-Meteo      : 7-day forecast + soil moisture (real)
  - ISRIC SoilGrids : SOC / pH / texture at the farm point (real)
  - NASA POWER      : radiation, humidity, rain (real)
  - Copernicus DSE  : latest real Sentinel-2 L2A acquisition metadata (real)

Sentinel-2 band pixels (NDVI/NDRE) are NOT computed here — that requires
authenticated raster access. We expose the real scene metadata instead and
omit NDVI rather than inventing a value.

Plan synthesis runs on a local open-weights model via the Ollama gateway;
without it the caller receives an explicit LLMUnavailableError.
"""

import asyncio
import concurrent.futures
import json

from app.models.satellite_schema import RegenerativePlanResponse
from app.services import llm
from app.services import real_data
from app.services.rag import rag_service


def _run_async(coro, timeout: float = 40.0):
    """Bridge async real-data calls into Celery's synchronous worker context."""
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(coro)
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        return pool.submit(asyncio.run, coro).result(timeout=timeout)


def get_open_meteo_data(lat: float, lon: float):
    """Fetch 7-day forecast and soil moisture from Open-Meteo API (real)."""
    return _run_async(real_data.open_meteo_forecast(lat, lon))


def get_soilgrids_data(lat: float, lon: float):
    """Real soil properties from ISRIC SoilGrids (values may be null)."""
    return _run_async(real_data.soilgrids_point(lat, lon))


def get_nasa_power_data(lat: float, lon: float):
    """Real agro-climatology from NASA POWER."""
    return _run_async(real_data.nasa_power_daily(lat, lon))


def get_satellite_context(lat: float, lon: float):
    """Real Sentinel-2 L2A acquisition metadata via Copernicus catalogue."""
    return _run_async(real_data.sentinel2_latest_pass(lat, lon))


def generate_regenerative_plan(lat: float, lon: float, historical_soil_type: str) -> dict:
    sat = get_satellite_context(lat, lon)
    weather = get_open_meteo_data(lat, lon)
    soil_raw = get_soilgrids_data(lat, lon)
    nasa = get_nasa_power_data(lat, lon)

    try:
        soil_summary = real_data.soilgrids_summary(soil_raw)
    except Exception:
        soil_summary = {"source": "SoilGrids unavailable"}

    rag_context, _sources = rag_service.retrieve_context(
        f"Regenerative agriculture cover crops {historical_soil_type}", top_k=2
    )

    prompt = f"""You are an expert regenerative agronomist and AI agent.
A farmer at coordinates ({lat}, {lon}) has requested a 3-Year Regenerative Crop Rotation Plan.

LIVE CONTEXT (all real data):
- Latest Sentinel-2 L2A scene over the farm (Copernicus catalogue): {json.dumps(sat) if sat else "No scene available"}
- Open-Meteo 7-day forecast & soil moisture: {json.dumps(weather.get("daily", {}))}
- ISRIC SoilGrids soil properties: {json.dumps(soil_summary)}
- NASA POWER agro-climatology (radiation, humidity, rain): {json.dumps(nasa.get("properties", {}).get("parameter", {})) if nasa else "Unavailable"}

VERIFIED RAG KNOWLEDGE BASE:
{rag_context}

CRITICAL REQUIREMENTS:
- Ground the plan in the live data above; quote the actual observed values.
- For India (ICAR): bio-remedies like Panchagavya, Trichoderma viride, drought-tolerant millets.
- For Brazil (Embrapa): Direct Planting Systems (Plantio Direto), Bradyrhizobium N-fixation.
- For South Africa (ARC): semi-arid conservation, Fall Armyworm bio-trap management.
- If satellite NDVI is unavailable, base canopy inference on the live soil/weather data and say so explicitly.

Synthesize:
1. soil_degradation_index (0.0 to 1.0) justified from the live soil/weather numbers.
2. A 3-year rotation plan focused on legume N-fixation, cover cropping, SOC maximization per the BRICS models.
3. Microclimate alerts derived from the actual forecast/rain data.
"""
    result = llm.generate_json(
        prompt,
        schema=RegenerativePlanResponse,
        temperature=0.3,
    )
    return result.model_dump()
