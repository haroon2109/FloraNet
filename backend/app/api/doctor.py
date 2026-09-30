import base64
import threading
import uuid

from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from pydantic import BaseModel

from app.task_store import put_task
from app.tasks import process_disease_diagnosis_task
from app.worker import redis_available
from app.services import plantvillage

router = APIRouter()

class TaskResponse(BaseModel):
    task_id: str
    status: str


@router.get("/grounding")
async def get_diagnosis_grounding():
    """
    **Open-dataset grounding metadata** — live provenance for the PlantVillage
    corpus (Hughes & Salathé 2015; 54,306 open leaf images, 14 crops, 38
    classes) that the diagnostic pipeline is anchored to, plus the real
    canonical-repo health check (GitHub API, keyless). The UI shows this so
    farmers and judges can see what open benchmark grounds the diagnostic
    vocabulary — and that no private evaluation set is claimed.
    """
    health = await plantvillage.dataset_health()
    return {
        "dataset": health,
        "class_count": len(plantvillage.PLANTVILLAGE_CLASSES),
        "sample_classes": plantvillage.PLANTVILLAGE_CLASSES[:8],
        "role": (
            "Label grounding + validation reference for the local vision model. "
            "Inference runs on local open-weights models; PlantVillage provides "
            "the canonical open vocabulary the output is cross-checked against."
        ),
    }

@router.post("/diagnose", response_model=TaskResponse)
async def get_diagnosis(
    image: UploadFile = File(...),
    query: str = Form(..., description="Transcribed query from the edge client"),
    coordinates: str = Form(...)
):
    try:
        # Read files into memory
        image_bytes = await image.read()

        # Base64 encode for celery serialization
        image_b64 = base64.b64encode(image_bytes).decode('utf-8')

        # Preferred path: Celery worker via Redis (production / docker-compose)
        if redis_available():
            task = process_disease_diagnosis_task.delay(
                image_b64=image_b64,
                image_mime_type=image.content_type or "image/jpeg",
                query=query,
                coordinates=coordinates
            )
            return {"task_id": task.id, "status": "processing"}

        # Fallback path: no Redis/Celery (judge machine, offline demo, cold
        # start) — run the same diagnosis inline on a worker thread and serve
        # the result through the in-memory task store. The frontend polling
        # contract is identical either way.
        task_id = f"inline-{uuid.uuid4().hex[:12]}"
        put_task(task_id, "PENDING")

        def _run_inline() -> None:
            try:
                result = process_disease_diagnosis_task.run(
                    image_b64,
                    image.content_type or "image/jpeg",
                    query,
                    coordinates,
                )
                put_task(task_id, "SUCCESS", result)
            except Exception as exc:  # surfaced verbatim to the polling client
                put_task(task_id, "FAILURE", str(exc))

        threading.Thread(target=_run_inline, daemon=True).start()
        return {"task_id": task_id, "status": "processing"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
