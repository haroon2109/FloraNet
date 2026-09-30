"""
FloraNet LLM Gateway — single open-source inference layer
=========================================================

All AI calls (diagnosis, rotation plans, soil advisory, chat, retrieval)
go through this module. Nothing else in the codebase talks to a model
directly, so swapping the model is a one-line env change.

Stack (100% open source, no API keys, runs offline on the edge):

  - Ollama                : local model server (Apache-2.0) exposing an
                            OpenAI-compatible API at /v1
  - Text / vision models  : Gemma 3 (Gemma terms) or Qwen2.5 / Llama 3.1
                            (Apache-2.0 / Llama license) — pick per hardware
  - Embeddings            : sentence-transformers (local, Apache-2.0)

Failures are explicit (LLMUnavailableError); no canned or fabricated
responses are ever returned when the model is unreachable.
"""

from __future__ import annotations

import base64
import json
import os
import time
from typing import Any, Optional, Sequence, Type, TypeVar

import numpy as np
from pydantic import BaseModel

TModel = TypeVar("TModel", bound=BaseModel)

# ──────────────────────────────────────────────────────────────────────────────
# Configuration (env-overridable, sensible low-RAM defaults)
# ──────────────────────────────────────────────────────────────────────────────

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434/v1")
OLLAMA_TEXT_MODEL = os.environ.get("OLLAMA_TEXT_MODEL", "gemma3:4b")
OLLAMA_VISION_MODEL = os.environ.get("OLLAMA_VISION_MODEL", OLLAMA_TEXT_MODEL)
OLLAMA_API_KEY = os.environ.get("OLLAMA_API_KEY", "ollama")  # any non-blank key; Ollama ignores it
OLLAMA_TIMEOUT_SECONDS = float(os.environ.get("OLLAMA_TIMEOUT_SECONDS", "300"))

_client = None  # lazily-created OpenAI client pointed at Ollama


def _get_client():
    """Lazily create the OpenAI-compatible client for Ollama."""
    global _client
    if _client is None:
        try:
            from openai import OpenAI
        except ImportError as exc:  # pragma: no cover
            raise LLMUnavailableError(
                "The 'openai' package is not installed — required to talk to Ollama"
            ) from exc
        _client = OpenAI(
            base_url=OLLAMA_BASE_URL,
            api_key=OLLAMA_API_KEY,
            timeout=OLLAMA_TIMEOUT_SECONDS,
            max_retries=0,  # retries are handled below so we can log them
        )
    return _client


class LLMUnavailableError(RuntimeError):
    """Raised when the local model server is unreachable or returns nothing."""


# ──────────────────────────────────────────────────────────────────────────────
# Health / status (used by diagnostics endpoints)
# ──────────────────────────────────────────────────────────────────────────────

def llm_status() -> dict:
    """Best-effort probe of the local inference server. Never raises."""
    try:
        models = _get_client().models.list()
        ids = [m.id for m in getattr(models, "data", [])]
        return {
            "available": True,
            "base_url": OLLAMA_BASE_URL,
            "text_model": OLLAMA_TEXT_MODEL,
            "vision_model": OLLAMA_VISION_MODEL,
            "models_loaded": ids,
        }
    except Exception as exc:
        return {
            "available": False,
            "base_url": OLLAMA_BASE_URL,
            "text_model": OLLAMA_TEXT_MODEL,
            "vision_model": OLLAMA_VISION_MODEL,
            "error": str(exc),
        }


def is_available() -> bool:
    """Cheap availability check used by services to degrade gracefully."""
    return llm_status()["available"]


# ──────────────────────────────────────────────────────────────────────────────
# Core chat plumbing
# ──────────────────────────────────────────────────────────────────────────────

