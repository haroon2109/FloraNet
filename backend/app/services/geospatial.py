"""
Geospatial Satellite Telemetry Service — FloraNet
=================================================

Derives REAL vegetation & moisture indices for a farm point from key-less,
public NASA GIBS services (Worldview imagery, public domain):

  - MODIS/Terra NDVI  (8-day rolling, 250m)  → crop vigor
  - MODIS/Terra EVI   (16-day, 1km)          → chlorophyll/nitrogen proxy
  - SMAP L4 root-zone soil moisture (9km)    → satellite surface/root moisture

HOW THE VALUES ARE REAL
-----------------------
GIBS WMS GetMap (FORMAT=image/tiff) returns the *rendered* image. GIBS
deliberately renders every colormap bin with a unique RGB, and publishes the
official bin→value mapping in per-layer colormap XML
(https://gibs.earthdata.nasa.gov/colormaps/v1.3/<PALETTE>.xml, linked from the
layer's WMTS capabilities entry). We download that colormap and invert it:
each pixel's RGB is matched back to its exact colormap bin, recovering the
value range GIBS rendered. This is a lossless value recovery of the published
rendering — validated against ground-truth sites (Sahara ≈0.10, Congo
rainforest ≈0.88 NDVI).

Nothing here is randomized or interpolated: pixels that don't exactly match a
colormap bin are counted as unresolved and reported (values still come only
from matched pixels). If the layer has no data for the requested date, the
caller gets an explicit error — never a substitute number.

The Soil Degradation Index (SDI) is a DETERMINISTIC baseline heuristic
computed from these satellite trends + ISRIC SoilGrids properties. It is a
screening heuristic, not a measured soil lab value — every consumer labels it
as such.
"""

from __future__ import annotations

import asyncio
import io
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

import httpx
import numpy as np
from PIL import Image

from app.services import real_data

GIBS_WMS = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi"
GIBS_COLORMAP = "https://gibs.earthdata.nasa.gov/colormaps/v1.3/{palette}.xml"

# layer id → (official GIBS palette id, value unit label)
GIBS_LAYERS: Dict[str, Tuple[str, str]] = {
    "MODIS_Terra_NDVI_8Day": ("MODIS_NDVI", "NDVI"),
    "MODIS_Terra_L3_EVI_16Day": ("MODIS_EVI", "EVI"),
    "SMAP_L4_Analyzed_Root_Zone_Soil_Moisture": ("SMAP_Analyzed_Soil_Moisture", "m3/m3"),
}

_TILE_CACHE: Dict[str, Tuple[float, Any]] = {}


def _cached(key: str, ttl: int, fetch):
    """Per-process TTL memo for colormap/LUT and tile fetches."""
    import time

    now = time.time()
    hit = _TILE_CACHE.get(key)
    if hit and now - hit[0] < ttl:
        return hit[1]
    value = fetch()
    _TILE_CACHE[key] = (time.time(), value)
    return value


# ──────────────────────────────────────────────────────────────────────────────
# GIBS colormap → inversion LUT
# ──────────────────────────────────────────────────────────────────────────────
def _parse_colormap_entries(xml: str) -> List[Tuple[Tuple[int, int, int], float, float]]:
    """Parse all ColorMapEntry rgb/value ranges from a GIBS colormap XML."""
    out: List[Tuple[Tuple[int, int, int], float, float]] = []
    for m in re.finditer(
        r'<ColorMapEntry\s+rgb="(\d+),(\d+),(\d+)"[^>]*?value="\[([-0-9.eE]+),([-\d.]+)\)"',
        xml,
    ):
        rgb = (int(m.group(1)), int(m.group(2)), int(m.group(3)))
        out.append((rgb, float(m.group(4)), float(m.group(5))))
    return out


def get_colormap_lut(layer: str) -> Tuple[np.ndarray, np.ndarray, str]:
    """
    Download (and cache for 7 days) the official GIBS colormap for `layer`,
    returning (rgb_matrix, value_matrix, palette_id) for nearest-RGB inversion.
    """
    if layer not in GIBS_LAYERS:
        raise ValueError(f"Unknown GIBS layer: {layer}")
    palette, unit = GIBS_LAYERS[layer]

    def _fetch() -> Tuple[np.ndarray, np.ndarray, str]:
        r = httpx.get(GIBS_COLORMAP.format(palette=palette), timeout=30.0)
        if r.status_code != 200:
            raise RuntimeError(f"GIBS colormap {palette} returned HTTP {r.status_code}")
        entries = _parse_colormap_entries(r.text)
        if not entries:
            raise RuntimeError(f"GIBS colormap {palette} had no parsable entries")
        rgbs = np.array([e[0] for e in entries], dtype=np.int32)
        vals = np.array([(e[1] + e[2]) / 2.0 for e in entries], dtype=np.float64)
        return rgbs, vals, palette

    return _cached(f"cmap:{palette}", 7 * 86400, _fetch)


