import base64
from app.worker import celery_app
from app.services.diagnosis import diagnose_crop
from app.services.telemetry import generate_regenerative_plan

@celery_app.task(name="tasks.process_disease_diagnosis")
def process_disease_diagnosis_task(image_b64: str, image_mime_type: str, query: str, coordinates: str):
    """
    Async task to process the multimodal diagnosis.
    Files are passed as base64 encoded strings to be easily serialized in Redis.
    """
    image_bytes = base64.b64decode(image_b64)
    
    result = diagnose_crop(image_bytes, image_mime_type, query, coordinates)
    return result

@celery_app.task(name="tasks.generate_regenerative_plan")
def generate_regenerative_plan_task(lat: float, lon: float, soil_type: str):
    """
    Async task to fetch satellite telemetry and synthesize a crop rotation plan.
    """
    result = generate_regenerative_plan(lat, lon, soil_type)
    return result
