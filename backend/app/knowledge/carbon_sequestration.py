"""
Soil-Organic-Carbon Sequestration Knowledge Base — FloraNet
============================================================

Carbon-sequestration metadata for the indigenous cover crops and green manures
that the BRICS regenerative protocols already recommend, so that a later carbon
credit aggregator can join on machine-readable fields instead of re-keying prose
out of a PDF. This module is that join surface.

WHY THIS LIVES IN THE BACKEND
-----------------------------
The same reason `genetic_resources` does. A sequestration figure that exists only
inside a React component cannot be aggregated, audited or challenged by ICAR,
Embrapa, ARC or a verifier, so it cannot be used in a credit transaction. Every
record here is addressable, citable and re-derivable.

HONESTY NOTES — READ BEFORE USING ANY NUMBER FOR A CARBON CLAIM
------------------------------------------------------------
This is the most easily-abused data in the repository, so the module is explicit
about what each field actually is:

- `biomass_c_input_kg_per_ha_per_cycle` is a PUBLISHED LITERATURE RANGE for the
  species under tropical dryland management — not a FloraNet measurement and not
  a measurement taken in the farmer's field. Ranges, not point values, because
  published values genuinely differ between sites.
- `soc_stock_change_t_c_per_ha_per_year` is DERIVED, not observed. It is computed
  by `derive_soc_stock_change()` from the biomass carbon input and the disclosed
  carbon-to-SOC conversion efficiency in `CONVERSION_EFFICIENCY`. Both inputs and
  the arithmetic are returned in the payload, so a verifier can re-derive it or
  substitute their own efficiency factor. It is flagged `derived: true`.
- Nothing here is a measurement, a verification, an additionality demonstration or
  an issued credit. `creditReadiness` names what is still MISSING for a real
  claim. Presenting any figure here as a tradable credit would be a
  misrepresentation, and the endpoint says so in its own response body.
- Crop-species associations (which species is validated in which national
  system) come from the published BRICS protocol corpus FloraNet already indexes
  (`app/knowledge/bio_inputs.py`, `plantio_direto.md`). Where FloraNet holds no
  accession-level trial record, `cultivar_name` and `accession_number` are null
  rather than filled with a plausible-looking guess — the same rule
  `genetic_resources` follows.
"""

from typing import Any, Dict, List, Optional

# ISO 3166-1 alpha-3, so a credit aggregator can join to UN/CEFACT country lists.
_COUNTRY_ISO3 = {
    "India": "IND",
    "Brazil": "BRA",
    "South Africa": "ZAF",
}

# Resolvable institution URIs for the BARP-aligned portals.
_INSTITUTION_URIS = {
    "Embrapa": "https://www.embrapa.br/",
    "ICAR": "https://icar.org.in/",
    "ICRISAT": "https://icrisat.org/",
    "ARC": "https://www.arc.agric.za/",
}

# ──────────────────────────────────────────────────────────────────────────────
# The single disclosed assumption behind every derived SOC figure below.
#
# Fraction of added biomass carbon that is stabilised as soil organic carbon
# stock rather than respired. IPCC 2019 Refinement / 2006 Guidelines Tier-1
# stock-change factors for "added carbon to inputs" give an upper bound of 1.0;
# the realised fraction is much lower because most residue C is decomposed and
# respired within one season.
#
# THIS IS AN ASSUMPTION, NOT A CONSTANT OF NATURE. It is published in every
# payload (`derivation.conversionEfficiency`), the range is deliberately wide
# because it varies with climate, texture and tillage, and a verifier doing real
# work is expected to replace it with a measured or locally validated value.
# `dpg_node.py` applies the same "publish the rate, publish the method" rule to
# its macro-level carbon estimate; this is the plot-level counterpart.
CONVERSION_EFFICIENCY: Dict[str, float] = {
    "low": 0.05,
    "high": 0.20,
}

# Carbon fraction of dry matter, used to convert biomass dry matter → carbon.
# Also an assumption, also published in the payload.
DRY_MATTER_CARBON_FRACTION = {"low": 0.35, "high": 0.45}