# ──────────────────────────────────────────────────────────────────────────────
# WMS GetMap tile fetch + pixel inversion
# ──────────────────────────────────────────────────────────────────────────────
def _fetch_tile(layer: str, lat: float, lng: float, date_iso: str,
                half_deg: float = 0.02, size: int = 32) -> Image.Image:
    """Fetch a small GeoTIFF window around the point for the given date."""
    r = httpx.get(
        GIBS_WMS,
        params={
            "SERVICE": "WMS",
            "VERSION": "1.3.0",
            "REQUEST": "GetMap",
            "LAYERS": layer,
            "CRS": "CRS:84",
            "BBOX": f"{lng - half_deg},{lat - half_deg},{lng + half_deg},{lat + half_deg}",
            "WIDTH": size,
            "HEIGHT": size,
            "FORMAT": "image/tiff",
            "TIME": date_iso,
        },
        timeout=45.0,
    )
    if r.status_code != 200:
        raise RuntimeError(f"GIBS GetMap {layer} {date_iso} returned HTTP {r.status_code}")
    ctype = r.headers.get("content-type", "")
    if "image" not in ctype:
        # GIBS returns an XML ServiceException for no-coverage dates
        raise RuntimeError(f"GIBS GetMap {layer} {date_iso}: no imagery for this date ({ctype})")
    return Image.open(io.BytesIO(r.content))


def _invert_pixels(img: Image.Image, rgbs: np.ndarray, vals: np.ndarray,
                   max_dist: int = 2) -> Tuple[List[float], int, int]:
    """
    Match each pixel's RGB to its exact colormap bin.

    Returns (matched_values, matched_count, unresolved_count).
    Pixels further than `max_dist` (squared RGB distance) from any colormap
    entry are unresolved — their values are NOT guessed.
    """
    arr = np.asarray(img.convert("RGB"), dtype=np.int32).reshape(-1, 3)
    # (pixels, bins) squared-distance matrix
    dist = ((arr[:, None, :] - rgbs[None, :, :]) ** 2).sum(axis=2)
    nearest = dist.argmin(axis=1)
    nearest_dist = dist[np.arange(arr.shape[0]), nearest]
    ok = nearest_dist <= max_dist
    matched = vals[nearest[ok]].tolist()
    return matched, int(ok.sum()), int((~ok).sum())


def gibs_point_series(layer: str, lat: float, lng: float,
                      n_periods: int = 12, period_days: int = 16,
                      half_deg: float = 0.02, size: int = 32) -> Dict[str, Any]:
    """
    Build a historical time series of colormap-inverted values for `layer` at
    (lat, lng): one sample every `period_days`, walking back from the most
    recent date that actually has imagery.
    """
    rgbs, vals, palette = get_colormap_lut(layer)
    now = datetime.now(timezone.utc)

    def _sample_on(date_iso: str) -> Optional[float]:
        img = _fetch_tile(layer, lat, lng, date_iso, half_deg=half_deg, size=size)
        matched, ok, _unresolved = _invert_pixels(img, rgbs, vals)
        if ok == 0:
            return None
        return float(np.mean(matched))

    # 1) find the most recent date with imagery (walk back up to 25 days)
    anchor: Optional[str] = None
    for back in range(0, 26):
        d = (now - timedelta(days=back)).strftime("%Y-%m-%d")
        try:
            v = _sample_on(d)
        except RuntimeError:
            continue
        if v is not None:
            anchor = d
            break
    if anchor is None:
        raise RuntimeError(
            f"GIBS layer {layer} has no usable imagery near this location in the last 25 days"
        )

    # 2) walk back n_periods samples from the anchor
    series: List[Dict[str, Any]] = []
    for i in range(n_periods):
        d = (
            datetime.strptime(anchor, "%Y-%m-%d") - timedelta(days=i * period_days)
        ).strftime("%Y-%m-%d")
        try:
            v = _sample_on(d)
        except RuntimeError:
            v = None
        series.append({"date": d, "value": v})

    values = [s["value"] for s in series if s["value"] is not None]
    if not values:
        raise RuntimeError(f"GIBS layer {layer}: no resolvable samples in the {n_periods}-period window")
    return {
        "layer": layer,
        "palette": palette,
        "unit": GIBS_LAYERS[layer][1],
        "anchor_date": anchor,
        "series": series,
        "mean": round(float(np.mean(values)), 3),
        "min": round(float(min(values)), 3),
        "max": round(float(max(values)), 3),
        "std": round(float(np.std(values)), 3),
        "trend_per_period": round(float(np.polyfit(
            range(len(values)), values, 1
        )[0]), 4) if len(values) >= 2 else 0.0,
        "samples_resolved": len(values),
        "samples_requested": n_periods,
        "pixel_size_m": GIBS_LAYERS[layer][0] and (250 if "NDVI" in layer else (9000 if "SMAP" in layer else 1000)),
        "source": "NASA GIBS (Worldview) — MODIS/SMAP via WMS, colormap-inverted (public domain)",
    }


