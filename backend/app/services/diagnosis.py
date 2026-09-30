"""
Diagnosis Service — FloraNet
Multimodal crop-disease diagnosis via a local open-weights vision model
(Gemma 3 / Qwen2.5-VL served by Ollama), grounded in the verified BRICS
RAG corpus AND the open PlantVillage dataset vocabulary (Hughes & Salathé
2015 — 54,306 open leaf images). No mock response exists: when the local
model server is unreachable the caller receives an explicit
LLMUnavailableError instead of a fabricated diagnosis.
"""

from app.models.doctor_schema import DiagnosisResponse
from app.services import llm
from app.services import pest_watch
from app.services import plantvillage
from app.services.rag import rag_service


def diagnose_crop(image_bytes: bytes, image_mime_type: str, query: str, coordinates: str) -> dict:
    # 1. Real RAG context from the local FAISS vector store
    rag_context, _sources = rag_service.retrieve_context(query + " " + coordinates, top_k=2)

    # 2. Open-dataset label grounding: the canonical PlantVillage vocabulary for
    #    this crop, so the model's label is anchored to the open benchmark's
    #    class set (and can be validated against it afterwards).
    crop = _crop_from_query(query)
    pv_block, _hints = plantvillage.grounding_block(crop)

    # 3. Multimodal prompt with real knowledge-base grounding
    prompt = (
        f"You are an expert agronomist. A farmer sent an image of a crop and asked: '{query}'.\n"
        f"The crop is located at coordinates: {coordinates}.\n\n"
        f"{pv_block}\n\n"
        f"RAG KNOWLEDGE BASE CONTEXT:\n{rag_context}\n\n"
        "Diagnose the issue and provide organic and chemical remedies. "
        "Prioritize the BRICS Institutional Agronomic Models:\n"
        "- India (ICAR): bio-remedies like Panchagavya, Trichoderma viride, Pseudomonas fluorescens.\n"
        "- Brazil (Embrapa): Plantio Direto and biological nitrogen fixation.\n"
        "- South Africa (ARC): Fall Armyworm bio-traps.\n"
        "If the image or knowledge base is insufficient for a confident diagnosis, say so explicitly."
    )

    result = llm.generate_json_from_image(
        image_bytes=image_bytes,
        image_mime_type=image_mime_type,
        prompt=prompt,
        schema=DiagnosisResponse,
        temperature=0.2,
    )
    payload = result.model_dump()

    # 4. Validation cross-check against the open benchmark vocabulary —
    #    reported verbatim, `in_benchmark` False when the label is outside
    #    the open set (flagged for expert review, never forced into a class).
    payload["plantvillage_validation"] = plantvillage.validation_note(
        payload.get("disease_identification")
    )

    # 5. Transboundary early-warning: append this diagnosis as an ANONYMIZED
    #    observation (0.5° cell, no farmer identity, no exact coordinates) to
    #    the shared BRICS hotspot network the policy dashboard aggregates.
    #    Best-effort by design — tracking must never be able to fail a real
    #    diagnosis, so any storage problem is swallowed here.
    try:
        pest_watch.record_diagnosis(
            disease=payload.get("disease_identification"),
            query=query,
            coordinates=coordinates,
            crop=crop,
            confidence=payload.get("confidence_score"),
        )
    except Exception:
        pass

    return payload


def _crop_from_query(query: str) -> str:
    """Best-effort crop word from the farmer's query for vocabulary scoping."""
    text = (query or "").lower()
    for crop in ("tomato", "potato", "maize", "corn", "apple", "grape", "peach",
                 "pepper", "capsicum", "cherry", "strawberry", "blueberry",
                 "orange", "citrus", "soybean", "raspberry", "squash"):
        if crop in text:
            return "maize" if crop == "corn" else crop
    return ""
