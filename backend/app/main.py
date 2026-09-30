import os

from celery.result import AsyncResult
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import agent, agrin, audio, doctor, dpg_node, exchange, farm, geospatial, pest_watch, regenerative, satellite, soil
from app.task_store import get_task
from app.worker import celery_app

# Pinned CORS origins (editable via env). Wildcard "*" together with
# allow_credentials=True is rejected by browsers, which silently breaks every
# credentialed cross-origin call from the frontend.
#
# Both common dev ports (3000 and 3001) are listed on purpose. `next dev`
# falls forward to the next free port whenever 3000 is occupied, so a
# developer whose machine already has something on :3000 ends up served on
# :3001 — and with only :3000 allowed, EVERY cross-origin API call from the
# frontend fails the preflight with HTTP 400 and no access-control-allow-origin.
# That presents as every live feed reporting "backend unreachable" (mandi
# prices, weather, soil, AgriN records) even though the backend is healthy,
# which is exactly the silent, misattributed failure this list prevents.
#
# Production deployments should still pin CORS_ORIGINS explicitly to the real
# frontend origin rather than relying on these localhost defaults.
_default_origins = ",".join(
    f"http://{host}:{port}"
    for host in ("localhost", "127.0.0.1")
    for port in (3000, 3001)
)
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get("CORS_ORIGINS", _default_origins).split(",")
    if o.strip()
]

app = FastAPI(
    title="FloraNet API",
    description="FOSS Central Backend for FloraNet Edge Advisory System",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to the FloraNet API"}


@app.get("/api/v1/tasks/{task_id}")
def get_task_status(task_id: str):
    """
    Unified task-status endpoint.

    Celery results are resolved through AsyncResult; inline fallback results
    (no-Redis mode) are resolved through the in-memory task store, so the
    frontend polling contract is identical in both modes.
    """
    if task_id.startswith("inline-"):
        task = get_task(task_id)
        if task is None:
            return {"task_id": task_id, "status": "PENDING", "result": None}
        return task

    try:
        task_result = AsyncResult(task_id, app=celery_app)
        return {
            "task_id": task_id,
            "status": task_result.status,
            "result": task_result.result if task_result.ready() else None,
        }
    except Exception:
        # Redis/Celery unavailable — degrade honestly instead of crashing the
        # request. Unknown inline-style IDs report PENDING (the worker may not
        # have registered the result yet); unknown IDs report an explicit error.
        if task_id.startswith("celery-"):
            return {"task_id": task_id, "status": "PENDING", "result": None}
        return {
            "task_id": task_id,
            "status": "FAILURE",
            "result": "Task backend unavailable — cannot resolve this task ID.",
        }


app.include_router(audio.router, prefix="/api/v1", tags=["audio"])
app.include_router(doctor.router, prefix="/api/v1/doctor", tags=["doctor"])
app.include_router(satellite.router, prefix="/api/v1/satellite", tags=["satellite"])
app.include_router(exchange.router, prefix="/api/v1/exchange", tags=["exchange"])
app.include_router(dpg_node.router, prefix="/api/v1/dpg", tags=["dpg_node"])
app.include_router(farm.router, prefix="/api/v1/farm", tags=["farm"])
app.include_router(soil.router, prefix="/api/v1/soil", tags=["soil"])
app.include_router(regenerative.router, prefix="/api/v1/regenerative", tags=["regenerative"])
app.include_router(geospatial.router, prefix="/api/v1/geospatial", tags=["geospatial"])
app.include_router(agent.router, prefix="/api/v1/agent", tags=["agent"])
# Transboundary Pest & Pathogen Early Warning Network: aggregated anonymized
# leaf-diagnosis hotspots + derived migration vectors (policy dashboard layer).
app.include_router(pest_watch.router, prefix="/api/v1/pest-watch", tags=["pest-watch"])
# AgriN (BARP) interoperability surface: the federable, JSON-LD view of every
# output type — genetic resources, agro-inputs, soil profiles, diagnoses.
app.include_router(agrin.router, prefix="/api/v1/agrin", tags=["agrin"])