# IPCC accounting tier used for the stock-change figures.
ACCOUNTING_METHOD = (
    "IPCC 2019 Refinement to the 2006 Guidelines, Vol. 4 (Arable Land) — Tier 1 "
    "stock-change factor for added organic inputs, applied to above-ground + root "
    "biomass carbon. Tier 1; a Tier 2/3 site-specific measurement is required "
    "before any credit is issued."
)

MEASUREMENT_DEPTH_CM = 30.0

# The honest, load-bearing caveat. Repeated in every record and in the endpoint
# body so it cannot be stripped by a consumer that only reads the numbers.
CREDIT_READINESS: List[str] = [
    "No field measurement — these are published species-level literature ranges, "
    "not values measured in the farmer's field.",
    "No baseline established — a credit requires a demonstrated counterfactual "
    "against the farmer's own pre-adoption soil organic carbon stock.",
    "No additionality demonstration — a practice must be shown to cause "
    "sequestration that would not otherwise have occurred.",
    "No third-party verification — no accredited validation/verification body has "
    "reviewed any record in this module.",
    "No permanence / reversal accounting — buffer pools and reversal provisions "
    "are outside FloraNet's scope.",
]


def derive_soc_stock_change(biomass_c_kg_per_ha: Optional[float]) -> Optional[Dict[str, float]]:
    """
    Convert a biomass-carbon input into a disclosed SOC stock-change range.

    Returns the low/high figures in t C per ha per cycle together with every
    intermediate value, so the whole calculation is reproducible from the
    response body alone rather than requiring trust in this function.

    Returns None for a missing input rather than inventing a zero: an absent
    biomass figure must never become a silent "0 t C/ha" that looks like a
    measurement of no sequestration.
    """
    if biomass_c_kg_per_ha is None:
        return None
    tonnes_c_input = biomass_c_kg_per_ha / 1000.0
    low = tonnes_c_input * CONVERSION_EFFICIENCY["low"]
    high = tonnes_c_input * CONVERSION_EFFICIENCY["high"]
    return {
        "biomassCarbonInputTCPerHa": round(tonnes_c_input, 3),
        "conversionEfficiencyLow": CONVERSION_EFFICIENCY["low"],
        "conversionEfficiencyHigh": CONVERSION_EFFICIENCY["high"],
        "socStockChangeTCPerHaPerYearLow": round(low, 3),
        "socStockChangeTCPerHaPerYearHigh": round(high, 3),
        "socStockChangeTCO2ePerHaPerYearLow": round(low * 44 / 12, 3),
        "socStockChangeTCO2ePerHaPerYearHigh": round(high * 44 / 12, 3),
    }


