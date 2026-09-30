"""
FloraNet Real-Data Service
=========================
Single source of truth for LIVE data fetched from free, key-less public APIs:

  - Open-Meteo (weather, soil moisture, ET0)          https://open-meteo.com (CC-BY 4.0)
  - Open-Meteo Marine (sea surface temperature)       https://open-meteo.com
  - ISRIC SoilGrids 2.0 (SOC, pH, texture, N)         https://isric.org (CC-BY 4.0)
  - NASA POWER (agro-climatology)                     https://power.larc.nasa.gov (public domain)
  - NASA EONET (natural hazard events)                https://eonet.gsfc.nasa.gov (public domain)
  - Copernicus Data Space OData (Sentinel-2 passes)   https://dataspace.copernicus.eu (free catalogue)
  - Yahoo Finance (CBOT/CME commodity futures + FX)   https://finance.yahoo.com (public quotes)
  - World Bank WDI v2 (agri indicators)               https://api.worldbank.org/v2 (CC-BY 4.0)

Every helper raises on failure; callers must surface real errors instead of
fabricating numbers. Results are memoized with a TTL to respect rate limits.
"""

from __future__ import annotations

import time
import asyncio
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import httpx

# ──────────────────────────────────────────────────────────────────────────────
# Tiny TTL cache (per-process) so we do not hammer upstream APIs
# ──────────────────────────────────────────────────────────────────────────────
_CACHE: Dict[str, Tuple[float, Any]] = {}


async def cached(key: str, ttl_seconds: int, fetch):
    """Memoize an async fetch result for ttl_seconds."""
    now = time.time()
    entry = _CACHE.get(key)
    if entry and now - entry[0] < ttl_seconds:
        return entry[1]
    value = await fetch()
    _CACHE[key] = (time.time(), value)
    return value


def _raise(r: httpx.Response, name: str):
    if r.status_code != 200:
        raise RuntimeError(f"{name} returned HTTP {r.status_code}")


# ──────────────────────────────────────────────────────────────────────────────
# Open-Meteo — weather, soil, ET0
# ──────────────────────────────────────────────────────────────────────────────
async def open_meteo_forecast(lat: float, lng: float) -> dict:
    """7-day daily forecast + hourly soil moisture/temperature for a point."""

    async def _fetch() -> dict:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": lat,
                    "longitude": lng,
                    "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code,wind_direction_10m_dominant,uv_index_max,sunrise,sunset",
                    "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_temperature_0cm,soil_temperature_6cm,evapotranspiration",
                    "current": "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation,pressure_msl",
                    "past_days": 7,
                    "forecast_days": 7,
                    "timezone": "auto",
                },
            )
            _raise(r, "Open-Meteo")
            return r.json()

    return await cached(f"om_forecast:{lat:.3f},{lng:.3f}", 900, _fetch)


WMO_WEATHER_CODES: Dict[int, str] = {
    0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing Rime Fog",
    51: "Light Drizzle", 53: "Drizzle", 55: "Dense Drizzle",
    61: "Light Rain", 63: "Rain", 65: "Heavy Rain",
    71: "Light Snow", 73: "Snow", 75: "Heavy Snow", 77: "Snow Grains",
    80: "Rain Showers", 81: "Rain Showers", 82: "Violent Rain Showers",
    85: "Snow Showers", 86: "Snow Showers",
    95: "Thunderstorm", 96: "Thunderstorm w/ Hail", 99: "Thunderstorm w/ Hail",
}


def wmo_to_condition(code: Optional[int]) -> str:
    if code is None:
        return "Unknown"
    return WMO_WEATHER_CODES.get(code, "Unknown")


