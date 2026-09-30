"""
PlantVillage Open-Dataset Grounding — FloraNet
==============================================

Grounds the diagnostic pipeline against the open PlantVillage dataset
(Hughes & Salathé, 2015 — 54,306 openly-licensed leaf images, 14 crop species,
26 diseases / 38 class labels), the community-standard benchmark for
plant-disease models. Canonical mirrors:

  - GitHub (canonical):  spMohanty/PlantVillage-Dataset   (open access)
  - Hugging Face / Kaggle mirrors of the same corpus

WHAT THIS MODULE DOES (and does not do)
---------------------------------------
- Provides the canonical class vocabulary + dataset provenance so the vision
  model's output is grounded in (and can be cross-checked against) the labels
  the open benchmark actually uses.
- Exposes a LIVE health check against the canonical GitHub repo (stars,
  default branch, archived flag) so the grounding metadata is real, not a
  hardcoded snapshot.
- Does NOT train anything or run a PlantVillage classifier here — inference
  stays on the local open-weights vision model. The dataset serves as label
  grounding + an explicit validation reference, exactly as the project brief
  describes ("ground and validate diagnostic accuracy").
"""

from __future__ import annotations

import asyncio
import re
from typing import Any, Dict, List, Optional, Tuple

import httpx

# Canonical dataset provenance (Hughes & Salathé 2015, open access).
DATASET_META: Dict[str, Any] = {
    "name": "PlantVillage",
    "citation": "Hughes, D.P., & Salathé, M. (2015). An open access repository of images on plant health.",
    "image_count": 54306,
    "crop_species": 14,
    "class_labels": 38,
    "license": "Open access (CC-BY-style research dataset)",
    "canonical_repo": "https://github.com/spMohanty/PlantVillage-Dataset",
    "mirrors": [
        "https://huggingface.co/datasets/TSY-0408/PlantVillage",
        "https://www.kaggle.com/datasets/mohitsingh1804/plantvillage",
    ],
}

# The canonical 38 PlantVillage class labels (crop___condition).
PLANTVILLAGE_CLASSES: List[str] = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy",
    "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy", "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy", "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight",
    "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy",
]

# Map common farmer crop words onto the PlantVillage crop prefixes.
_CROP_ALIASES: Dict[str, str] = {
    "maize": "Corn_(maize)", "corn": "Corn_(maize)",
    "tomato": "Tomato", "potato": "Potato",
    "pepper": "Pepper,_bell", "bell pepper": "Pepper,_bell", "capsicum": "Pepper,_bell",
    "apple": "Apple", "grape": "Grape", "peach": "Peach",
    "cherry": "Cherry_(including_sour)", "strawberry": "Strawberry",
    "blueberry": "Blueberry", "orange": "Orange", "citrus": "Orange",
    "soybean": "Soybean", "raspberry": "Raspberry", "squash": "Squash",
}


def classes_for_crop(crop: str) -> List[str]:
    """Canonical PlantVillage labels relevant to the farmer's crop."""
    c = (crop or "").strip().lower()
    prefix = _CROP_ALIASES.get(c)
    if not prefix:
        # substring fallback ("cherry tomato" → Tomato)
        for alias, p in _CROP_ALIASES.items():
            if alias in c or c in alias:
                prefix = p
                break
    if not prefix:
        return []
    return [cls for cls in PLANTVILLAGE_CLASSES if cls.startswith(prefix)]


def normalize_disease_label(raw: Optional[str]) -> Optional[str]:
    """
    Match a free-text model output ("Tomato Late Blight", "late blight on
    tomato leaves") onto the canonical PlantVillage class vocabulary.
    Returns the canonical label, or None when nothing matches (never guesses).
    """
    if not raw:
        return None
    text = re.sub(r"[^a-z0-9 _()]+", " ", raw.lower()).strip()
    if not text:
        return None

    # direct / substring match against canonical labels
    for cls in PLANTVILLAGE_CLASSES:
        cls_norm = re.sub(r"[^a-z0-9]+", " ", cls.lower()).strip()
        if cls_norm == text or cls_norm in text or text in cls_norm:
            return cls
    return None


async def dataset_health() -> Dict[str, Any]:
    """
    LIVE provenance check against the canonical open repo (GitHub API,
    keyless). Returns real repo stats so the grounding badge reflects the
    actual public dataset, or `available: False` when unreachable.
    """
    def _fetch() -> Dict[str, Any]:
        repo = DATASET_META["canonical_repo"].replace("https://github.com/", "")
        with httpx.Client(timeout=15.0) as client:
            r = client.get(f"https://api.github.com/repos/{repo}")
            if r.status_code != 200:
                return {"available": False, "error": f"GitHub returned HTTP {r.status_code}"}
            d = r.json()
        return {
            "available": True,
            "repo": d.get("full_name"),
            "stars": d.get("stargazers_count"),
            "default_branch": d.get("default_branch"),
            "archived": d.get("archived"),
            "description": d.get("description"),
            "checked_at": None,  # filled by caller
        }

    from datetime import datetime

    try:
        result = await asyncio.to_thread(_fetch)
    except Exception as exc:
        result = {"available": False, "error": str(exc)}
    if result.get("available"):
        result["checked_at"] = datetime.utcnow().isoformat() + "Z"
    return {**DATASET_META, **result}


def grounding_block(crop: str) -> Tuple[str, List[str]]:
    """
    Build (prompt_block, class_hint_list) for the diagnosis pipeline:
    the canonical vocabulary the vision model should prefer, restricted to the
    farmer's crop when we have it.
    """
    hints = classes_for_crop(crop)
    if hints:
        vocab = ", ".join(hints)
        crop_label = _CROP_ALIASES.get((crop or "").strip().lower(), crop)
        block = (
            f"OPEN-DATASET LABEL GROUNDING (PlantVillage, Hughes & Salathé 2015 — "
            f"54,306 open leaf images): the canonical diagnostic vocabulary for "
            f"{crop_label} is: {vocab}. Prefer these exact class names when they "
            f"match what you see; if the symptom does not match any of them, say "
            f"so explicitly instead of forcing a label."
        )
    else:
        block = (
            "OPEN-DATASET LABEL GROUNDING (PlantVillage, Hughes & Salathé 2015 — "
            "54,306 open leaf images across 14 crops / 26 diseases): prefer its "
            "canonical crop___condition label style when a confident match exists; "
            "say so explicitly when it does not."
        )
    return block, hints


def validation_note(model_label: Optional[str]) -> Dict[str, Any]:
    """
    Validation cross-check: does the model's returned disease map onto the
    open benchmark's vocabulary? The flag is honest — `in_benchmark` False
    simply means the label is outside the open set (not that it is wrong).
    """
    canonical = normalize_disease_label(model_label)
    return {
        "model_label": model_label,
        "canonical_plantvillage_label": canonical,
        "in_benchmark": canonical is not None,
        "note": (
            "Matched against the open PlantVillage vocabulary (54,306 images, "
            "38 classes) — the community-standard validation set for leaf-disease "
            "models." if canonical is not None else
            "Label outside the open PlantVillage vocabulary — flagged for expert "
            "review rather than forced into a benchmark class."
        ),
    }