# ──────────────────────────────────────────────────────────────────────────────
# Cover crop / green manure catalogue
#
# biomass_dry_matter_kg_per_ha_per_cycle is the PUBLISHED LITERATURE RANGE for
# the species grown as a cover/green-manure cycle in tropical dryland systems.
# These are the ranges FloraNet indexes from the protocol corpus; they are NOT
# FloraNet measurements and NOT site-specific. Biomass carbon input is derived
# from them via DRY_MATTER_CARBON_FRACTION in `_prepare()` below, so a single
# published dry-matter figure produces both the carbon input and the SOC range.
# ──────────────────────────────────────────────────────────────────────────────
COVER_CROP_SOC_METADATA: List[Dict[str, Any]] = [
    {
        "id": "soc-br-crotalaria",
        "name": "Crotalaria juncea (sunn hemp / rattlepod) green manure",
        "cultivar_name": None,
        "accession_number": None,
        "crop_role": "cover_crop, green_manure",
        "country": "Brazil",
        "institution": "Embrapa",
        "validated_in_system": (
            "Embrapa Cerrado direct-planting (Plantio Direto) rotation; "
            "biomass incorporated ahead of the main season."
        ),
        "biomass_dry_matter_kg_per_ha_per_cycle": {"low": 4000, "high": 8000},
        "cycle_days": {"low": 60, "high": 90},
        "fixes_nitrogen": True,
        "additional_benefits": [
            "Nematode suppression (Crotalaria spp. are used as green manure in "
            "Cerrado rotations specifically for this).",
            "Deep taproot bio-drilling of compacted layers.",
        ],
        "mechanism": (
            "High-biomass legaceous green manure; incorporation supplies carbon "
            "to the soil pool and biologically fixes nitrogen."
        ),
        "citation": (
            "Embrapa Cerrado cover-crop / green-manure protocol; FloraNet RAG "
            "corpus (backend/app/knowledge/plantio_direto.md)."
        ),
    },
    {
        "id": "soc-br-mucuna",
        "name": "Mucuna pruriens (velvet bean) cover",
        "cultivar_name": None,
        "accession_number": None,
        "crop_role": "cover_crop, green_manure",
        "country": "Brazil",
        "institution": "Embrapa",
        "validated_in_system": (
            "Embrapa Cerrado / Amazon rotations; Mucuna is a classic Cerrado "
            "green manure preceding maize and rice."
        ),
        "biomass_dry_matter_kg_per_ha_per_cycle": {"low": 5000, "high": 10000},
        "cycle_days": {"low": 70, "high": 120},
        "fixes_nitrogen": True,
        "additional_benefits": [
            "Allelopathy against certain weeds.",
            "Substantial residue carbon when biomass is fully incorporated.",
        ],
        "mechanism": (
            "Vigorous leguminous vine producing high dry-matter biomass; a "
            "long-established Brazilian green manure in Cerrado systems."
        ),
        "citation": (
            "Embrapa Cerrado green-manure rotation trials; FloraNet RAG corpus "
            "(backend/app/knowledge/plantio_direto.md)."
        ),
    },
    {
        "id": "soc-br-canavalia",
        "name": "Canavalia ensiformis (jack bean / feijão-manteiga) cover",
        "cultivar_name": None,
        "accession_number": None,
        "crop_role": "cover_crop, green_manure",
        "country": "Brazil",
        "institution": "Embrapa",
        "validated_in_system": "Embrapa Cerrado / Northeast semi-arid rotations.",
        "biomass_dry_matter_kg_per_ha_per_cycle": {"low": 4000, "high": 9000},
        "cycle_days": {"low": 70, "high": 120},
        "fixes_nitrogen": True,
        "additional_benefits": [
            "Good performance on acidic, low-fertility Cerrado soils where many "
            "cover crops fail.",
            "Drought-tolerant once established.",
        ],
        "mechanism": (
            "Leguminous cover adapted to acid, low-pH soils; contributes biomass "
            "carbon and fixed nitrogen."
        ),
        "citation": (
            "Embrapa Cerrado cover-crop recommendations; FloraNet RAG corpus "
            "(backend/app/knowledge/plantio_direto.md)."
        ),
    },
    {
        "id": "soc-br-brachiaria",
        "name": "Brachiaria brizantha (palisade grass) cover / green manure",
        "cultivar_name": None,
        "accession_number": None,
        "crop_role": "cover_crop, green_manure",
        "country": "Brazil",
        "institution": "Embrapa",
        "validated_in_system": (
            "Embrapa Cerrado Plantio Direto; Brachiaria-based cover cropping is "
            "the standard Cerrado soil-protection practice."
        ),
        "biomass_dry_matter_kg_per_ha_per_cycle": {"low": 6000, "high": 12000},
        "cycle_days": {"low": 90, "high": 150},
        "fixes_nitrogen": False,
        "additional_benefits": [
            "Non-legume with high C:N residue that supports soil aggregation.",
            "Deep roots relieve compaction and improve water infiltration.",
        ],
        "mechanism": (
            "High-biomass perennial grass whose fibrous root mat builds "
            "aggregation-driven, physically protected soil carbon."
        ),
        "citation": (
            "Embrapa Cerrado cover-crop / Plantio Direto protocol; FloraNet RAG "
            "corpus (backend/app/knowledge/plantio_direto.md)."
        ),
    },
    {
        "id": "soc-in-sunn-hemp",
        "name": "Crotalaria juncea (sunhemp / dhaincha) green manure",
        "cultivar_name": None,
        "accession_number": None,
        "crop_role": "cover_crop, green_manure",
        "country": "India",
        "institution": "ICAR",
        "validated_in_system": (
            "ICAR green-manure packages of practices for rainfed rotations "
            "preceding kharif cereals."
        ),
        "biomass_dry_matter_kg_per_ha_per_cycle": {"low": 4500, "high": 9000},
        "cycle_days": {"low": 60, "high": 90},
        "fixes_nitrogen": True,
        "additional_benefits": [
            "Nematode and striga suppression.",
            "Green manure for saline and degraded soils in Indian drylands.",
        ],
        "mechanism": (
            "High-biomass leguminous green manure; incorporation adds carbon to "
            "the soil pool and supplies biologically fixed nitrogen."
        ),
        "citation": (
            "ICAR package of practices for green manures; FloraNet RAG corpus "
            "(backend/app/knowledge/jeevamrutha.md, bio_inputs.py)."
        ),
    },
    {
        "id": "soc-in-dhaincha",
        "name": "Sesbania sesban (dhaincha) alley / green manure",
        "cultivar_name": None,
        "accession_number": None,
        "crop_role": "green_manure, alley_crop",
        "country": "India",
        "institution": "ICAR",
        "validated_in_system": (
            "ICAR agroforestry / alley-cropping and green-manure protocols for "
            "sodic and semi-arid soils."
        ),
        "biomass_dry_matter_kg_per_ha_per_cycle": {"low": 8000, "high": 15000},
        "cycle_days": {"low": 90, "high": 150},
        "fixes_nitrogen": True,
        "additional_benefits": [
            "Highly rated for green manure on sodic (alkaline) soils.",
            "Deep-rooted, woody growth that persists under dryland conditions.",
        ],
        "mechanism": (
            "Fast-growing woody legume producing very high dry-matter biomass; "
            "incorporation or alley biomass inputs substantial carbon."
        ),
        "citation": (
            "ICAR agroforestry / green-manure protocols; FloraNet RAG corpus."
        ),
    },
    {
        "id": "soc-za-sunflower",
        "name": "Sunflower / Helianthus annuus cover crop",
        "cultivar_name": None,
        "accession_number": None,
        "crop_role": "cover_crop",
        "country": "South Africa",
        "institution": "ARC",
        "validated_in_system": (
            "ARC semi-arid conservation cropping protocols; sunflower is "
            "recommended as a summer cover in maize-based rotations."
        ),
        "biomass_dry_matter_kg_per_ha_per_cycle": {"low": 3000, "high": 6000},
        "cycle_days": {"low": 70, "high": 110},
        "fixes_nitrogen": False,
        "additional_benefits": [
            "Taproot accessions bio-drill compacted subsoil layers.",
            "Sequence-friendly: leaves the ground clear of pathogen carry-over.",
        ],
        "mechanism": (
            "Non-legume cover whose deep taproot improves structure and whose "
            "residue adds moderate carbon inputs."
        ),
        "citation": (
            "ARC semi-arid conservation agriculture protocols; FloraNet RAG "
            "corpus (backend/app/knowledge/companion_planting.md)."
        ),
    },
    {
        "id": "soc-za-lupin",
        "name": "Lupinus (lupin) rotation / cover",
        "cultivar_name": None,
        "accession_number": None,
        "crop_role": "rotation, cover_crop",
        "country": "South Africa",
        "institution": "ARC",
        "validated_in_system": (
            "ARC winter-rainfall rotation protocols in the Western Cape, where "
            "lupin is a recognised N-fixing rotation break."
        ),
        "biomass_dry_matter_kg_per_ha_per_cycle": {"low": 2500, "high": 5000},
        "cycle_days": {"low": 120, "high": 180},
        "fixes_nitrogen": True,
        "additional_benefits": [
            "Deep-rooted N-fixing rotation break for cereal systems.",
            "Tolerates the acid soils of the Western Cape.",
        ],
        "mechanism": (
            "Leguminous rotation crop contributing fixed nitrogen and modest but "
            "real carbon inputs through root and residue turnover."
        ),
        "citation": (
            "ARC winter-rainfall rotation protocols; FloraNet RAG corpus."
        ),
    },
]


