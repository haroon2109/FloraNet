"""
Regenerative Bio-Input Knowledge Base — FloraNet
================================================

Curated, CITED reference protocols for organic/biological inputs and
companion planting. Every entry carries an institution attribution so the UI
can display "who says this" — consistent with the FloraNet rule that any
non-live value must be a cited reference value, never an invented number.

IMPORTANT HONESTY NOTES
-----------------------
- These are TEXTBOOK/EXTENSION reference protocols (dose ranges, timings),
  the same kind of published guidance found in ICAR package-of-practices,
  Embrapa and ARC handbooks. They are NOT live field measurements and are
  labeled as reference data everywhere they surface.
- Dosages are expressed as RANGES with units as published by the cited
  institution. Farmers must calibrate to local conditions / soil-test results.
- No entry claims a guaranteed efficacy percentage; where published trial
  reductions exist (e.g. nematode suppression) they carry the trial citation.
"""

from typing import Any, Dict, List

# ──────────────────────────────────────────────────────────────────────────────
# Organic & biological remedies
# ──────────────────────────────────────────────────────────────────────────────
# target: machine-readable problem tag used by the prescription engine.
# form:   how the input is applied (soil drench, foliar, seed treatment…).

BIO_REMEDIES: List[Dict[str, Any]] = [
    {
        "id": "trichoderma-viride",
        "name": "Trichoderma viride / T. harzianum",
        "category": "Bio-fungicide",
        "targets": ["root_rot", "wilt", "leaf_blight", "damping_off"],
        "form": "Seed treatment, soil application (with FYM), or foliar spray",
        "protocol": (
            "Foliar spray: 5–10 g per litre of water. Soil application: mix 2 kg "
            "Trichoderma with 50 kg farmyard manure, incubate ~7 days, then apply "
            "to the field. Seed treatment per local extension dose."
        ),
        "mechanism": (
            "Beneficial fungus that colonizes the rhizosphere, parasitizes "
            "pathogens (Fusarium, Rhizoctonia, Pythium) and induces plant defence."
        ),
        "restores_microbiota": True,
        "source": "ICAR (India) — FloraNet verified corpus",
        "citation": "backend/app/knowledge/trichoderma.md (ICAR guidance)",
    },
    {
        "id": "pseudomonas-fluorescens",
        "name": "Pseudomonas fluorescens",
        "category": "Bio-fungicide / PGPR",
        "targets": ["wilt", "leaf_blight", "damping_off", "sheath_blight"],
        "form": "Seed treatment or foliar spray",
        "protocol": (
            "Used to treat seeds or as a foliar spray to combat wilt, root rot and "
            "leaf blight, following the ICAR extension doses in the corpus."
        ),
        "mechanism": (
            "Rhizobacterium that produces antibiotics (phenazines, 2,4-DAPG) and "
            "siderophores that suppress soil-borne pathogens; promotes growth."
        ),
        "restores_microbiota": True,
        "source": "ICAR (India) — FloraNet verified corpus",
        "citation": "backend/app/knowledge/trichoderma.md (ICAR guidance)",
    },
    {
        "id": "jeevamrutha",
        "name": "Jeevamrutha (fermented microbial culture)",
        "category": "Bio-fertilizer / microbiome inoculant",
        "targets": ["low_soc", "low_microbiota", "general_fertility"],
        "form": "Soil drench via irrigation or foliar spray",
        "protocol": (
            "Cow dung, cow urine, jaggery, pulse flour and virgin soil, fermented. "
            "Apply ~200 L/acre via irrigation water or as a spray every ~15 days "
            "for drought-tolerant millets and other crops to restore degraded "
            "soil carbon (ICAR/Zero Budget Natural Farming protocol)."
        ),
        "mechanism": (
            "Inoculates the soil with native microbes (bacteria, fungi, actinomycetes "
            "and yeasts) that drive biological nitrogen fixation and phosphorus "
            "solubilization — directly rebuilding soil microbiota."
        ),
        "restores_microbiota": True,
        "source": "ICAR (India) — FloraNet verified corpus",
        "citation": "backend/app/knowledge/jeevamrutha.md (ICAR guidance)",
    },
    {
        "id": "neem-kernel-extract",
        "name": "Neem kernel extract (NSKE 5%)",
        "category": "Botanical pesticide",
        "targets": ["fall_armyworm", "borers", "sucking_pests", "nematodes"],
        "form": "Foliar spray",
        "protocol": (
            "Neem seed kernel extract at ~5% suspension as a foliar spray against "
            "chewing and sucking pests; soil drench of neem cake is used against "
            "root-knot nematodes in published ICAR/extension practice."
        ),
        "mechanism": (
            "Azadirachtin acts as an antifeedant, repellent and growth disruptor; "
            "non-persistent, sparing beneficials when applied at dusk."
        ),
        "restores_microbiota": False,
        "source": "ICAR (India) / extension literature — FloraNet verified corpus",
        "citation": "FloraNet RAG corpus (ICAR pest-management entries)",
    },
    {
        "id": "compost-tea",
        "name": "Aerated compost tea (ACT)",
        "category": "Microbiome inoculant",
        "targets": ["low_microbiota", "leaf_fungal_disease", "low_soc"],
        "form": "Soil drench or foliar spray (apply within hours of aeration)",
        "protocol": (
            "Brew mature compost in aerated water (with a small molasses/fish "
            "hydrolysate feed) for 24–36 h; apply as a soil drench or foliar spray "
            "the same day. Dose/timing per regional extension guidance — no fixed "
            "universal rate exists, so calibrate locally."
        ),
        "mechanism": (
            "Multiplies the compost's bacterial/fungal community and applies it to "
            "leaf and soil surfaces, occupying infection sites and cycled nutrients "
            "back into the rhizosphere."
        ),
        "restores_microbiota": True,
        "source": "Extension practice (ICAR / Embrapa organic systems)",
        "citation": "General published practice — dose must be calibrated locally",
    },
    {
        "id": "beauveria-bassiana",
        "name": "Beauveria bassiana",
        "category": "Entomopathogenic bio-insecticide",
        "targets": ["fall_armyworm", "borers", "beetles", "thrips"],
        "form": "Foliar spray",
        "protocol": (
            "Commercial bio-insecticide formulations sprayed at label rates "
            "(typically 5 g/L of product, dusk application, avoid UV/heat) "
            "against chewing insects incl. fall armyworm larvae."
        ),
        "mechanism": (
            "Entomopathogenic fungus that penetrates the insect cuticle; "
            "compatible with IPM and safe for pollinators after drying."
        ),
        "restores_microbiota": False,
        "source": "ICAR (India) IPM modules / extension literature",
        "citation": "FloraNet RAG corpus (ICAR pest-management entries)",
    },
]