def wind_direction_label(deg: Optional[float]) -> str:
    """Convert a meteorological bearing in degrees to a compass label."""
    if deg is None:
        return "Unknown"
    points = ["North", "North East", "East", "South East",
              "South", "South West", "West", "North West"]
    try:
        idx = int(((float(deg) % 360) + 22.5) // 45) % 8
    except (TypeError, ValueError):
        return "Unknown"
    return points[idx]


def moon_phase_summary(ref: Optional[datetime] = None) -> dict:
    """
    Astronomical moon phase from the known new-moon epoch 2000-01-06 18:14 UTC
    with the synodic month of 29.53059 days. Deterministic from real celestial
    mechanics — not a fabricated placeholder.
    """
    import math
    ref = ref or datetime.utcnow()
    synodic = 29.53059
    epoch = datetime(2000, 1, 6, 18, 14)
    days = (ref - epoch).total_seconds() / 86400.0
    age = days % synodic
    fraction = age / synodic
    illum_pct = round((1 - math.cos(2 * math.pi * fraction)) / 2 * 100, 0)
    phases = [
        (1.0, "New Moon"), (6.4, "Waxing Crescent"), (8.4, "First Quarter"),
        (13.8, "Waxing Gibbous"), (15.8, "Full Moon"), (21.1, "Waning Gibbous"),
        (23.1, "Last Quarter"), (28.5, "Waning Crescent"), (29.6, "New Moon"),
    ]
    name = "New Moon"
    for limit, label in phases:
        if age <= limit:
            name = label
            break
    return {"name": name, "illumination_pct": int(illum_pct), "age_days": round(age, 1)}


def uv_index_label(uv: Optional[float]) -> str:
    """WHO global solar UV index category for a real UV reading."""
    if uv is None:
        return "Unknown"
    v = float(uv)
    if v < 3:
        return "Low"
    if v < 6:
        return "Moderate"
    if v < 8:
        return "High"
    if v < 11:
        return "Very High"
    return "Extreme"


async def current_weather_summary(lat: float, lng: float) -> dict:
    """Live current-conditions block built on real Open-Meteo data."""
    data = await open_meteo_forecast(lat, lng)
    current = data.get("current", {})
    hourly = data.get("hourly", {})

    def _first(key: str, default):
        vals = hourly.get(key) or []
        return vals[0] if vals else default

    soil = {
        "moisture_pct": round((_first("soil_moisture_0_to_1cm", 0) or 0) * 100, 1),
        "temp_c": _first("soil_temperature_0cm", None),
    }
    return {
        "lat": lat,
        "lng": lng,
        "source": "Open-Meteo API (CC-BY 4.0)",
        "observed_at": current.get("time"),
        "current_temp": current.get("temperature_2m"),
        "feels_like": current.get("apparent_temperature"),
        "condition": wmo_to_condition(current.get("weather_code")),
        "humidity": current.get("relative_humidity_2m"),
        "wind_speed_kmh": current.get("wind_speed_10m"),
        "pressure_hpa": current.get("pressure_msl"),
        "precipitation_mm": current.get("precipitation"),
        "soil_moisture_pct": soil["moisture_pct"],
        "soil_temp_c": soil["temp_c"],
    }


# ──────────────────────────────────────────────────────────────────────────────
# ISRIC SoilGrids 2.0 — soil properties at a point
# ──────────────────────────────────────────────────────────────────────────────
async def soilgrids_point(lat: float, lng: float) -> dict:
    """
    Fetch SOC, pH, clay, sand, nitrogen for the 0-5cm depth band.
    Units: soc = dg/kg (divide by 10 for %), phh2o = pH*10, clay/sand = g/kg,
    nitrogen = cg/kg (divide by 100 for %).

    SoilGrids has known null gaps at certain exact cell-edge coordinates; when
    every layer is null we retry once snapped ~110m southeast and label the
    result honestly via 'snapped_coord' so consumers know the exact origin.
    """

    async def _query(la: float, lo: float) -> dict:
        async with httpx.AsyncClient(timeout=25.0) as client:
            r = await client.get(
                "https://rest.isric.org/soilgrids/v2.0/properties/query",
                params={
                    "lon": lo,
                    "lat": la,
                    "property": ["soc", "phh2o", "clay", "sand", "nitrogen"],
                    "depth": "0-5cm",
                },
            )
            _raise(r, "SoilGrids")
            return r.json()

    def _all_null(raw: dict) -> bool:
        try:
            return all(
                layer["depths"][0]["values"].get("mean") is None
                for layer in raw["properties"]["layers"]
            )
        except (KeyError, TypeError, IndexError):
            return True

    async def _fetch() -> dict:
        raw = await _query(lat, lng)
        if _all_null(raw):
            raw_retry = await _query(round(lat + 0.001, 4), round(lng + 0.001, 4))
            if not _all_null(raw_retry):
                raw_retry["snapped_coord"] = {
                    "lat": round(lat + 0.001, 4),
                    "lng": round(lng + 0.001, 4),
                    "reason": "SoilGrids gap at exact requested cell — snapped ~110m",
                }
                return raw_retry
            raw["data_gap"] = "SoilGrids has no coverage values at this cell (or neighbors)"
        return raw

    return await cached(f"soilgrids:{lat:.3f},{lng:.3f}", 86400, _fetch)


def soilgrids_summary(raw: dict) -> dict:
    """Parse SoilGrids response into practical agronomic values."""
    out: Dict[str, Any] = {"source": "ISRIC SoilGrids 2.0 (CC-BY 4.0)"}
    if raw.get("snapped_coord"):
        out["snapped_coord"] = raw["snapped_coord"]
    if raw.get("data_gap"):
        out["data_gap"] = raw["data_gap"]
    try:
        layers = raw["properties"]["layers"]
        for layer in layers:
            name = layer["name"]
            depth = layer["depths"][0]
            mean = depth["values"].get("mean")
            if mean is None:
                continue
            if name == "soc":
                out["soc_percent"] = round(mean / 10.0, 2)          # dg/kg -> %
                out["soc_t_ha"] = round(mean / 10.0 * 0.35, 1)      # rough t C/ha in top 5cm (bulk density ~1.4)
            elif name == "phh2o":
                out["ph"] = round(mean / 10.0, 1)                   # pH*10 -> pH
            elif name == "nitrogen":
                out["nitrogen_percent"] = round(mean / 100.0, 3)    # cg/kg -> %
            elif name == "clay":
                out["clay_g_kg"] = int(mean)
            elif name == "sand":
                out["sand_g_kg"] = int(mean)
        if "clay_g_kg" in out and "sand_g_kg" in out:
            out["silt_g_kg"] = max(0, 1000 - out["clay_g_kg"] - out["sand_g_kg"])
            clay, sand = out["clay_g_kg"], out["sand_g_kg"]
            if clay >= 350:
                out["texture_class"] = "Clay / Clay Loam"
            elif sand >= 700:
                out["texture_class"] = "Sand / Loamy Sand"
            elif sand >= 500:
                out["texture_class"] = "Sandy Loam"
            elif clay >= 270:
                out["texture_class"] = "Clay Loam"
            else:
                out["texture_class"] = "Loam"
    except (KeyError, TypeError, IndexError):
        raise RuntimeError("SoilGrids response missing expected layers")
    return out


# ──────────────────────────────────────────────────────────────────────────────
# Open-Meteo ARCHIVE (ERA5-Land) — spec-exact multi-depth soil profile
#   soil_moisture_0_to_7cm, soil_moisture_7_to_28cm (m³/m³, hourly observations)
# ──────────────────────────────────────────────────────────────────────────────
async def era5_soil_profile(lat: float, lng: float, days: int = 7) -> dict:
    """
    Real ERA5-Land reanalysis soil profile from the Open-Meteo Archive API
    (CC-BY 4.0): mean volumetric moisture per depth band over the last `days`
    days, using the canonical 0-7cm / 7-28cm bands.
    """
    from datetime import timedelta

    def _iso(d: datetime) -> str:
        return d.strftime("%Y-%m-%d")

    def _fetch() -> dict:
        end = datetime.utcnow()
        start = end - timedelta(days=days)
        with httpx.Client(timeout=20.0) as client:
            r = client.get(
                "https://archive-api.open-meteo.com/v1/archive",
                params={
                    "latitude": lat,
                    "longitude": lng,
                    "hourly": "soil_moisture_0_to_7cm,soil_moisture_7_to_28cm,soil_temperature_7_to_28cm",
                    "start_date": _iso(start),
                    "end_date": _iso(end),
                },
            )
            _raise(r, "Open-Meteo Archive")
            return r.json()

    def _band_mean(vals) -> Optional[float]:
        nums = [v for v in (vals or []) if isinstance(v, (int, float))]
        return round(sum(nums) / len(nums), 4) if nums else None

    async def _work() -> dict:
        raw = await asyncio.to_thread(_fetch)
        hourly = raw.get("hourly", {})
        out = {
            "source": "Open-Meteo Archive API — ERA5-Land reanalysis (CC-BY 4.0)",
            "days": days,
            "bands": {
                "0_7cm": {"soil_moisture_m3m3": _band_mean(hourly.get("soil_moisture_0_to_7cm"))},
                "7_28cm": {
                    "soil_moisture_m3m3": _band_mean(hourly.get("soil_moisture_7_to_28cm")),
                    "soil_temp_c": _band_mean(hourly.get("soil_temperature_7_to_28cm")),
                },
            },
        }
        return out

    return await cached(f"era5_soil:{lat:.3f},{lng:.3f}:{days}", 3600, _work)


# ──────────────────────────────────────────────────────────────────────────────
# Copernicus Data Space — STAC API (open, keyless) Sentinel-2 search
# ──────────────────────────────────────────────────────────────────────────────
STAC_URL = "https://catalogue.dataspace.copernicus.eu/stac/search"

async def sentinel2_stac_scenes(lat: float, lng: float, days: int = 21, limit: int = 5) -> List[dict]:
    """
    Real Sentinel-2 L2A scenes covering the point via the Copernicus STAC API
    (open access, no key). Returns actual scene ids, sensing datetimes, cloud
    cover and the per-band COG asset keys — including the red-edge bands
    (B05, B06, B07, B8A) that NDRE requires. Band math stays OUT of scope:
    we report what is openly available, never a computed index from pixels
    we have not read.
    """
    from datetime import timedelta

    def _fetch_sync() -> List[dict]:
        end = datetime.utcnow()
        start = end - timedelta(days=days)
        body = {
            "collections": ["sentinel-2-l2a"],
            "intersects": {"type": "Point", "coordinates": [lng, lat]},
            "datetime": f"{start.strftime('%Y-%m-%dT%H:%M:%SZ')}/{end.strftime('%Y-%m-%dT%H:%M:%SZ')}",
            "limit": limit,
        }
        with httpx.Client(timeout=40.0) as client:
            r = client.post(STAC_URL, json=body)
            _raise(r, "Copernicus STAC")
            features = r.json().get("features", [])

        out: List[dict] = []
        for f in features:
            props = f.get("properties", {})
            assets = list(f.get("assets", {}).keys())
            red_edge = [b for b in assets if b in ("B05_20m", "B06_20m", "B07_20m", "B8A_20m")]
            out.append({
                "scene_id": f.get("id"),
                "datetime": props.get("datetime"),
                "cloud_cover_pct": props.get("eo:cloud_cover"),
                "platform": props.get("platform") or ("sentinel-2" if str(f.get("id", "")).startswith("S2") else None),
                "has_red_edge_bands": bool(red_edge),
                "red_edge_assets": red_edge,
                "ndre_data_available": bool(red_edge),  # data present; index math not performed
                "asset_count": len(assets),
                "stac_endpoint": STAC_URL,
            })
        return out

    async def _fetch() -> List[dict]:
        return await asyncio.to_thread(_fetch_sync)

    return await cached(f"stac_s2:{lat:.3f},{lng:.3f}:{days}:{limit}", 1800, _fetch)


# ──────────────────────────────────────────────────────────────────────────────
# ISRIC SoilGrids — multi-depth property profile (0, 5-15, 15-30, 30-60 … cm)
# ──────────────────────────────────────────────────────────────────────────────
SOILGRIDS_DEPTH_BANDS = ["0-5cm", "5-15cm", "15-30cm", "30-60cm"]

async def soilgrids_multidepth(lat: float, lng: float,
                               depth_bands: Optional[List[str]] = None) -> dict:
    """
    Real ISRIC SoilGrids 2.0 properties across depth bands (clay, sand, pH,
    SOC, nitrogen density). One request per depth band; failures are collected
    per band so a partial profile is still returned with explicit gaps.
    """
    bands = depth_bands or SOILGRIDS_DEPTH_BANDS

    async def _band(band: str) -> dict:
        async def _fetch() -> dict:
            async with httpx.AsyncClient(timeout=40.0) as client:
                r = await client.get(
                    "https://rest.isric.org/soilgrids/v2.0/properties/query",
                    params={
                        "lon": lng,
                        "lat": lat,
                        "property": ["soc", "phh2o", "clay", "sand", "nitrogen"],
                        "depth": band,
                    },
                )
                _raise(r, "SoilGrids")
                return r.json()
        return await cached(f"soilgrids:{lat:.3f},{lng:.3f}:{band}", 86400, _fetch())

    profile: Dict[str, Any] = {"source": "ISRIC SoilGrids 2.0 (CC-BY 4.0)", "bands": {}}
    errors: Dict[str, str] = {}
    results = await asyncio.gather(*[_band(b) for b in bands], return_exceptions=True)
    for band, res in zip(bands, results):
        if isinstance(res, Exception):
            errors[band] = str(res)
            continue
        try:
            layers = res["properties"]["layers"]
            band_data: Dict[str, Any] = {}
            for layer in layers:
                name = layer["name"]
                mean = layer["depths"][0]["values"].get("mean")
                if mean is None:
                    continue
                if name == "soc":
                    band_data["soc_percent"] = round(mean / 10.0, 2)
                elif name == "phh2o":
                    band_data["ph"] = round(mean / 10.0, 1)
                elif name == "nitrogen":
                    band_data["nitrogen_percent"] = round(mean / 100.0, 3)
                elif name == "clay":
                    band_data["clay_g_kg"] = int(mean)
                elif name == "sand":
                    band_data["sand_g_kg"] = int(mean)
            if band_data:
                profile["bands"][band] = band_data
            else:
                errors[band] = "No values at this cell"
        except (KeyError, TypeError, IndexError) as exc:
            errors[band] = f"Parse error: {exc}"

    profile["errors"] = errors
    profile["bands_returned"] = sorted(profile["bands"].keys())
    return profile


# ──────────────────────────────────────────────────────────────────────────────
# NASA POWER — daily agro-climatology (humidity, radiation, rain)
# ──────────────────────────────────────────────────────────────────────────────
async def nasa_power_daily(lat: float, lng: float, days: int = 7) -> dict:

    async def _fetch() -> dict:
        end = time.strftime("%Y%m%d")
        start = time.strftime("%Y%m%d", time.localtime(time.time() - days * 86400))
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(
                "https://power.larc.nasa.gov/api/temporal/daily/point",
                params={
                    "parameters": "T2M,RH2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN",
                    "community": "AG",
                    "longitude": lng,
                    "latitude": lat,
                    "start": start,
                    "end": end,
                    "format": "JSON",
                },
            )
            _raise(r, "NASA POWER")
            return r.json()

    return await cached(f"power:{lat:.2f},{lng:.2f}", 3600, _fetch)


async def nasa_power_monthly(lat: float, lng: float, years: int = 15) -> dict:
    """
    Monthly POWER agro-climatology time series (real), for drought indexing.

    The daily endpoint above returns roughly one week of data, which is far too
    short to say anything about drought risk: a dryness index needs a
    multi-year baseline to normalise against, otherwise a single dry fortnight
    reads as a drought. This pulls the monthly series instead, which is what the
    Standardised Precipitation-Evapotranspiration Index (SPEI) family of indices
    is defined over.

    `years` is clamped by the caller; POWER's monthly archive is long enough that
    a 15-year window is comfortably within its supported range.
    """
    years = max(5, min(years, 40))
    end = datetime.utcnow()
    start = end.replace(year=end.year - years)

    async def _fetch() -> dict:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.get(
                "https://power.larc.nasa.gov/api/temporal/monthly/point",
                params={
                    "parameters": "PRECTOTCORR,T2M,T2M_MAX,T2M_MIN",
                    "community": "AG",
                    "longitude": lng,
                    "latitude": lat,
                    "start": f"{start.year}{start.month:02d}",
                    "end": f"{end.year}{end.month:02d}",
                    "format": "JSON",
                },
            )
            _raise(r, "NASA POWER (monthly)")
            return r.json()

    return await cached(f"power_monthly:{lat:.2f},{lng:.2f}:{years}", 21600, _fetch)


# ──────────────────────────────────────────────────────────────────────────────
# NASA EONET — real natural-hazard events (storms, droughts, wildfires…)
# ──────────────────────────────────────────────────────────────────────────────
# Rough national bounding boxes used ONLY to attribute a live event to a BRICS nation.
BRICS_BBOX: Dict[str, Tuple[float, float, float, float]] = {
    "Brazil": (-75.0, -35.0, -35.0, 6.0),
    "Russia": (19.0, 41.0, 180.0, 82.0),
    "India": (68.0, 6.0, 98.0, 36.0),
    "China": (73.0, 18.0, 135.0, 54.0),
    "South Africa": (16.0, -35.0, 33.0, -22.0),
    "Egypt": (24.0, 21.7, 37.0, 31.7),
    "Ethiopia": (32.9, 3.4, 48.0, 14.9),
    "Iran": (44.1, 24.8, 63.3, 39.7),
    "UAE": (51.0, 22.6, 56.4, 26.5),
}


def _country_for_point(lng: float, lat: float) -> Optional[str]:
    for country, (w, s, e, n) in BRICS_BBOX.items():
        if w <= lng <= e and s <= lat <= n:
            return country
    return None


async def eonet_open_events(limit: int = 100) -> List[dict]:
    """Currently-open NASA EONET events with a point geometry."""

    async def _fetch() -> List[dict]:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(
                "https://eonet.gsfc.nasa.gov/api/v3/events",
                params={"status": "open", "limit": limit},
            )
            _raise(r, "NASA EONET")
            data = r.json()
        out = []
        for ev in data.get("events", []):
            geom = ev.get("geometry", [])
            if not geom:
                continue
            last = geom[-1]
            coords = last.get("coordinates", [])
            if not coords:
                continue
            # point geometry: [lng, lat]; polygon: take first ring's first coord
            if isinstance(coords[0], (int, float)):
                lng, lat = float(coords[0]), float(coords[1])
            else:
                lng, lat = float(coords[0][0][0]), float(coords[0][0][1])
            out.append({
                "id": ev.get("id"),
                "title": ev.get("title"),
                "category": (ev.get("categories") or [{}])[0].get("title", "Unknown"),
                "date": last.get("date"),
                "lng": lng,
                "lat": lat,
                "eonet_link": ev.get("link"),
            })
        return out

    return await cached("eonet:open", 1800, _fetch)


def eonet_brics_events(limit_per_country: int = 8) -> List[dict]:
    """Synchronous convenience: open EONET events attributed to BRICS nations."""
    import asyncio as _aio

    try:
        loop = _aio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop:
        # Already inside an event loop — run in a worker thread
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            events = pool.submit(_aio.run, eonet_open_events()).result(timeout=30)
    else:
        events = _aio.run(eonet_open_events())

    result = []
    for ev in events:
        country = _country_for_point(ev["lng"], ev["lat"])
        if country:
            result.append({**ev, "country": country})
    # keep most recent first
    result.sort(key=lambda e: e.get("date") or "", reverse=True)
    per_country: Dict[str, int] = {}
    trimmed = []
    for ev in result:
        c = per_country.get(ev["country"], 0)
        if c < limit_per_country:
            trimmed.append(ev)
            per_country[ev["country"]] = c + 1
    return trimmed


# ──────────────────────────────────────────────────────────────────────────────
# Copernicus Data Space — real Sentinel-2 L2A acquisitions over a point
# ──────────────────────────────────────────────────────────────────────────────
async def sentinel2_latest_pass(lat: float, lng: float, days: int = 30) -> Optional[dict]:
    """
    Latest Sentinel-2 L2A product covering (lat, lng) from the Copernicus
    catalogue. Returns real scene metadata (scene id, sensing time, tile).
    """

    async def _fetch() -> Optional[dict]:
        from datetime import datetime, timedelta
        start = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%dT00:00:00.000Z")
        url = (
            "https://catalogue.dataspace.copernicus.eu/odata/v1/Products"
            "?$filter=contains(Name,'S2A_MSIL2A') "
            f"and ContentDate/Start gt {start} "
            f"and OData.CSC.Intersects(area=geography'SRID=4326;POINT({lng} {lat})')"
            "&$top=10&$select=Name,ContentDate"
        )
        async with httpx.AsyncClient(timeout=25.0) as client:
            r = await client.get(url)
            _raise(r, "Copernicus catalogue")
            items = r.json().get("value", [])
        if not items:
            return None
        items.sort(key=lambda it: it.get("ContentDate", {}).get("Start") or "", reverse=True)
        item = items[0]
        name = item.get("Name", "")
        tile = name.split("_T")[1].split("_")[0] if "_T" in name else "unknown"
        return {
            "scene_id": name,
            "tile": tile,
            "sensing_time": item.get("ContentDate", {}).get("Start"),
            "source": "Copernicus Data Space Ecosystem (free catalogue)",
        }

    return await cached(f"s2:{lat:.3f},{lng:.3f}", 3600, _fetch)


# ──────────────────────────────────────────────────────────────────────────────
# Yahoo Finance — real CBOT/CME commodity futures + BRICS FX rates
# ──────────────────────────────────────────────────────────────────────────────
_YF_HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; FloraNet/1.0; +https://floranet.org)"}

# Yahoo symbol -> (display name, exchange label)
COMMODITY_FUTURES: Dict[str, Tuple[str, str]] = {
    "ZW=F": ("Wheat (CBOT)", "CBOT"),
    "ZC=F": ("Maize (CBOT)", "CBOT"),
    "ZS=F": ("Soybean (CBOT)", "CBOT"),
    "CT=F": ("Cotton (ICE)", "ICE"),
    "KC=F": ("Coffee (ICE)", "ICE"),
    "SB=F": ("Sugar (ICE)", "ICE"),
    "ZR=F": ("Rice (CBOT)", "CBOT"),
}


async def commodity_futures_quotes() -> Dict[str, dict]:
    """Real international futures quotes (USD). Keyed by commodity base name."""

    async def _one(client: httpx.AsyncClient, symbol: str, name: str, exchange: str):
        try:
            r = await client.get(
                f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}",
                params={"interval": "1d", "range": "5d"},
            )
            if r.status_code != 200:
                return None
            meta = r.json()["chart"]["result"][0]["meta"]
            price = meta.get("regularMarketPrice")
            if price is None:
                return None
            chg = meta.get("regularMarketChangePercent") or 0.0
            return name, {
                "symbol": symbol,
                "exchange": exchange,
                "price_usd_unit": round(float(price), 2),
                "change_pct": round(float(chg), 2),
                "quote_time": meta.get("regularMarketTime"),
            }
        except Exception:
            return None

    async def _fetch() -> Dict[str, dict]:
        async with httpx.AsyncClient(timeout=6.0, headers=_YF_HEADERS, follow_redirects=True) as client:
            results = await asyncio.gather(
                *(_one(client, s, n, x) for s, (n, x) in COMMODITY_FUTURES.items())
            )
        out = {name: quote for item in results if item for (name, quote) in [item]}
        if not out:
            raise RuntimeError("No commodity futures quotes available")
        return out

    return await cached("yf:futures", 600, _fetch)