def _post_chat(messages: Sequence[dict], *, model: str, temperature: float,
               max_retries: int = 2) -> str:
    """Send a chat completion to Ollama with light retry on transient faults."""
    last_exc: Optional[Exception] = None
    for attempt in range(max_retries + 1):
        try:
            response = _get_client().chat.completions.create(
                model=model,
                messages=list(messages),
                temperature=temperature,
            )
            text = (response.choices[0].message.content or "").strip()
            if not text:
                raise LLMUnavailableError("Model returned an empty response")
            return text
        except LLMUnavailableError:
            raise  # empty response is deterministic — do not retry
        except Exception as exc:
            last_exc = exc
            if attempt < max_retries:
                time.sleep(1.5 * (attempt + 1))
    raise LLMUnavailableError(
        f"Ollama inference failed after {max_retries + 1} attempts: {last_exc}"
    )


# ──────────────────────────────────────────────────────────────────────────────
# Public API — free-form text
# ──────────────────────────────────────────────────────────────────────────────

def generate_text(prompt: str, *, system: Optional[str] = None,
                  temperature: float = 0.3, model: Optional[str] = None) -> str:
    """Plain-text completion from the local text model."""
    messages: list[dict] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    return _post_chat(messages, model=model or OLLAMA_TEXT_MODEL, temperature=temperature)


def generate_conversation(messages: Sequence[dict], *, system: Optional[str] = None,
                          temperature: float = 0.3, model: Optional[str] = None) -> str:
    """
    Plain-text completion from a full multi-turn message list.

    Used by the conversational voice path, which replays the prior turns so a
    follow-up ("how much neem extract should I dilute per litre?") keeps its
    antecedent — the crop and disease named earlier — instead of being answered
    as though it stood alone. Blank turns are dropped and only user/assistant
    roles are accepted, so a malformed client payload cannot inject a system
    message and hijack the persona.
    """
    conversation: list[dict] = []
    if system:
        conversation.append({"role": "system", "content": system})
    for message in messages:
        role = (message or {}).get("role")
        if role not in ("user", "assistant"):
            continue
        content = str((message or {}).get("content") or "").strip()
        if content:
            conversation.append({"role": role, "content": content})

    if not conversation or conversation[-1]["role"] != "user":
        raise ValueError("conversation must end with a non-empty user turn")

    return _post_chat(conversation, model=model or OLLAMA_TEXT_MODEL, temperature=temperature)


# ──────────────────────────────────────────────────────────────────────────────
# Public API — structured JSON (Pydantic-validated)
# ──────────────────────────────────────────────────────────────────────────────

def _strip_fences(raw: str) -> str:
    """Tolerate markdown fences that smaller local models sometimes add."""
    raw = raw.strip()
    if raw.startswith("```"):
        lines = raw.splitlines()
        # Drop the opening fence (and optional language tag) and the closing fence.
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        raw = "\n".join(lines).strip()
    return raw


def generate_json(prompt: str, schema: Type[TModel], *, system: Optional[str] = None,
                  temperature: float = 0.2, model: Optional[str] = None) -> TModel:
    """
    Structured completion validated against a Pydantic schema.

    The JSON schema is injected into the prompt (Ollama structured-output
    format is also accepted by the OpenAI-compatible route via `format`,
    but prompt-schema + validation keeps this portable across local
    servers like llama.cpp / vLLM).
    """
    schema_json = json.dumps(schema.model_json_schema(), indent=2)
    instructed = (
        f"{prompt}\n\n"
        "Respond with ONLY a single valid JSON object that conforms exactly to "
        f"this JSON schema (no markdown fences, no commentary):\n{schema_json}"
    )
    messages: list[dict] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": instructed})
    raw = _post_chat(messages, model=model or OLLAMA_TEXT_MODEL, temperature=temperature)
    return schema.model_validate_json(_strip_fences(raw))


# ──────────────────────────────────────────────────────────────────────────────
# Public API — multimodal (vision)
# ──────────────────────────────────────────────────────────────────────────────

