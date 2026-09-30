"""
Transboundary Pest & Pathogen Early Warning Network — FloraNet
==============================================================

As farmers run real leaf diagnoses (POST /api/v1/doctor/diagnose), the
geolocation of each identified transboundary pest is appended to a shared,
anonymized event store. The policy dashboard aggregates those events into
hotspot cells and derives migration vectors toward the nearest matching
agro-ecological corridor in a NEIGHBOURING BRICS member state.

WHAT IS STORED (privacy contract)
  - pest category, crop, BRICS country attribution
  - the coordinate snapped to a 0.5° cell (~55 km) — coarser than any
    individual farm holding, so a household cannot be re-identified
  - observation time (UTC) and the diagnosis confidence score
WHAT IS NEVER STORED
  - farmer identity, account ids, phone/e-mail
  - exact farm coordinates, image pixels, or the free-text query

EVERYTHING COMPUTED FROM STOREED EVENTS IS A DERIVED ESTIMATE and carries
`derived: true` plus the exact arithmetic in `method` — a vector is never
presented as an observation, and a real EONET observation is never presented
as a model output. When no diagnosis has been observed yet the payload is
simply empty; no placeholder hotspots are fabricated.
"""

from __future__ import annotations

import math
import os
import re
import sqlite3
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# ──────────────────────────────────────────────────────────────────────────────
# Anonymization
# ──────────────────────────────────────────────────────────────────────────────

# Coordinate grid cell size in degrees. 0.5° ≈ 55 km at the equator — coarse
# enough that the cell centre never pinpoints a farm, fine enough that
# corridor-level migration still reads on a continental map.
GRID_DEG = 0.5

_ANONYMIZATION_NOTE = (
    "Diagnosis coordinates are snapped to a 0.5° cell (~55 km). No farmer "
    "identity, exact farm location, image or free-text query is stored."
)

# ──────────────────────────────────────────────────────────────────────────────
# Tracked transboundary pests
# ──────────────────────────────────────────────────────────────────────────────

# Matched (case-insensitively) against the model's disease label and the
# farmer's query. Only these tracked categories enter the network — anything
# else is left out rather than bucketed into a catch-all that would distort
# the hotspot view.
#
# `vectorable` marks the pests whose corridor model applies: Fall Armyworm's
# primary host is maize, so its vectors target the documented maize
# agro-ecological belts below. Polyphagous or non-maize pests still appear as
# hotspots but get `vector: null` instead of a made-up direction.
PESTS: Dict[str, Dict[str, Any]] = {
    "fall_armyworm": {
        "name": "Fall Armyworm",
        "scientific": "Spodoptera frugiperda",
        "patterns": ["armyworm", "spodoptera", "frugiperda"],
        "vectorable": True,
    },
    "stem_borer": {
        "name": "Stem Borer",
        "scientific": "Chilo / Busseola spp.",
        "patterns": ["stem borer", "borer damage", "borer infestation", "busseola", "chilo"],
        "vectorable": False,
    },
    "desert_locust": {
        "name": "Desert Locust",
        "scientific": "Schistocerca gregaria",
        "patterns": ["desert locust", "locust plague", "locust swarm", "schistocerca"],
        "vectorable": False,
    },
    "false_codling_moth": {
        "name": "False Codling Moth",
        "scientific": "Thaumatotibia leucotreta",
        "patterns": ["false codling", "thaumatotibia", "leucotreta"],
        "vectorable": False,
    },
}


def classify_pest(disease: Optional[str], query: Optional[str] = None) -> Optional[str]:
    """Return the tracked pest key for a diagnosis, or None when untracked."""
    text = f"{disease or ''} {query or ''}".lower()
    for key, meta in PESTS.items():
        if any(pat in text for pat in meta["patterns"]):
            return key
    return None


# ──────────────────────────────────────────────────────────────────────────────
# Country attribution
# ──────────────────────────────────────────────────────────────────────────────

# Both edge call sites include the country in the diagnosis query, so the
# query is the primary source. The bounding boxes below are the fallback —
# deliberately conservative rectangles used ONLY when no country was stated,
# and disclosed via `country_source: "bounding_box"`.
_QUERY_COUNTRY_PATTERN = re.compile(
    r"\b(india|brazil|russia|china|south africa|egypt|ethiopia|iran|uae)\b",
    re.IGNORECASE,
)

