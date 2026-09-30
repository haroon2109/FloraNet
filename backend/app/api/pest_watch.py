"""
Transboundary Pest & Pathogen Early Warning API — FloraNet
==========================================================

  GET /api/v1/pest-watch/vectors?window_days=30
      → anonymized diagnosis hotspots + derived migration vectors toward the
        nearest same-crop agro-corridor in a neighbouring BRICS state.
  GET /api/v1/pest-watch/events?window_days=30&limit=500
      → the raw anonymized event log (0.5° cells, no farmer identity) so the
        aggregation can be audited against its inputs.

Everything here is built from REAL leaf diagnoses performed by farmers on the
edge. When nothing has been observed in the window the payload is empty —
no synthetic hotspots are ever returned to fill the map.
"""

from fastapi import APIRouter, Query

from app.services.pest_watch import build_vectors_payload, list_events

router = APIRouter()


@router.get("/vectors")
async def get_pest_vectors(
    window_days: int = Query(30, ge=1, le=365, description="Aggregation window in days"),
):
    """
    Hotspot cells derived from anonymized leaf diagnoses, each carrying its
    migration vector (bearing + great-circle distance) toward the nearest
    documented maize agro-ecological corridor in a *different* BRICS member
    state. Vectors are flagged `derived: true` with the exact method; cells
    whose country cannot be attributed carry `vector: null` rather than an
    invented direction.
    """
    return build_vectors_payload(window_days=window_days)


@router.get("/events")
async def get_pest_events(
    window_days: int = Query(30, ge=1, le=365),
    limit: int = Query(500, ge=1, le=2000),
):
    """Raw anonymized observations backing the aggregation (auditable input)."""
    return {
        "window_days": window_days,
        "grid_degrees": 0.5,
        "events": list_events(window_days=window_days, limit=limit),
    }