def generate_json_from_image(image_bytes: bytes, image_mime_type: str, prompt: str,
                             schema: Type[TModel], *, system: Optional[str] = None,
                             temperature: float = 0.2,
                             model: Optional[str] = None) -> TModel:
    """
    Vision + structured JSON in one call (leaf-photo diagnosis).

    The image is inlined as a base64 data URL — the standard OpenAI-compatible
    vision message shape that Ollama accepts for Gemma 3 / Qwen2.5-VL.
    """
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    schema_json = json.dumps(schema.model_json_schema(), indent=2)
    instructed = (
        f"{prompt}\n\n"
        "Respond with ONLY a single valid JSON object that conforms exactly to "
        f"this JSON schema (no markdown fences, no commentary):\n{schema_json}"
    )
    messages: list[dict] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({
        "role": "user",
        "content": [
            {"type": "text", "text": instructed},
            {"type": "image_url", "image_url": {"url": f"data:{image_mime_type};base64,{b64}"}},
        ],
    })
    raw = _post_chat(
        messages,
        model=model or OLLAMA_VISION_MODEL,
        temperature=temperature,
    )
    return schema.model_validate_json(_strip_fences(raw))


# ──────────────────────────────────────────────────────────────────────────────
# Public API — embeddings (local sentence-transformers, no network)
# ──────────────────────────────────────────────────────────────────────────────

EMBEDDING_MODEL_NAME = os.environ.get(
    "EMBEDDING_MODEL",
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
)

# Fallback embedding model served by Ollama itself (Apache-2.0), used when
# sentence-transformers is not installed. Keeps retrieval fully local/offline
# without shipping torch into slim containers.
OLLAMA_EMBED_MODEL = os.environ.get("OLLAMA_EMBED_MODEL", "nomic-embed-text")

_embedder: Any = None
_embedder_failed = False
_ollama_embed_failed = False


def get_embedder():
    """Lazily load the local embedding model (cached for process lifetime)."""
    global _embedder, _embedder_failed
    if _embedder is not None:
        return _embedder
    if _embedder_failed:
        return None
    try:
        from sentence_transformers import SentenceTransformer

        _embedder = SentenceTransformer(EMBEDDING_MODEL_NAME)
        print(f"[FloraNet LLM] Local embedder loaded: {EMBEDDING_MODEL_NAME}")
        return _embedder
    except Exception as exc:
        _embedder_failed = True
        print(f"[FloraNet LLM] Embedding model unavailable ({exc}) — "
              "trying Ollama embedding fallback.")
        return None


def embed_texts(texts: Sequence[str]) -> Optional[np.ndarray]:
    """
    Embed texts locally, fully offline:
      1. sentence-transformers (in-process) when available
      2. Ollama's /v1/embeddings endpoint (nomic-embed-text) otherwise
    Returns a float32 matrix (n, dim) with L2-normalized rows, or None when
    no local embedder can serve (caller decides the fallback).
    """
    model = get_embedder()
    if model is not None:
        try:
            vectors = model.encode(
                list(texts),
                batch_size=8,
                show_progress_bar=False,
                normalize_embeddings=True,
            )
            return np.asarray(vectors, dtype="float32")
        except Exception as exc:
            print(f"[FloraNet LLM] Embedding error: {exc}")

    return _embed_via_ollama(texts)


def _embed_via_ollama(texts: Sequence[str]) -> Optional[np.ndarray]:
    global _ollama_embed_failed
    if _ollama_embed_failed:
        return None
    try:
        response = _get_client().embeddings.create(
            model=OLLAMA_EMBED_MODEL,
            input=list(texts),
        )
        vectors = np.asarray(
            [item.embedding for item in response.data], dtype="float32"
        )
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return vectors / norms
    except Exception as exc:
        _ollama_embed_failed = True
        print(f"[FloraNet LLM] Ollama embeddings unavailable ({exc}) — "
              "retrieval will fall back to keyword scoring.")
        return None