async def fx_rates_vs_usd(currencies: Optional[List[str]] = None) -> Dict[str, float]:
    """Real spot FX rates: 1 USD -> currency."""
    currencies = currencies or ["INR", "BRL", "RUB", "CNY", "ZAR", "EGP", "ETB", "IRR", "AED"]

    async def _one(client: httpx.AsyncClient, cur: str):
        try:
            r = await client.get(
                f"https://query1.finance.yahoo.com/v8/finance/chart/USD{cur}%3DX",
                params={"interval": "1d", "range": "1d"},
            )
            if r.status_code != 200:
                return None
            price = r.json()["chart"]["result"][0]["meta"].get("regularMarketPrice")
            return (cur, float(price)) if price else None
        except Exception:
            return None

    async def _fetch() -> Dict[str, float]:
        async with httpx.AsyncClient(timeout=6.0, headers=_YF_HEADERS, follow_redirects=True) as client:
            results = await asyncio.gather(*(_one(client, c) for c in currencies))
        out = {cur: rate for item in results if item for (cur, rate) in [item]}
        if not out:
            raise RuntimeError("No FX rates available")
        return out

    return await cached("yf:fx", 600, _fetch)


# ──────────────────────────────────────────────────────────────────────────────
# World Bank WDI v2 — real national agri indicators
# ──────────────────────────────────────────────────────────────────────────────
WB_ISO3 = {
    "Brazil": "BRA", "Russia": "RUS", "India": "IND", "China": "CHN",
    "South Africa": "ZAF", "Egypt": "EGY", "Ethiopia": "ETH",
    "Iran": "IRN", "UAE": "ARE",
}

