"""
Agro-Agent API Router — FloraNet
POST /api/v1/agent/advise — a local-model agent that autonomously calls
live soil / weather / hazard / knowledge-base tools to answer field questions.

Returns the final answer together with a full audit trail: every tool call,
its arguments, whether it succeeded, a one-line result summary, and the
derived source list. No fabricated numbers at any layer.
"""

import concurrent.futures

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from app.services import llm
from app.services.agent import AGENT_MAX_STEPS, OLLAMA_AGENT_MODEL, run_agent

router = APIRouter()


class AgentAdviseRequest(BaseModel):
    question: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    language: str = "English"


@router.post("/advise")
async def agent_advise(req: AgentAdviseRequest) -> dict:
    """
    **FloraNet Agro-Agent** — tool-calling loop over the local Ollama model.

    The agent decides on its own which tools to invoke (SoilGrids soil
    properties, Open-Meteo weather, NASA EONET hazards, FAISS knowledge
    search), combines the live results, and answers with cited sources.
    """
    if not req.question.strip():
        raise HTTPException(status_code=422, detail="question must not be empty")

    question = req.question.strip()
    if req.language and req.language.lower() not in ("english", "en"):
        # Injected into the user turn: the agent loop has no separate language
        # channel, and the local model reliably follows this when it is part of
        # the question it is answering.
        question = f"{question}\n\n(Answer in {req.language}.)"

    try:
        loop = __import__("asyncio").get_running_loop()
    except RuntimeError:
        loop = None

    try:
        if loop:
            # The loop blocks on local inference — keep the event loop free.
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                result = await loop.run_in_executor(
                    pool, lambda: run_agent(question, req.lat, req.lng)
                )
        else:
            result = run_agent(question, req.lat, req.lng)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except llm.LLMUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except HTTPException:
        raise
    except Exception as exc:
        # The OpenAI-compatible client raises raw transport errors (APITimeoutError,
        # ConnectError …) when Ollama is slow or the model is missing. Report an
        # honest 503 instead of letting them escape as an unhandled 500.
        raise HTTPException(
            status_code=503,
            detail=f"Local agent model unavailable: {type(exc).__name__}: {exc}",
        )

    return result


@router.get("/tools")
def agent_tools() -> dict:
    """
    Static capability manifest for the Agro-Agent: the tools it can call and
    the local model serving it. Useful for the /interop playground and demos.
    """
    from app.services.agent import AGENT_TOOLS

    return {
        "model": OLLAMA_AGENT_MODEL,
        "max_steps": AGENT_MAX_STEPS,
        "tools": [t["function"]["name"] for t in AGENT_TOOLS],
        "tool_schemas": AGENT_TOOLS,
        "data_sources": [
            "ISRIC SoilGrids 2.0 (CC-BY 4.0)",
            "Open-Meteo (CC-BY 4.0)",
            "NASA EONET v3 (public domain)",
            "ICAR / Embrapa / ARC / CAAS / VNIIEA corpus (FAISS RAG)",
        ],
    }