_BBOX_COUNTRY_ORDER: List[tuple] = [
    # (country, lat_min, lat_max, lng_min, lng_max) — checked in order where
    # rectangles overlap (China before Russia; UAE before Iran).
    ("China", 18.0, 54.0, 73.0, 135.0),
    ("Russia", 41.0, 82.0, 19.0, 180.0),
    ("India", 6.0, 37.5, 68.0, 97.5),
    ("Brazil", -34.0, 5.5, -74.5, -34.0),
    ("South Africa", -35.0, -22.0, 16.0, 33.5),
    ("Egypt", 22.0, 32.0, 24.0, 37.0),
    ("Ethiopia", 3.0, 15.5, 32.5, 48.5),
    ("UAE", 22.0, 26.5, 51.0, 56.5),
    ("Iran", 24.5, 40.5, 44.0, 63.5),
]


def _country_from_query(query: Optional[str]) -> Optional[str]:
    if not query:
        return None
    m = _QUERY_COUNTRY_PATTERN.search(query)
    if not m:
        return None
    name = m.group(1).lower()
    return {"south africa": "South Africa", "uae": "UAE"}.get(name, name.capitalize())


def _country_from_coords(lat: float, lng: float) -> Optional[str]:
    for country, lat0, lat1, lng0, lng1 in _BBOX_COUNTRY_ORDER:
        if lat0 <= lat <= lat1 and lng0 <= lng <= lng1:
            return country
    return None


# ──────────────────────────────────────────────────────────────────────────────
# BRICS agro-ecological corridor anchors
# ──────────────────────────────────────────────────────────────────────────────

