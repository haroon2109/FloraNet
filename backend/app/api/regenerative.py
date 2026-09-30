"""
Regenerative Prescription API Router — FloraNet
================================================

Serves the Regenerative Bio-Input Prescription Engine:

  GET /api/v1/regenerative/remedies?crop=&targets=
        → cited organic/biological remedies (bio-fungicides, Trichoderma,
          neem, compost tea) from the verified knowledge base.

  GET /api/v1/regenerative/companion-planting?crop=&targets=
        → preventative companion/intercrop strategies (marigold for
          nematodes, legume intercrops, biofumigant covers).

  GET /api/v1/regenerative/prescription?crop=&problem=&lat=&lng=
        → FULL ENGINE: live Open-Meteo + ISRIC SoilGrids tailoring of the
          knowledge-base entries, plus an optional local-Ollama (open-weights)
          natural-language prescription. When Ollama is unreachable the
          endpoint still returns the deterministic knowledge-base prescription
          and sets ai_narrative = null with an explicit note — a canned AI
          answer is NEVER substituted.

All remedies/protocols are CITED reference data (ICAR / Embrapa / ARC /
extension practice). Live weather/soil values come from the same public APIs
used across FloraNet. Nothing is randomized; nothing is fabricated.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.knowledge import bio_inputs
from app.services import real_data
from app.services import llm

router = APIRouter()

PROBLEM_TAG_LABELS: Dict[str, str] = {
    "root_rot": "Root rot",
    "wilt": "Wilt complex",
    "leaf_blight": "Leaf blight",
    "leaf_fungal_disease": "Fungal leaf disease",
    "damping_off": "Damping off",
    "sheath_blight": "Sheath blight",
    "fall_armyworm": "Fall armyworm",
    "borers": "Stem borers",
    "beetles": "Beetles",
    "thrips": "Thrips",
    "whitefly": "Whitefly",
    "sucking_pests": "Sucking pests",
    "nematodes": "Nematodes",
    "root_knot_nematode": "Root-knot nematode",
    "soil_borne_pathogens": "Soil-borne pathogens",
    "low_soc": "Low soil organic carbon",
    "low_microbiota": "Depleted soil microbiota",
    "low_nitrogen": "Nitrogen deficiency",
    "general_fertility": "General fertility",
    "compaction": "Soil compaction",
}


def _normalize_targets(targets: Optional[str]) -> List[str]:
    if not targets:
        return []
    known = set(PROBLEM_TAG_LABELS.keys())
    out: List[str] = []
    for token in targets.replace(";", ",").split(","):
        t = token.strip().lower()
        if t and t in known and t not in out:
            out.append(t)
    return out


def _entry_label(entry: Dict[str, Any]) -> str:
    return f"{entry['name']} — {entry['category']}"


# ──────────────────────────────────────────────────────────────────────────────
# GET /remedies — cited organic & bio-remedies
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/remedies")
def get_remedies(
    crop: str = Query("", description="Crop name (filter for reference only)"),
    targets: str = Query("", description="Comma-separated problem tags (root_rot, fall_armyworm, low_soc, …)"),
) -> Dict[str, Any]:
    """Cited organic/biological remedies filtered by problem tag."""
    wanted = _normalize_targets(targets)
    entries = bio_inputs.remedies_for_targets(wanted) if wanted else list(bio_inputs.BIO_REMEDIES)

    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "crop": crop or None,
        "targets": wanted,
        "known_problem_tags": PROBLEM_TAG_LABELS,
        "remedies": [
            {
                "id": r["id"],
                "name": r["name"],
                "category": r["category"],
                "targets": [PROBLEM_TAG_LABELS.get(t, t) for t in r["targets"]],
                "form": r["form"],
                "protocol": r["protocol"],
                "mechanism": r["mechanism"],
                "restores_microbiota": r["restores_microbiota"],
                "source": r["source"],
                "citation": r["citation"],
            }
            for r in entries
        ],
        "data_basis": "Cited reference protocols (ICAR/Embrapa/ARC/extension) — not live field measurements",
    }


# ──────────────────────────────────────────────────────────────────────────────
# GET /companion-planting — preventative intercrop strategies
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/companion-planting")
def get_companion_planting(
    crop: str = Query("", description="Crop name (Tomato, Maize, Cotton, …)"),
    targets: str = Query("", description="Comma-separated problem tags (root_knot_nematode, low_soc, …)"),
) -> Dict[str, Any]:
    """Preventative companion/intercrop strategies filtered by crop and/or problem."""
    wanted = _normalize_targets(targets)
    if wanted:
        entries = bio_inputs.companion_for_targets(wanted)
    else:
        entries = list(bio_inputs.COMPANION_PLANTINGS)
    if crop:
        by_crop = bio_inputs.companion_for_crop(crop)
        seen = {e["id"] for e in entries}
        for e in by_crop:
            if e["id"] not in seen:
                entries.append(e)

    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "crop": crop or None,
        "targets": wanted,
        "strategies": [
            {
                "id": c["id"],
                "name": c["name"],
                "targets": [PROBLEM_TAG_LABELS.get(t, t) for t in c["targets"]],
                "main_crops": c["main_crops"],
                "strategy": c["strategy"],
                "prevention_note": c["prevention_note"],
                "spacing": c["spacing"],
                "source": c["source"],
                "citation": c["citation"],
            }
            for c in entries
        ],
        "data_basis": "Cited reference strategies (ICAR/Embrapa/ARC/extension) — not live field measurements",
    }


# ──────────────────────────────────────────────────────────────────────────────
# GET /prescription — the full engine (live tailoring + optional AI narrative)
# ──────────────────────────────────────────────────────────────────────────────
class PrescriptionInputSummary(BaseModel):
    crop: Optional[str] = None
    problems: List[str] = Field(default_factory=list)
    live_moisture_pct: Optional[float] = None
    live_temp_c: Optional[float] = None
    soil_ph: Optional[float] = None
    soil_soc_pct: Optional[float] = None
    live_data_available: bool


class BioRemedyOut(BaseModel):
    id: str
    name: str
    category: str
    targets: List[str]
    form: str
    protocol: str
    mechanism: str
    restores_microbiota: bool
    source: str
    citation: str
    tailored_notes: List[str] = Field(default_factory=list)


class CompanionOut(BaseModel):
    id: str
    name: str
    targets: List[str]
    main_crops: List[str]
    strategy: str
    prevention_note: str
    spacing: str
    source: str
    citation: str


class PrescriptionResponse(BaseModel):
    prescription_id: str
    generated_at: str
    inputs: PrescriptionInputSummary
    bio_remedies: List[BioRemedyOut]
    companion_plantings: List[CompanionOut]
    monitoring: List[str]
    sources: List[str]
    data_basis: str
    ai_narrative: Optional[str] = None
    _note: Optional[str] = None


def _tailoring_notes(remedy: Dict[str, Any], live: Dict[str, Any], soil: Dict[str, Any],
                     moisture: Optional[float], temp: Optional[float],
                     ph: Optional[float], soc: Optional[float]) -> List[str]:
    """Deterministic tailoring notes from LIVE readings only."""
    notes: List[str] = []
    microbial = remedy.get("restores_microbiota", False)
    botanical = remedy["id"] in ("neem-kernel-extract",)

    if temp is not None:
        if temp < 15 and microbial:
            notes.append(f"Live soil/air temp {temp}°C is below 15°C — microbial inoculants are slow-acting; expect delayed colonization.")
        if temp >= 35 and botanical:
            notes.append(f"Live temp {temp}°C — apply botanical sprays at dusk; heat and UV degrade azadirachtin.")
    if moisture is not None:
        if moisture < 20 and microbial:
            notes.append(f"Live soil moisture {moisture}% is low — pre-irrigate before drenching so the inoculant reaches the root zone.")
        if moisture > 55 and remedy["category"] == "Bio-fungicide":
            notes.append(f"Live soil moisture {moisture}% is high — elevated root-rot pressure; pair the bio-fungicide with drainage checks.")
    if ph is not None and ph > 7.5 and microbial:
        notes.append(f"Live SoilGrids pH {ph} is alkaline — verify compost/tea pH compatibility before large-area application.")
    if soc is not None and soc < 1.0 and remedy["id"] == "compost-tea":
        notes.append(f"Live SoilGrids SOC {soc}% is low — repeat drench cycles through the season and retain crop residue to hold gains.")
    if not notes:
        notes.append("Applied as per cited protocol; no live reading requires deviation.")
    return notes


@router.get("/prescription", response_model=PrescriptionResponse)
async def get_prescription(
    crop: str = Query("Maize"),
    problem: str = Query("", description="Free-text problem (root rot, nematodes, fall armyworm, low SOC…)"),
    targets: str = Query("", description="Machine tags (comma-separated) — takes precedence over `problem`"),
    lat: float = Query(18.5204),
    lng: float = Query(73.8567),
    use_ai: bool = Query(True, description="Request an Ollama-generated narrative (skipped silently-off when the model is down)"),
) -> Dict[str, Any]:
    """
    Full Regenerative Bio-Input Prescription Engine.

    Combines (1) cited knowledge-base remedies + companion strategies,
    (2) live Open-Meteo/SoilGrids tailoring notes, and (3) an optional
    local-LLM narrative. The deterministic payload is always returned;
    `ai_narrative` is null (with `_note`) when Ollama is unreachable.
    """
    wanted = _normalize_targets(targets)
    if not wanted:
        # Map the farmer's free-text problem onto known tags, deterministically.
        text = (problem or "").lower()
        mapping = [
            (("root rot", "rootrot", "rhizoctonia", "pythium", "fusarium"), ["root_rot", "damping_off"]),
            (("wilt",), ["wilt"]),
            (("blight", "leaf spot", "fungal leaf"), ["leaf_blight", "leaf_fungal_disease"]),
            (("damping",), ["damping_off"]),
            (("armyworm", "faw"), ["fall_armyworm"]),
            (("borer",), ["borers"]),
            (("thrip",), ["thrips"]),
            (("whitefly",), ["whitefly"]),
            (("sucking", "aphid", "jassid"), ["sucking_pests"]),
            (("nematode", "meloidogyne", "gall"), ["nematodes", "root_knot_nematode"]),
            (("blight", "sheath"), ["sheath_blight"]),
            (("carbon", "soc", "organic matter"), ["low_soc"]),
            (("microbi", "soil life", "biology"), ["low_microbiota"]),
            (("nitrogen", "nitrogen deficiency", "low n"), ["low_nitrogen"]),
            (("compact", "hardpan"), ["compaction"]),
        ]
        for keys, tags in mapping:
            if any(k in text for k in keys):
                for t in tags:
                    if t not in wanted:
                        wanted.append(t)
        if not wanted:
            # Unknown problem → the two universal regeneration goals.
            wanted = ["general_fertility", "low_microbiota"]

    remedies = bio_inputs.remedies_for_targets(wanted)
    companions = bio_inputs.companion_for_targets(wanted)
    if crop:
        for c in bio_inputs.companion_for_crop(crop):
            if c not in companions:
                companions.append(c)
    if not remedies:
        remedies = list(bio_inputs.BIO_REMEDIES)[:2]
    if not companions:
        companions = list(bio_inputs.COMPANION_PLANTINGS)[:2]

    # ── Live tailoring data (explicitly optional; UI shows what's missing) ──
    live: Dict[str, Any] = {}
    moisture = temp = ph = soc = None
    live_ok = False
    try:
        weather = await real_data.current_weather_summary(lat, lng)
        live = {
            "moisture_pct": weather.get("soil_moisture_pct"),
            "temp_c": weather.get("soil_temp_c") or weather.get("current_temp"),
        }
        moisture, temp = live.get("moisture_pct"), live.get("temp_c")
    except Exception:
        live = {}
    try:
        soil = real_data.soilgrids_summary(await real_data.soilgrids_point(lat, lng))
        ph, soc = soil.get("ph"), soil.get("soc_percent")
        live.update({"ph": ph, "soc_pct": soc})
    except Exception:
        soil = {}
    live_ok = any(v is not None for v in live.values())

    remedy_out: List[BioRemedyOut] = []
    tailored_sources: List[str] = []
    for r in remedies:
        notes = _tailoring_notes(r, live, soil, moisture, temp, ph, soc)
        tailored_sources.append(r["source"])
        remedy_out.append(BioRemedyOut(
            id=r["id"], name=r["name"], category=r["category"],
            targets=[PROBLEM_TAG_LABELS.get(t, t) for t in r["targets"]],
            form=r["form"], protocol=r["protocol"], mechanism=r["mechanism"],
            restores_microbiota=r["restores_microbiota"],
            source=r["source"], citation=r["citation"], tailored_notes=notes,
        ))

    companion_out = [CompanionOut(
        id=c["id"], name=c["name"],
        targets=[PROBLEM_TAG_LABELS.get(t, t) for t in c["targets"]],
        main_crops=c["main_crops"], strategy=c["strategy"],
        prevention_note=c["prevention_note"], spacing=c["spacing"],
        source=c["source"], citation=c["citation"],
    ) for c in companions]

    monitoring = [
        "Pheromone traps for fall armyworm every 200 m from June 15 (ICAR).",
        "Sentinel plots for soybean rust starting at V4 (Embrapa).",
        "Scout weekly; companion planting prevents, it does not replace scouting.",
    ]

    prescription_id = f"rx-{crop.lower().replace(' ', '-')[:12]}-{datetime.utcnow().strftime('%Y%m%d%H%M')}"

    # ── Optional AI narrative (local Ollama; skipped when unavailable) ──
    ai_narrative: Optional[str] = None
    note: Optional[str] = None
    if use_ai and llm.is_available():
        try:
            context_lines = [
                f"- {_entry_label(r)}: {r['protocol']} [{r['source']}]"
                for r in remedies
            ] + [
                f"- {c['name']}: {c['strategy']} [{c['source']}]"
                for c in companions
            ]
            live_line = (
                f"Live readings — moisture {moisture}%, temp {temp}°C, pH {ph}, SOC {soc}%"
                if live_ok else "No live readings available right now."
            )
            prompt = (
                f"Farmer's crop: {crop}\nProblem: {problem or ', '.join(wanted)}\n"
                f"{live_line}\n\nCITED PROTOCOLS SELECTED:\n" + "\n".join(context_lines) +
                "\n\nWrite a concise action plan (max 150 words) for a smallholder: "
                "what to apply/preplant this week and what to watch. Ground every "
                "statement in the cited protocols above; do not invent doses."
            )
            ai_narrative = llm.generate_text(
                prompt,
                system="You are a regenerative agronomy advisor. Cite the institution bracketed with each protocol you use. Never invent rates.",
                temperature=0.2,
            )
        except llm.LLMUnavailableError as exc:
            note = f"Local model unreachable — deterministic prescription above is complete; AI narrative omitted ({exc})."
        except Exception as exc:  # schema/logic safety — never fabricate on error
            note = f"AI narrative skipped ({exc})."
    elif use_ai:
        note = "Local model server (Ollama) not reachable — deterministic prescription above is complete; AI narrative omitted."

    sources = sorted(set(tailored_sources) | {"Open-Meteo", "ISRIC SoilGrids 2.0"})

    return {
        "prescription_id": prescription_id,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "inputs": PrescriptionInputSummary(
            crop=crop or None,
            problems=[PROBLEM_TAG_LABELS.get(t, t) for t in wanted],
            live_moisture_pct=moisture,
            live_temp_c=temp,
            soil_ph=ph,
            soil_soc_pct=soc,
            live_data_available=live_ok,
        ).model_dump(),
        "bio_remedies": [r.model_dump() for r in remedy_out],
        "companion_plantings": [c.model_dump() for c in companion_out],
        "monitoring": monitoring,
        "sources": sources,
        "data_basis": (
            "Protocols: cited reference data (ICAR/Embrapa/ARC/extension). "
            "Tailoring: live Open-Meteo + ISRIC SoilGrids at the given coordinates."
        ),
        "ai_narrative": ai_narrative,
        "_note": note,
    }
