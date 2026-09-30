import os
import socket
from urllib.parse import urlparse

from celery import Celery

# Configure Celery to use Redis as the broker and backend
CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

celery_app = Celery(
    "worker",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=["app.tasks"] # We will create app/tasks.py for our async jobs
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


_DEFAULT_PORTS = {"redis": 6379, "rediss": 6379, "amqp": 5672, "amqps": 5672}


def redis_available() -> bool:
    """
    Fast TCP probe of the Celery broker so routers can pick the Celery path vs
    the inline fallback at request time. kombu's Connection does not dial the
    broker on construction, so a real socket check is used instead (fast: 0.5s
    timeout, no extra dependencies).
    """
    try:
        parsed = urlparse(CELERY_BROKER_URL)
        host = parsed.hostname or "localhost"
        port = parsed.port or _DEFAULT_PORTS.get(parsed.scheme, 6379)
        with socket.create_connection((host, port), timeout=0.5):
            return True
    except Exception:
        return False