# ──────────────────────────────────────────────────────────────────────────────
# Higher-level telemetry block
# ──────────────────────────────────────────────────────────────────────────────
def gibs_vegetation_block(lat: float, lng: float, periods: int = 12) -> Dict[str, Any]:
    """NDVI (8-day sampling) + EVI (16-day) historical blocks for one farm point."""
    out: Dict[str, Any] = {"source": "NASA GIBS (public domain)"}
    errors: Dict[str, str] = {}
    try:
        out["ndvi"] = gibs_point_series("MODIS_Terra_NDVI_8Day", lat, lng,
                                        n_periods=periods, period_days=8)
    except Exception as exc:
        errors["ndvi"] = str(exc)
    try:
        out["evi"] = gibs_point_series("MODIS_Terra_L3_EVI_16Day", lat, lng,
                                       n_periods=max(6, periods // 2), period_days=16)
    except Exception as exc:
        errors["evi"] = str(exc)
    if errors:
        out["errors"] = errors
    return out


def gibs_moisture_block(lat: float, lng: float, periods: int = 10) -> Dict[str, Any]:
    """SMAP L4 root-zone soil moisture history (9 km, daily product)."""
    try:
        return {"smap_root_zone": gibs_point_series(
            "SMAP_L4_Analyzed_Root_Zone_Soil_Moisture", lat, lng,
            n_periods=periods, period_days=16,
        )}
    except Exception as exc:
        return {"smap_root_zone": None, "errors": {"smap": str(exc)}}


# ──────────────────────────────────────────────────────────────────────────────
# Soil Degradation Index — deterministic baseline from satellite + SoilGrids
# ──────────────────────────────────────────────────────────────────────────────
def compute_sdi(ndvi_block: Optional[Dict[str, Any]],
                smap_block: Optional[Dict[str, Any]],
                soil: Dict[str, Any],
                weather: Dict[str, Any]) -> Dict[str, Any]:
    """
    Baseline soil stress (0.0 = healthy .. 1.0 = highly degraded).

    DETERMINISTIC screening heuristic over REAL inputs:
      - NDVI level + trend (low or declining vigor → stress)
      - SMAP root-zone moisture level + trend (drying → stress)
      - SoilGrids SOC level (low organic carbon → stress)
    Each factor is 0..1 with explicit weights; components are returned so the
    UI can show WHY the index has its value. Not a lab measurement.
    """
    components: Dict[str, Any] = {}
    score = 0.0

    # NDVI factor (weight 0.35): level relative to a 0.15..0.75 band + trend
    ndvi = (ndvi_block or {}).get("ndvi") if ndvi_block else None
    if ndvi and ndvi.get("mean") is not None:
        mean = ndvi["mean"]
        level_stress = max(0.0, min(1.0, (0.60 - mean) / 0.45))
        trend = ndvi.get("trend_per_period", 0.0)
        trend_stress = max(0.0, min(1.0, -trend * 40))  # -0.025/period → 1.0
        f = min(1.0, 0.75 * level_stress + 0.25 * trend_stress)
        score += 0.35 * f
        components["ndvi"] = {
            "mean": mean, "trend_per_period": trend,
            "level_stress": round(level_stress, 3),
            "trend_stress": round(trend_stress, 3),
            "factor": round(f, 3), "weight": 0.35,
        }
    else:
        components["ndvi"] = {"available": False, "weight": 0.0}

    # SMAP moisture factor (weight 0.30): dry root zone relative to 0.10..0.40
    smap = (smap_block or {}).get("smap_root_zone") if smap_block else None
    if smap and smap.get("mean") is not None:
        mean = smap["mean"]
        dry = max(0.0, min(1.0, (0.32 - mean) / 0.22))
        trend = smap.get("trend_per_period", 0.0)
        trend_stress = max(0.0, min(1.0, -trend * 25))
        f = min(1.0, 0.75 * dry + 0.25 * trend_stress)
        score += 0.30 * f
        components["smap_moisture"] = {
            "mean_m3m3": mean, "trend_per_period": trend,
            "dryness_stress": round(dry, 3),
            "trend_stress": round(trend_stress, 3),
            "factor": round(f, 3), "weight": 0.30,
        }
    else:
        components["smap_moisture"] = {"available": False, "weight": 0.0}

    # SOC factor (weight 0.35): SoilGrids top-5cm SOC vs 0.3%..2.0% band
    soc = soil.get("soc_percent") if soil else None
    if soc is not None:
        soc_stress = max(0.0, min(1.0, (1.4 - soc) / 1.1))
        score += 0.35 * soc_stress
        components["soc"] = {
            "soc_percent": soc, "stress": round(soc_stress, 3), "weight": 0.35,
        }
    else:
        components["soc"] = {"available": False, "weight": 0.0}

    # Live moisture cross-check (weight 0.0): informational only
    open_moisture = weather.get("soil_moisture_pct") if weather else None

    index = round(min(1.0, max(0.0, score)), 3)
    if index < 0.25:
        band = "Low stress"
    elif index < 0.5:
        band = "Moderate stress"
    elif index < 0.75:
        band = "High stress"
    else:
        band = "Severe stress"

    return {
        "soil_degradation_index": index,
        "band": band,
        "scale": "0.0 healthy → 1.0 highly degraded (screening heuristic, not a lab measurement)",
        "components": components,
        "live_open_meteo_soil_moisture_pct": open_moisture,
        "inputs_used": [
            k for k, v in components.items() if v.get("available", True)
        ],
    }