# ──────────────────────────────────────────────────────────────────────────────
# Preventative companion planting
# ──────────────────────────────────────────────────────────────────────────────

COMPANION_PLANTINGS: List[Dict[str, Any]] = [
    {
        "id": "marigold-nematode",
        "name": "French marigold (Tagetes patula) intercrop",
        "crop_roles": ["companion_border"],
        "targets": ["root_knot_nematode"],
        "main_crops": ["Tomato", "Brinjal/Eggplant", "Okra", "Chili", "Melon"],
        "strategy": (
            "Intercrop or border-plant French marigold with susceptible vegetable "
            "crops. Marigold roots produce α-terthienyl and act as a trap/antagonist "
            "crop against root-knot nematodes (Meloidogyne spp.)."
        ),
        "prevention_note": (
            "Breaks recurring nematode infection cycles season-over-season; "
            "published intercrop trials report large nematode population reductions "
            "and yield protection versus monoculture — magnitude varies by soil and "
            "region, so treat as directional."
        ),
        "spacing": "Rows or borders around/s within the susceptible crop block",
        "source": "ICAR (India) nematology / Embrapa horticulture practice",
        "citation": "Published intercrop trials (ICAR/Embrapa) — FloraNet verified corpus",
    },
    {
        "id": "basil-pest-repellent",
        "name": "Basil (Ocimum basilicum) companion",
        "crop_roles": ["companion_border"],
        "targets": ["thrips", "whitefly", "general_fertility"],
        "main_crops": ["Tomato", "Pepper", "Okra"],
        "strategy": (
            "Interplant basil rows with solanaceous crops; its volatile oils repel "
            "thrips/whitefly and it doubles as a pollinator-attracting plant."
        ),
        "prevention_note": "Reduces recurring vector pressure between seasons without residue risk.",
        "spacing": "Every 2–3 rows or bed edges",
        "source": "Extension practice (ICAR horticulture)",
        "citation": "General published companion-planting practice",
    },
    {
        "id": "legume-n-fix",
        "name": "Legume intercrop (cowpea / green gram / fodder legumes)",
        "crop_roles": ["intercrop"],
        "targets": ["low_soc", "low_nitrogen", "general_fertility"],
        "main_crops": ["Maize", "Sorghum", "Millet", "Cotton"],
        "strategy": (
            "Add legume rows between cereal rows (2:1 or 3:1 additive arrangement). "
            "Biological nitrogen fixation (~40–50 kg N/acre in published ICAR "
            "rotations) cuts synthetic N demand and adds residue biomass for SOC."
        ),
        "prevention_note": (
            "Higher soil nitrogen and microbial activity strengthen the crop's "
            "resilience against soil-borne diseases between seasons."
        ),
        "spacing": "2 rows cereal : 1 row legume (additive intercrop)",
        "source": "ICAR (India) — FloraNet verified corpus",
        "citation": "FloraNet RAG corpus (ICAR rotation protocols)",
    },
    {
        "id": "brassica-biofumigant",
        "name": "Brassica cover (mustard / radish bio-drill)",
        "crop_roles": ["cover_crop"],
        "targets": ["soil_borne_pathogens", "compaction"],
        "main_crops": ["Maize", "Cotton", "Vegetable crops"],
        "strategy": (
            "Grow brassica cover crops before the main season and incorporate at "
            "flowering. Glucosinolate release acts as a natural biofumigant against "
            "soil-borne pathogens; deep taproots (e.g. radish) bio-drill compacted "
            "layers (Embrapa Cerrado protocol)."
        ),
        "prevention_note": "Lowers inoculum levels for the following season's susceptible crop.",
        "spacing": "Full-season cover crop before the main crop",
        "source": "Embrapa (Brazil) — FloraNet verified corpus",
        "citation": "FloraNet RAG corpus (Embrapa Cerrado rotation protocol)",
    },
    {
        "id": "sunn-hemp-cover",
        "name": "Sunn hemp (Crotalaria juncea) cover",
        "crop_roles": ["cover_crop"],
        "targets": ["nematodes", "low_soc"],
        "main_crops": ["Maize", "Cotton", "Vegetables"],
        "strategy": (
            "Crotalaria species suppress root-knot and reniform nematodes and add "
            "high biomass for green manure before the next sowing (FloraNet corpus "
            "rotation blueprint)."
        ),
        "prevention_note": "Combines nematode suppression with SOC building in one cover cycle.",
        "spacing": "Cover crop, incorporated 45–60 days after sowing",
        "source": "ICAR / FloraNet rotation blueprint",
        "citation": "FloraNet RAG corpus (ICAR rotation protocols)",
    },
]

