"""
In-memory task store — FloraNet zero-dependency fallback.

When Redis/Celery is unavailable (judge machine, offline demo, cold start),
the doctor router executes the diagnosis inline and records the result here
so the frontend polling contract (GET /api/v1/tasks/{task_id}) keeps
working unchanged.

Tasks expire after 1 hour to bound memory in long-running demo sessions.
"""

import threading
import time
from typing import Any, Dict, List, Optional

_LOCK = threading.Lock()
_TASKS: Dict[str, Dict[str, Any]] = {}
_TTL_SECONDS = 3600
_MAX_TASKS = 200


def _prune() -> None:
    """Drop expired tasks and cap the store size (caller must hold _LOCK)."""
    now = time.time()
    expired = [
        k for k, v in _TASKS.items()
        if now - v.get("created_at", 0) > _TTL_SECONDS
    ]
    for k in expired:
        _TASKS.pop(k, None)
    while len(_TASKS) > _MAX_TASKS:
        _TASKS.pop(next(iter(_TASKS)), None)


def put_task(task_id: str, status: str, result: Any = None) -> None:
    with _LOCK:
        _prune()
        _TASKS[task_id] = {
            "status": status,
            "result": result,
            "created_at": time.time(),
        }


def get_task(task_id: str) -> Optional[Dict[str, Any]]:
    with _LOCK:
        _prune()
        task = _TASKS.get(task_id)
        if task is None:
            return None
        return {"task_id": task_id, "status": task["status"], "result": task["result"]}


def snapshot_tasks() -> List[Dict[str, Any]]:
    """A consistent copy of every stored task, for read-only aggregation.

    The AgriN federation endpoint needs to enumerate diagnoses, which means
    reading the whole store. Exposing that through an accessor (rather than
    importing the private `_TASKS` dict) keeps the lock discipline in one place
    and means a future change to the store's internal shape does not silently
    break federation.
    """
    with _LOCK:
        _prune()
        return [
            {"task_id": task_id, "status": t["status"], "result": t["result"]}
            for task_id, t in _TASKS.items()
        ]
