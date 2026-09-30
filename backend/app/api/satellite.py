import threading
import uuid

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.task_store import put_task
from app.tasks import generate_regenerative_plan_task
from app.worker import redis_available

router = APIRouter()


class TaskResponse(BaseModel):
    task_id: str
    status: str


@router.get("/advisory", response_model=TaskResponse)
async def get_satellite_advisory(
    lat: float = Query(..., description="Latitude of the farm"),
    lon: float = Query(..., description="Longitude of the farm"),
    soil_type: str = Query("Unknown", description="Historical soil type if known"),
):
    try:
        # Preferred path: Celery worker via Redis (production / docker-compose)
        if redis_available():
            task = generate_regenerative_plan_task.delay(lat, lon, soil_type)
            return {"task_id": task.id, "status": "processing"}

        # Fallback path: no Redis/Celery — run inline on a worker thread and
        # serve the result through the in-memory task store (same polling
        # contract via GET /api/v1/tasks/{task_id}).
        task_id = f"inline-{uuid.uuid4().hex[:12]}"
        put_task(task_id, "PENDING")

        def _run_inline() -> None:
            try:
                result = generate_regenerative_plan_task.run(lat, lon, soil_type)
                put_task(task_id, "SUCCESS", result)
            except Exception as exc:
                put_task(task_id, "FAILURE", str(exc))

        threading.Thread(target=_run_inline, daemon=True).start()
        return {"task_id": task_id, "status": "processing"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