def to_agrin_fields(entry: Dict[str, Any]) -> Dict[str, Any]:
    """
    Project a cover-crop row onto the AgriN CarbonSequestrationProfile vocabulary.

    The SOC figures are DERIVED here rather than stored, so that the published
    biomass range and the disclosed conversion efficiency always travel together
    in the payload. A consumer can therefore re-derive every number in the
    response without reading this function, which is what makes the output
    auditable rather than merely authoritative-looking.

    `derived: true` and `isReference: True` are both carried explicitly. They are
    different claims: "derived" says FloraNet computed this number from other
    numbers; "isReference" says those inputs are published literature rather than
    a field measurement. Neither implies the figure is a verified credit.
    """
    biomass = entry.get("biomass_dry_matter_kg_per_ha_per_cycle") or {}
    dm_low = biomass.get("low")
    dm_high = biomass.get("high")

    # Biomass carbon input range, from the published dry-matter range and the
    # disclosed carbon fraction. None propagates rather than becoming a 0 that
    # would read as "no sequestration measured".
    c_low = dm_low * DRY_MATTER_CARBON_FRACTION["low"] if dm_low is not None else None
    c_high = dm_high * DRY_MATTER_CARBON_FRACTION["high"] if dm_high is not None else None

    institution = entry.get("institution")
    soc = derive_soc_stock_change(c_low)
    soc_high = derive_soc_stock_change(c_high)

    payload: Dict[str, Any] = {
        "id": entry["id"],
        "name": entry["name"],
        "description": entry.get("mechanism"),
        "cultivarName": entry.get("cultivar_name"),
        "accessionNumber": entry.get("accession_number"),
        "cropRole": entry.get("crop_role"),
        "countryOfOrigin": entry.get("country"),
        "isoCountryCode": _COUNTRY_ISO3.get(entry.get("country") or ""),
        "institutionCode": institution,
        "institutionCountry": _COUNTRY_ISO3.get(entry.get("country") or ""),
        "institutionRef": _INSTITUTION_URIS.get(institution or ""),
        "validatedInSystem": entry.get("validated_in_system"),
        "fixesNitrogen": entry.get("fixes_nitrogen"),
        "additionalBenefits": list(entry.get("additional_benefits") or []),
        "biomassDryMatterKgPerHaPerCycle": (
            {"low": dm_low, "high": dm_high} if dm_low is not None else None
        ),
        "cycleDays": entry.get("cycle_days"),
        "biomassCarbonInputKgPerHaPerCycle": (
            {
                "low": round(c_low, 1),
                "high": round(c_high, 1),
                "dryMatterCarbonFraction": DRY_MATTER_CARBON_FRACTION,
            }
            if c_low is not None
            else None
        ),
        "measurementDepthCm": MEASUREMENT_DEPTH_CM,
        "accountingMethod": ACCOUNTING_METHOD,
        "citation": entry.get("citation"),
        "source": institution,
        "creditReadiness": list(CREDIT_READINESS),
        # Derived from published inputs — not a measurement, not a credit.
        "derived": True,
        "isReference": True,
        "creditClaimable": False,
    }

    # Low/high SOC bounds are the derived range across both the biomass spread
    # and the conversion-efficiency spread, i.e. the genuinely conservative
    # envelope rather than a midpoint dressed up as a result.
    lows, highs = [], []
    for part in (soc, soc_high):
        if not part:
            continue
        lows.append(part["socStockChangeTCPerHaPerYearLow"])
        highs.append(part["socStockChangeTCPerHaPerYearHigh"])
    if lows:
        payload["socStockChangeTCPerHaPerYear"] = {
            "low": round(min(lows), 3),
            "high": round(max(highs), 3),
        }
        payload["socStockChangeTCO2ePerHaPerYear"] = {
            "low": round(min(lows) * 44 / 12, 3),
            "high": round(max(highs) * 44 / 12, 3),
        }
        payload["derivation"] = {
            "method": (
                "biomass dry matter (published range) × dry-matter carbon fraction "
                "(disclosed range) × carbon-to-SOC conversion efficiency "
                "(disclosed range)"
            ),
            "conversionEfficiency": CONVERSION_EFFICIENCY,
            "dryMatterCarbonFraction": DRY_MATTER_CARBON_FRACTION,
            "note": (
                "Assumptions are published so a verifier can substitute their own "
                "values; FloraNet holds no site measurement for any record here."
            ),
        }
    return payload