# Documented maize agro-ecological belts / maize research areas across BRICS
# member states. These are reference points of REAL named regions (cited in
# the `name` field), not model output — the vector arithmetic below only ever
# measures geometry between an observed hotspot and one of these anchors.
AGRO_CORRIDORS: List[Dict[str, Any]] = [
    {"id": "in_vidarbha", "country": "India", "name": "Vidarbha maize belt (Maharashtra)", "lat": 21.15, "lng": 79.10},
    {"id": "in_raichur", "country": "India", "name": "Raichur maize belt (Karnataka)", "lat": 16.21, "lng": 77.36},
    {"id": "za_mpumalanga", "country": "South Africa", "name": "Mpumalanga maize highveld", "lat": -25.47, "lng": 30.45},
    {"id": "za_free_state", "country": "South Africa", "name": "Free State maize belt", "lat": -28.45, "lng": 26.85},
    {"id": "br_mato_grosso", "country": "Brazil", "name": "Cerrado maize belt (Mato Grosso)", "lat": -12.64, "lng": -55.42},
    {"id": "br_goias", "country": "Brazil", "name": "Goiás Cerrado maize belt", "lat": -16.70, "lng": -49.30},
    {"id": "cn_north_china", "country": "China", "name": "North China Plain maize belt", "lat": 35.50, "lng": 114.00},
    {"id": "cn_songnen", "country": "China", "name": "Songnen Plain maize belt (Northeast China)", "lat": 45.50, "lng": 124.00},
    {"id": "ru_kuban", "country": "Russia", "name": "Kuban maize belt (Southern Russia)", "lat": 45.03, "lng": 38.98},
    {"id": "ru_black_earth", "country": "Russia", "name": "Central Black Earth belt (Voronezh)", "lat": 51.67, "lng": 39.20},
    {"id": "et_bako", "country": "Ethiopia", "name": "Bako maize area (Oromia)", "lat": 9.10, "lng": 39.98},
    {"id": "eg_nile_delta", "country": "Egypt", "name": "Nile Delta maize belt", "lat": 30.60, "lng": 31.20},
    {"id": "ir_golestan", "country": "Iran", "name": "Golestan maize belt", "lat": 36.84, "lng": 54.28},
]


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2 - p1
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _bearing_deg(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dl = math.radians(lng2 - lng1)
    y = math.sin(dl) * math.cos(p2)
    x = math.cos(p1) * math.sin(p2) - math.sin(p1) * math.cos(p2) * math.cos(dl)
    return (math.degrees(math.atan2(y, x)) + 360.0) % 360.0


_COMPASS = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"]


def _compass_word(bearing_deg: float) -> str:
    return _COMPASS[int(((bearing_deg % 360.0) + 22.5) // 45.0) % 8]


def _vector_for(cluster_lat: float, cluster_lng: float, origin_country: Optional[str]) -> Optional[Dict[str, Any]]:
    """
    Nearest SAME-CROP corridor in a DIFFERENT BRICS member state.

    Returns the geometric derivation (bearing + great-circle distance) or
    None — no country attribution means no "toward a neighbouring state"
    claim can be made, and we refuse to invent one.
    """
    if not origin_country:
        return None
    candidates = [c for c in AGRO_CORRIDORS if c["country"] != origin_country]
    if not candidates:
        return None
    best = min(candidates, key=lambda c: _haversine_km(cluster_lat, cluster_lng, c["lat"], c["lng"]))
    distance = _haversine_km(cluster_lat, cluster_lng, best["lat"], best["lng"])
    bearing = _bearing_deg(cluster_lat, cluster_lng, best["lat"], best["lng"])
    return {
        "to_country": best["country"],
        "to_corridor": best["name"],
        "to_lat": best["lat"],
        "to_lng": best["lng"],
        "direction": _compass_word(bearing),
        "bearing_deg": round(bearing, 1),
        "distance_km": round(distance, 0),
        "derived": True,
        "method": (
            f"great-circle bearing/distance from the anonymized hotspot cell to "
            f"the nearest documented maize agro-corridor in another BRICS state "
            f"({best['name']})"
        ),
    }


# ──────────────────────────────────────────────────────────────────────────────
# Storage — embedded SQLite (zero-dependency, matches the $0 stack)
# ──────────────────────────────────────────────────────────────────────────────

_DB_PATH = Path(
    os.environ.get("PEST_WATCH_DB")
    or Path(__file__).resolve().parents[2] / "data" / "pest_watch.sqlite3"
)
_LOCK = threading.Lock()


def _connect() -> sqlite3.Connection:
    _DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(_DB_PATH, timeout=15)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def _ensure_schema(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS pest_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pest TEXT NOT NULL,
            crop TEXT,
            country TEXT,
            country_source TEXT,
            lat_cell REAL NOT NULL,
            lng_cell REAL NOT NULL,
            confidence REAL,
            observed_at TEXT NOT NULL
        )
        """
    )
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_pest_events_observed ON pest_events (observed_at)"
    )
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_pest_events_pest_cell ON pest_events (pest, lat_cell, lng_cell)"
    )
    conn.commit()


def record_diagnosis(
    *,
    disease: Optional[str],
    query: Optional[str] = "",
    coordinates: Optional[str] = "",
    crop: Optional[str] = "",
    confidence: Optional[float] = None,
) -> Optional[Dict[str, Any]]:
    """
    Append one anonymized observation for a TRACKED transboundary pest.

    Called from the diagnosis pipeline after a real model answer — returns the
    stored event, or None when the pest is untracked or the coordinates are
    unparseable (never raises: tracking must not be able to fail a diagnosis).
    """
    pest_key = classify_pest(disease, query)
    if pest_key is None:
        return None

    try:
        parts = re.split(r"[,\s]+", (coordinates or "").strip())
        lat, lng = float(parts[0]), float(parts[1])
        if not (-90.0 <= lat <= 90.0 and -180.0 <= lng <= 180.0):
            return None
    except (ValueError, IndexError):
        return None

    # Snap to the anonymization grid (round-half-away-from-zero on the cell).
    lat_cell = math.floor(lat / GRID_DEG + 0.5) * GRID_DEG if lat >= 0 else math.ceil(lat / GRID_DEG - 0.5) * GRID_DEG
    lng_cell = math.floor(lng / GRID_DEG + 0.5) * GRID_DEG if lng >= 0 else math.ceil(lng / GRID_DEG - 0.5) * GRID_DEG
    lat_cell, lng_cell = round(lat_cell, 3), round(lng_cell, 3)

    country = _country_from_query(query)
    country_source = "query" if country else None
    if country is None:
        country = _country_from_coords(lat, lng)
        country_source = "bounding_box" if country else None

    observed_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    meta = PESTS[pest_key]

    with _LOCK:
        conn = _connect()
        try:
            _ensure_schema(conn)
            conn.execute(
                """
                INSERT INTO pest_events
                    (pest, crop, country, country_source, lat_cell, lng_cell, confidence, observed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    pest_key,
                    (crop or "").lower() or None,
                    country,
                    country_source,
                    lat_cell,
                    lng_cell,
                    float(confidence) if confidence is not None else None,
                    observed_at,
                ),
            )
            conn.commit()
        finally:
            conn.close()

    return {
        "pest": pest_key,
        "pest_name": meta["name"],
        "country": country,
        "lat_cell": lat_cell,
        "lng_cell": lng_cell,
        "observed_at": observed_at,
    }


def list_events(window_days: int = 30, limit: int = 500) -> List[Dict[str, Any]]:
    """Raw anonymized events inside the window (newest first)."""
    cutoff = (datetime.now(timezone.utc) - timedelta(days=window_days)).isoformat(timespec="seconds")
    with _LOCK:
        conn = _connect()
        try:
            _ensure_schema(conn)
            rows = conn.execute(
                "SELECT * FROM pest_events WHERE observed_at >= ? ORDER BY observed_at DESC LIMIT ?",
                (cutoff, limit),
            ).fetchall()
        finally:
            conn.close()
    return [dict(r) for r in rows]


# ──────────────────────────────────────────────────────────────────────────────
# Aggregation: hotspots + derived migration vectors
# ──────────────────────────────────────────────────────────────────────────────

# Level thresholds on observation count — disclosed verbatim in the payload so
# a consumer can re-derive the label instead of trusting a black box.
_LEVEL_METHOD = "observation count in the cell: 1 = watch, 2–4 = cluster, 5+ = hotspot"


def _level_for(count: int) -> str:
    if count >= 5:
        return "hotspot"
    if count >= 2:
        return "cluster"
    return "watch"


def build_vectors_payload(window_days: int = 30) -> Dict[str, Any]:
    """
    Cluster the anonymized events into hotspot cells and derive each cell's
    migration vector toward the nearest same-crop corridor in a neighbouring
    BRICS state.
    """
    events = list_events(window_days=window_days)

    groups: Dict[tuple, Dict[str, Any]] = {}
    for ev in events:
        key = (ev["pest"], ev["lat_cell"], ev["lng_cell"])
        group = groups.get(key)
        if group is None:
            group = {
                "pest": ev["pest"],
                "pest_name": PESTS[ev["pest"]]["name"],
                "scientific_name": PESTS[ev["pest"]]["scientific"],
                "latitude": ev["lat_cell"],
                "longitude": ev["lng_cell"],
                "event_count": 0,
                "first_observed": ev["observed_at"],
                "last_observed": ev["observed_at"],
                "crops": set(),
                "countries": {},
                "confidences": [],
            }
            groups[key] = group
        group["event_count"] += 1
        group["first_observed"] = min(group["first_observed"], ev["observed_at"])
        group["last_observed"] = max(group["last_observed"], ev["observed_at"])
        if ev["crop"]:
            group["crops"].add(ev["crop"])
        if ev["country"]:
            group["countries"][ev["country"]] = group["countries"].get(ev["country"], 0) + 1
        if ev["confidence"] is not None:
            group["confidences"].append(ev["confidence"])

    clusters: List[Dict[str, Any]] = []
    for group in groups.values():
        # Country = the most frequent attribution among the cell's events.
        origin = max(group["countries"].items(), key=lambda kv: kv[1])[0] if group["countries"] else None
        meta = PESTS[group["pest"]]
        vector = _vector_for(group["latitude"], group["longitude"], origin) if meta["vectorable"] else None
        clusters.append(
            {
                "id": f"{group['pest']}@{group['latitude']},{group['longitude']}",
                "pest": group["pest"],
                "pest_name": group["pest_name"],
                "scientific_name": group["scientific_name"],
                "latitude": group["latitude"],
                "longitude": group["longitude"],
                "country": origin,
                "country_attribution": (
                    "cell events attributed from the diagnosis query" if origin else "unattributed"
                ),
                "event_count": group["event_count"],
                "level": _level_for(group["event_count"]),
                "first_observed": group["first_observed"],
                "last_observed": group["last_observed"],
                "crops": sorted(group["crops"]),
                "mean_confidence": (
                    round(sum(group["confidences"]) / len(group["confidences"]), 3)
                    if group["confidences"]
                    else None
                ),
                "vector": vector,
            }
        )

    clusters.sort(key=lambda c: (-c["event_count"], c["pest"], c["id"]))

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "window_days": window_days,
        "event_count": len(events),
        "cluster_count": len(clusters),
        "anonymization": {
            "grid_degrees": GRID_DEG,
            "note": _ANONYMIZATION_NOTE,
        },
        "method": {
            "clustering": "events grouped by (pest, 0.5° cell); displayed at the cell centre",
            "level": _LEVEL_METHOD,
            "vectors": (
                "geometric bearing + great-circle distance from the cell to the "
                "nearest documented maize agro-ecological corridor in a DIFFERENT "
                "BRICS member state; empty when the cell's country is unattributed"
            ),
            "derived": True,
            "seeded": False,
        },
        "corridors": AGRO_CORRIDORS,
        "clusters": clusters,
    }
