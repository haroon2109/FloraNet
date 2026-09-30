"""
AgriN Data Exchange Router — FloraNet
GET /outbreaks → REAL natural-hazard events (NASA EONET v3) serialized as
Schema.org JSON-LD for cross-institution interoperability.

The previous implementation generated randomized fake outbreaks. This router
now serves only live data; if NASA EONET is unreachable it returns HTTP 503
so consumers never mistake a gap for ground truth.
"""

from fastapi import APIRouter, HTTPException
from app.models.exchange_schema import AgriNDataExchange, DiseaseOutbreak, GeoCoordinates
from app.services import real_data

router = APIRouter()


@router.get("/outbreaks", response_model=AgriNDataExchange, response_model_by_alias=True)
async def get_agrin_outbreaks():
    """
    Live environmental-hazard events over BRICS nations, serialized in the
    Open Agricultural Schema (JSON-LD). Severity is deterministic (category +
    recency), coordinates are the real observed epicenters.
    """
    try:
        events = real_data.eonet_brics_events(limit_per_country=8)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"NASA EONET unavailable: {exc}")

    outbreaks = [
        DiseaseOutbreak(
            name=f"{e['category']}: {e['title']}" if e.get("title") else e["category"],
            severity=_severity(e),
            location=GeoCoordinates(latitude=e["lat"], longitude=e["lng"]),
            dateReported=e.get("date") or "",
            reportedBy=f"NASA EONET v3 ({e.get('id', 'unknown')})",
        )
        for e in events
    ]
    return AgriNDataExchange(outbreaks=outbreaks)


def _severity(event: dict) -> str:
    """Deterministic severity label — identical logic to the DPG node router."""
    category = (event.get("category") or "").lower()
    date = event.get("date") or ""
    from datetime import datetime

    try:
        obs_day = datetime.fromisoformat(date.replace("Z", "+00:00"))
        age_days = (datetime.utcnow().replace(tzinfo=obs_day.tzinfo) - obs_day).days if obs_day.tzinfo else 7
    except ValueError:
        age_days = 7

    if any(w in category for w in ("severe storm", "drought", "wildfire")) and age_days <= 2:
        return "High"
    if any(w in category for w in ("flood", "volcan", "landslide")) and age_days <= 4:
        return "Medium"
    if any(w in category for w in ("severe storm", "drought", "wildfire")):
        return "Medium"
    return "Low"