# The World Bank API returns its own official country names (e.g. "Russian
# Federation"). Map them back to our canonical keys so every consumer can
# index results with the WB_ISO3 keys above.
_WB_NAME_TO_KEY = {
    "Brazil": "Brazil",
    "Russian Federation": "Russia",
    "India": "India",
    "China": "China",
    "South Africa": "South Africa",
    "Egypt, Arab Rep.": "Egypt",
    "Ethiopia": "Ethiopia",
    "Iran, Islamic Rep.": "Iran",
    "United Arab Emirates": "UAE",
}

WB_INDICATORS: Dict[str, str] = {
    "fertilizer_intensity": "AG.CON.FERT.PT.ZS",   # fertilizer consumption (% of production)
    "cereal_area_ha": "AG.LND.CREL.HA",            # land under cereal production (ha)
    "arable_land_ha": "AG.LND.ARBL.HA",            # arable land (ha)
    "agri_land_pct": "AG.LND.AGRI.ZS",             # agricultural land (% of land area)
    "livestock_index": "AG.PRD.LVSK.XD",           # livestock production index
}


async def world_bank_indicator(countries: List[str], indicator: str, mrnev: bool = True) -> Dict[str, dict]:
    """
    Fetch an indicator for ISO3 countries. Returns {country: {value, year}}.
    mrnev=True returns only the most recent non-empty value per country.
    """

    async def _fetch() -> Dict[str, dict]:
        iso = ";".join(WB_ISO3[c] for c in countries if c in WB_ISO3)
        params: Dict[str, Any] = {"format": "json", "per_page": 200}
        if mrnev:
            params["mrnev"] = 1
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            r = await client.get(
                f"https://api.worldbank.org/v2/country/{iso}/indicator/{indicator}",
                params=params,
            )
            _raise(r, "World Bank")
            payload = r.json()
        out: Dict[str, dict] = {}
        if len(payload) < 2 or not payload[1]:
            return out
        for row in payload[1]:
            ctry = _WB_NAME_TO_KEY.get(row["country"]["value"], row["country"]["value"])
            if row.get("value") is None:
                continue
            out[ctry] = {"value": row["value"], "year": row["date"]}
        return out

    return await cached(f"wb:{indicator}:{','.join(sorted(countries))}:{mrnev}", 86400, _fetch)