# Quick lookup: which crop is the field growing → entries that apply
CROP_KEYWORD_MAP: Dict[str, List[str]] = {
    "maize": ["maize", "corn"],
    "cotton": ["cotton"],
    "tomato": ["tomato"],
    "vegetables": ["vegetable", "tomato", "brinjal", "okra", "chili", "pepper", "melon"],
    "millet": ["millet", "sorghum"],
    "soybean": ["soybean"],
    "wheat": ["wheat"],
    "rice": ["rice", "paddy"],
}


def remedies_for_targets(targets: List[str]) -> List[Dict[str, Any]]:
    """Return remedies whose `targets` intersect the requested problem tags."""
    wanted = {t.strip().lower() for t in targets if t}
    return [r for r in BIO_REMEDIES if wanted & {t.lower() for t in r["targets"]}]


def companion_for_targets(targets: List[str]) -> List[Dict[str, Any]]:
    """Return companion-planting entries that help prevent the given problems."""
    wanted = {t.strip().lower() for t in targets if t}
    return [c for c in COMPANION_PLANTINGS if wanted & {t.lower() for t in c["targets"]}]


def companion_for_crop(crop: str) -> List[Dict[str, Any]]:
    """
    Deterministic crop matcher.

    Matches the farmer's crop against each entry's `main_crops` list with a
    bidirectional substring test ("Maize" ↔ "maize", "Tomato (cherry)" ↔
    "tomato", "Brinjal/Eggplant" ↔ "eggplant"). Falls back to the
    CROP_KEYWORD_MAP groups when there is no direct hit.
    """
    c = (crop or "").strip().lower()
    if not c:
        return []

    relevant: List[Dict[str, Any]] = []
    for entry in COMPANION_PLANTINGS:
        matched = False
        for mc in entry["main_crops"]:
            mc_l = mc.lower()
            # bidirectional containment covers inflections like "cherry tomato"
            if c in mc_l or mc_l in c:
                matched = True
                break
            # keyword-group fallback: "corn"→maize group, "brinjal"→vegetables…
            for words in CROP_KEYWORD_MAP.values():
                if c in words and any(w in mc_l for w in words):
                    matched = True
                    break
            if matched:
                break
        if matched:
            relevant.append(entry)
    return relevant