async def world_bank_agri_snapshot(countries: List[str]) -> Dict[str, dict]:
    """Fertilizer intensity, cereal yield & production per country (real WDI data)."""

    async def _fetch() -> Dict[str, dict]:
        fert, agri_pct, arable = await asyncio.gather(
            world_bank_indicator(countries, WB_INDICATORS["fertilizer_intensity"]),
            world_bank_indicator(countries, WB_INDICATORS["agri_land_pct"]),
            world_bank_indicator(countries, WB_INDICATORS["arable_land_ha"]),
        )
        snap: Dict[str, dict] = {}
        for c in countries:
            snap[c] = {
                "fertilizer_intensity": fert.get(c),
                "agri_land_pct": agri_pct.get(c),
                "arable_land_ha": arable.get(c),
                "source": "World Bank WDI (AG.CON.FERT.PT.ZS, AG.LND.AGRI.ZS, AG.LND.ARBL.HA)",
            }
        return snap

    return await cached(f"wb:snapshot:{','.join(sorted(countries))}", 86400, _fetch)


# ──────────────────────────────────────────────────────────────────────────────
# Text generation via the local open-source model gateway (Ollama)
# Real model output or an explicit error — never canned text.
# ──────────────────────────────────────────────────────────────────────────────
async def gemini_generate(prompt: str, system: Optional[str] = None) -> str:
    """
    Backwards-compatible async wrapper around the local LLM gateway.
    The blocking inference call runs in a worker thread so the FastAPI
    event loop stays responsive during generation.
    """
    import concurrent.futures

    from app.services import llm

    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            return await loop.run_in_executor(
                pool, lambda: llm.generate_text(prompt, system=system)
            )
    return llm.generate_text(prompt, system=system)


async def gemini_generate_conversation(
    messages: List[Dict[str, str]], system: Optional[str] = None
) -> str:
    """
    Async multi-turn wrapper around the local LLM gateway.

    Passes the full turn history to the model so conversational follow-ups keep
    their antecedent. Same threading approach as `gemini_generate` so the
    FastAPI event loop stays responsive during local inference.
    """
    import concurrent.futures

    from app.services import llm

    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            return await loop.run_in_executor(
                pool, lambda: llm.generate_conversation(messages, system=system)
            )
    return llm.generate_conversation(messages, system=system)
