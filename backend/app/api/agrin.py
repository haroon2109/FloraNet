"""
AgriN Interoperability Router — FloraNet
=========================================

Federation surface for the AgriN profile proposed by BARP (BRICS Agricultural
Research Platform). Everything here is emitted as JSON-LD against the single
canonical context in `app.models.agrin`, so a record produced in India can be
ingested directly by ICAR, Embrapa, ARC or CAAS without bespoke translation.

  GET /api/v1/agrin/schema            → the AgriN profile + class catalogue
  GET /api/v1/agrin/context           → the raw JSON-LD @context, dereferenceable
  GET /api/v1/agrin/genetic-resources → agrin:GeneticResource records (pillar 1)
  GET /api/v1/agrin/agro-inputs       → agrin:AgroInput records (pillar 2)
  GET /api/v1/agrin/soil-profiles     → agrin:SoilProfile records (pillar 3, live)
  GET /api/v1/agrin/diagnoses         → agrin:DiseaseDiagnosis records (pillar 3)
  GET /api/v1/agrin/carbon-metadata  → agrin:CarbonSequestrationProfile (pillar 4)
  GET /api/v1/agrin/resilience-match → agrin:ResilienceMatch (pillar 4, live)
  GET /api/v1/agrin/dataset          → one DCAT Dataset spanning all pillars

WHY THIS EXISTS
---------------
Before this router, none of FloraNet's three headline outputs — disease
diagnoses, soil profiles and seed recommendations — were machine-readable at
all: they were plain JSON, and the genetic-resource records were hard-coded
inside two React components, so they were literally unreachable by any other
portal. This router is what makes "instantly federated" true.

HONESTY
-------
Live endpoints (soil, diagnoses) call the same real upstream sources as the
rest of the backend and return an explicit 503 when an upstream is unreachable,
never a placeholder. Reference endpoints (genetic resources, agro-inputs) serve
cited institutional publications and each record carries `isReference: true` so
a consumer can never mistake a published characterisation for a measurement.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from app.knowledge import carbon_sequestration
from app.knowledge import genetic_resources
from app.knowledge.bio_inputs import BIO_REMEDIES
from app.models.agrin import (
    AGRIIN_CONFORMANCE,
    AGRIIN_CONTEXT,
    AGRIIN_CONTEXT_IRI,
    AGRIIN_NS,
    AGRIIN_PROFILE_IRI,
    AGRIIN_VERSION,
    AgroInputRecord,
    AgriNDataset,
    BARP_MEMBER_INSTITUTIONS,
    CarbonSequestrationProfile,
    DiagnosisRecord,
    GeneticResourceRecord,
    ResilienceMatch,
    SoilLayerRecord,
    SoilProfileRecord,
    agrin_envelope,
)

router = APIRouter()

JSON_LD = "application/ld+json"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _dataset(
    *, dataset_id: str, name: str, description: str, access_url: str, temporal: str
) -> Dict[str, Any]:
    ds = AgriNDataset(
        **{
            "@id": dataset_id,
            "name": name,
            "description": description,
            "generatedAtTime": _now(),
            "temporalCoverage": temporal,
            "distribution": {
                "@type": "Distribution",
                "accessURL": access_url,
                "mediaType": JSON_LD,
            },
        }
    )
    return agrin_envelope(ds)


# Property name → the real vocabulary that defines it. Anything absent falls
# back to schema.org via `@vocab`, so a consumer can always resolve a term.
_BACKING_VOCAB = {
    "pillar": "AgriN (FloraNet namespace)",
    "cultivarName": "AgriN (FloraNet namespace)",
    "cropName": "AgriN (FloraNet namespace) → AgroVOC concept IRI",
    "accessionNumber": "AgriN (FloraNet namespace)",
    "institutionRef": "AgriN (FloraNet namespace)",
    "countryOfOrigin": "AgriN (FloraNet namespace)",
    "isoCountryCode": "AgriN (FloraNet namespace) → ISO 3166-1",
    "isReference": "AgriN (FloraNet namespace)",
    "profileVersion": "AgriN (FloraNet namespace)",
    "institutionCode": "AgriN (FloraNet namespace)",
    "institutionCountry": "AgriN (FloraNet namespace)",
    "layerDepth": "AgriN (FloraNet namespace)",
    "depthUnit": "AgriN (FloraNet namespace) → UN/CEFACT Recommendation 20",
    "observedAt": "AgriN (FloraNet namespace) → xsd:dateTime",
    "analysisMethod": "AgriN (FloraNet namespace)",
    "diseaseName": "AgriN (FloraNet namespace)",
    "pathogenName": "AgriN (FloraNet namespace)",
    "confidence": "AgriN (FloraNet namespace) → xsd:double",
    "benchmarkValidation": "AgriN (FloraNet namespace)",
    "wasDerivedFrom": "W3C PROV-O",
    "generatedAtTime": "W3C PROV-O",
    "license": "Dublin Core Terms",
    "conformsTo": "Dublin Core Terms",
    "temporalCoverage": "W3C DCAT",
    "spatialCoverage": "W3C DCAT",
    "distribution": "W3C DCAT",
    "accessURL": "W3C DCAT",
    "mediaType": "W3C DCAT",
    "Dataset": "W3C DCAT",
    "Distribution": "W3C DCAT",
    # ── Pillar 4 (carbon accounting + climate resilience) ─────────────────────
    "cropRole": "AgriN (FloraNet namespace)",
    "fixesNitrogen": "AgriN (FloraNet namespace)",
    "validatedInSystem": "AgriN (FloraNet namespace)",
    "additionalBenefits": "AgriN (FloraNet namespace)",
    "biomassDryMatterKgPerHaPerCycle": "AgriN (FloraNet namespace)",
    "biomassCarbonInputKgPerHaPerCycle": "AgriN (FloraNet namespace)",
    "socStockChangeTCPerHaPerYear": "AgriN (FloraNet namespace)",
    "socStockChangeTCO2ePerHaPerYear": "AgriN (FloraNet namespace)",
    "measurementDepthCm": "AgriN (FloraNet namespace)",
    "accountingMethod": "AgriN (FloraNet namespace)",
    "derivation": "AgriN (FloraNet namespace)",
    "creditReadiness": "AgriN (FloraNet namespace)",
    "creditClaimable": "AgriN (FloraNet namespace)",
    "derived": "AgriN (FloraNet namespace)",
    "droughtSignal": "AgriN (FloraNet namespace)",
    "scenarioUpliftPct": "AgriN (FloraNet namespace)",
    "scenarioIsCallerSupplied": "AgriN (FloraNet namespace)",
    "droughtSeverityFactor": "AgriN (FloraNet namespace)",
    "scoring": "AgriN (FloraNet namespace)",
    "rankedCandidates": "AgriN (FloraNet namespace)",
    "resilienceScore": "AgriN (FloraNet namespace)",
    "whyRecommended": "AgriN (FloraNet namespace)",
    "missingTraits": "AgriN (FloraNet namespace)",
    "traitsAreReferenceData": "AgriN (FloraNet namespace)",
    "limitations": "AgriN (FloraNet namespace)",
}


# ──────────────────────────────────────────────────────────────────────────────
# GET /context — the dereferenceable JSON-LD context document
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/context")
def get_agrin_context() -> JSONResponse:
    """
    The canonical JSON-LD `@context`, served on its own so a federating portal
    can fetch, cache and pin it rather than trusting whatever a given record
    happens to inline. This is what makes the profile genuinely dereferenceable.
    """
    return JSONResponse(
        content={
            "@context": AGRIIN_CONTEXT,
            "@id": AGRIIN_CONTEXT_IRI,
            "version": AGRIIN_VERSION,
            "profile": AGRIIN_PROFILE_IRI,
            "conformance": AGRIIN_CONFORMANCE,
        },
        media_type=JSON_LD,
    )


# ──────────────────────────────────────────────────────────────────────────────
# GET /schema — the profile a federating portal codes against
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/schema")
def get_agrin_profile() -> JSONResponse:
    """
    **The AgriN profile** — the contract a federating portal codes against.

    Derived at request time from the live Pydantic models, so the class and
    property lists can never drift from what the endpoints actually emit. The
    backing vocabulary of every term is named explicitly, because a consumer
    needs to know that `GeneticResource` is minted in the AgriN namespace while
    `Dataset`, `license` and `wasDerivedFrom` are DCAT / Dublin Core / PROV-O
    and resolve in any off-the-shelf JSON-LD processor.
    """
    classes = []
    for model in (
        GeneticResourceRecord,
        AgroInputRecord,
        SoilProfileRecord,
        DiagnosisRecord,
        CarbonSequestrationProfile,
        ResilienceMatch,
    ):
        schema = model.model_json_schema()
        props = schema.get("properties", {})
        classes.append(
            {
                "id": f"{AGRIIN_NS}{model.__name__.replace('Record', '')}",
                "label": model.__name__.replace("Record", ""),
                "description": (schema.get("description") or "").strip(),
                "pillar": props.get("pillar", {}).get("default"),
                "isReferenceByDefault": props.get("isReference", {}).get("default", True),
                "properties": [
                    {
                        "name": name,
                        "type": prop.get("type", "string"),
                        "backingVocabulary": _BACKING_VOCAB.get(name, "schema.org (via @vocab)"),
                        "description": prop.get("description"),
                    }
                    for name, prop in props.items()
                ],
            }
        )

    profile = {
        "@id": AGRIIN_PROFILE_IRI,
        "@type": "rdfs:Class",
        "name": "AgriN Interoperability Profile",
        "version": AGRIIN_VERSION,
        "description": (
            "AgriN (Agro-Inputs, Genetic Resources and Information Network) is the "
            "interoperability profile proposed by BARP, the BRICS Agricultural Research "
            "Platform. This document is FloraNet's implementation of that profile, "
            "covering genetic resources, agro-inputs, soil profiles and disease "
            "diagnoses so they can be federated across BRICS national portals."
        ),
        "conformance": AGRIIN_CONFORMANCE,
        "context": AGRIIN_CONTEXT_IRI,
        "namespace": AGRIIN_NS,
        "classes": classes,
        "memberInstitutions": BARP_MEMBER_INSTITUTIONS,
        "vocabularies": {
            "schema.org": "https://schema.org/",
            "DCAT": "http://www.w3.org/ns/dcat#",
            "PROV-O": "http://www.w3.org/ns/prov#",
            "SKOS": "http://www.w3.org/2004/02/skos/core#",
            "Dublin Core": "http://purl.org/dc/terms/",
            "GeoSPARQL": "http://www.w3.org/2003/01/geo/wgs84_pos#",
            "AgroVOC": "http://aims.fao.org/aos/agrovoc/",
            "XML Schema datatypes": "http://www.w3.org/2001/XMLSchema#",
        },
        "endpoints": {
            "geneticResources": "GET /api/v1/agrin/genetic-resources",
            "agroInputs": "GET /api/v1/agrin/agro-inputs",
            "soilProfiles": "GET /api/v1/agrin/soil-profiles?lat=&lng=",
            "diagnoses": "GET /api/v1/agrin/diagnoses",
            "carbonMetadata": "GET /api/v1/agrin/carbon-metadata",
            "resilienceMatch": (
                "GET /api/v1/agrin/resilience-match?lat=&lng=&scenarioUpliftPct="
            ),
            "dataset": "GET /api/v1/agrin/dataset",
            "context": "GET /api/v1/agrin/context",
        },
    }
    return JSONResponse(content=agrin_envelope(profile), media_type=JSON_LD)


# ──────────────────────────────────────────────────────────────────────────────
# Pillar 1 — Genetic resources
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/genetic-resources")
def list_genetic_resources(
    country: Optional[str] = Query(
        None, description="Filter by country of origin (e.g. India, Brazil, South Africa)"
    ),
) -> JSONResponse:
    """
    **`agrin:GeneticResource` records** — AgriN pillar 1.

    Sourced from `app.knowledge.genetic_resources`, which was moved out of two
    React components into the backend precisely because a record living in
    browser JavaScript cannot be federated.

    Trait scores are the issuing institution's published characterisation and
    every record carries `isReference: true` to say so. Entries with no stated
    accession number export that field as null rather than a plausible guess.
    """
    records: List[GeneticResourceRecord] = []
    for entry in genetic_resources.GENETIC_RESOURCES:
        if country and (entry.get("country") or "").lower() != country.lower():
            continue
        records.append(
            GeneticResourceRecord(**genetic_resources.to_agrin_fields(entry))
        )

    return JSONResponse(
        content=agrin_envelope(records), media_type=JSON_LD
    )


# ──────────────────────────────────────────────────────────────────────────────
# Pillar 2 — Agro-inputs
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/agro-inputs")
def list_agro_inputs() -> JSONResponse:
    """
    **`agrin:AgroInput` records** — AgriN pillar 2.

    Sourced from `app.knowledge.bio_inputs`, which already carries a publishing
    institution and a citation per entry, so each federated record stays
    traceable to the protocol it was taken from. These are published extension
    protocols (ICAR / Embrapa / ARC handbooks), not field measurements, hence
    `isReference: true`.
    """
    records: List[AgroInputRecord] = []
    for item in BIO_REMEDIES:
        records.append(
            AgroInputRecord(
                id=item.get("id", "unknown"),
                name=item.get("name", "Unnamed input"),
                description=item.get("mechanism"),
                category=item.get("category"),
                targets=list(item.get("targets") or []),
                form=item.get("form"),
                protocol=item.get("protocol"),
                mechanism=item.get("mechanism"),
                restoresMicrobiota=item.get("restores_microbiota"),
                citation=item.get("citation"),
                source=item.get("source"),
                isReference=True,
            )
        )
    return JSONResponse(content=agrin_envelope(records), media_type=JSON_LD)


# ──────────────────────────────────────────────────────────────────────────────
# Pillar 3 — Soil profiles (live)
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/soil-profiles")
async def get_soil_profile(
    lat: float = Query(18.5204, description="WGS84 latitude of the profile point"),
    lng: float = Query(73.8567, description="WGS84 longitude of the profile point"),
    days: int = Query(7, ge=1, le=92, description="Reanalysis window in days"),
    country: Optional[str] = Query(None, description="Country label for the record"),
) -> JSONResponse:
    """
    **`agrin:SoilProfile` record** — AgriN pillar 3, from real upstream data.

    Volumetric moisture and temperature come from ERA5-Land reanalysis via the
    Open-Meteo Archive API; SOC, pH and texture from ISRIC SoilGrids 2.0. Both
    are named in `wasDerivedFrom` (PROV-O) and `analysisMethod`, so a federated
    consumer can re-derive the record instead of trusting it blindly.

    Unlike the reference pillars, `isReference` is **false** here: these are
    measurements and modelled surfaces, not publications. If an upstream is
    unreachable this returns an explicit 503 — never a placeholder profile.
    """
    from app.services import real_data

    try:
        profile = await real_data.era5_soil_profile(lat, lng, days=days)
    except Exception as exc:
        raise HTTPException(
            status_code=503, detail=f"ERA5-Land soil profile unavailable: {exc}"
        )

    # SoilGrids is optional enrichment: the profile is still valid without it,
    # but the record must state which properties are actually present.
    soilgrids: Dict[str, Any] = {}
    try:
        soilgrids = real_data.soilgrids_summary(await real_data.soilgrids_point(lat, lng))
    except Exception as exc:
        soilgrids = {"available": False, "error": str(exc)}

    bands = profile.get("bands", {}) or {}
    depth_map = {"0_7cm": 7.0, "7_28cm": 28.0}
    layers: List[SoilLayerRecord] = []
    for key, depth_cm in depth_map.items():
        band = bands.get(key) or {}
        moisture = band.get("soil_moisture_m3m3")
        temp = band.get("soil_temp_c")
        if moisture is None and temp is None:
            continue
        layers.append(
            SoilLayerRecord(layerDepth=depth_cm, moisture=moisture, temperature=temp)
        )

    record = SoilProfileRecord(
        id=f"soil-{lat:.4f}-{lng:.4f}",
        name=f"ERA5-Land soil profile at {lat:.4f}, {lng:.4f}",
        description=(
            f"Mean volumetric soil moisture and temperature over the {days}-day window "
            "across the canonical 0-7 cm and 7-28 cm bands, with ISRIC SoilGrids "
            "surface properties where available."
        ),
        observedAt=_now(),
        analysisMethod=(
            f"ERA5-Land hourly reanalysis mean over {days} day(s) "
            "(Open-Meteo Archive API); ISRIC SoilGrids 2.0 for SOC/pH/texture"
        ),
        wasDerivedFrom=[
            "https://open-meteo.com/en/docs/historical-weather-api",
            "https://soilgrids.org/",
        ],
        latitude=lat,
        longitude=lng,
        country=country,
        layers=layers,
        soilOrganicCarbonPct=soilgrids.get("soc_percent"),
        soilPh=soilgrids.get("ph"),
        soilTexture=soilgrids.get("texture_class"),
        isReference=False,
    )
    return JSONResponse(content=agrin_envelope(record), media_type=JSON_LD)


def _to_diagnosis_record(task_id: str, payload: Dict[str, Any]) -> Optional[DiagnosisRecord]:
    """Project a stored diagnosis result onto agrin:DiseaseDiagnosis.

    Returns None when the payload is not a diagnosis at all, so the listing
    endpoint can skip unrelated tasks rather than emitting a malformed record.
    """
    if not isinstance(payload, dict) or not payload.get("disease_identification"):
        return None
    return DiagnosisRecord(
        id=f"diagnosis-{task_id}",
        name=str(payload.get("disease_identification"))[:200],
        description="Crop disease diagnosis produced by FloraNet's local open-weights vision model.",
        diseaseName=payload.get("disease_identification"),
        pathogenName=payload.get("pathogen"),
        cropName=payload.get("crop"),
        confidence=payload.get("confidence_score"),
        analysisMethod=(
            "Local open-weights vision model (Gemma 3 / Qwen2.5-VL via Ollama) grounded "
            "in the FloraNet BRICS agronomy RAG corpus and the open PlantVillage vocabulary"
        ),
        benchmarkValidation=payload.get("plantvillage_validation"),
        organicRemedies=list(payload.get("organic_remedies") or []),
        chemicalAlternatives=list(payload.get("chemical_alternatives") or []),
        additionalNotes=payload.get("additional_notes"),
        isReference=False,
    )


# ──────────────────────────────────────────────────────────────────────────────
# Pillar 3 — Disease diagnoses
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/diagnoses")
def list_diagnoses(
    task_id: Optional[str] = Query(
        None, description="Return a single diagnosis by task id instead of the list"
    ),
) -> JSONResponse:
    """
    **`agrin:DiseaseDiagnosis` records** — AgriN pillar 3.

    Diagnoses are read from the backend task store, which is the same store the
    doctor router writes to. That store is in-process and expires after one
    hour, so this endpoint reports `storage` honestly and returns an explicit
    empty result rather than implying a permanent national archive.

    `isReference` is false: these are FloraNet inferences, not publications. The
    PlantVillage cross-check is carried through verbatim, including the case
    where the model's label falls outside the open benchmark vocabulary — that
    flag must survive federation so a receiving portal can see it.
    """
    from app.task_store import snapshot_tasks

    tasks = snapshot_tasks()

    if task_id:
        entry = next((t for t in tasks if t["task_id"] == task_id), None)
        if entry is None or entry.get("status") != "SUCCESS":
            raise HTTPException(
                status_code=404,
                detail=(
                    f"No completed diagnosis for task '{task_id}'. The task store is "
                    "in-process and expires after 1 hour; re-run the diagnosis to federate it."
                ),
            )
        record = _to_diagnosis_record(task_id, entry.get("result") or {})
        if record is None:
            raise HTTPException(status_code=422, detail="Task result is not a diagnosis payload.")
        return JSONResponse(content=agrin_envelope(record), media_type=JSON_LD)

    records = [
        r
        for r in (
            _to_diagnosis_record(t["task_id"], t.get("result") or {}) for t in tasks
        )
        if r is not None
    ]
    return JSONResponse(
        content={
            **agrin_envelope(records),
            "storage": "in-process task store (expires after 1 hour; not a national archive)",
            "count": len(records),
        },
        media_type=JSON_LD,
    )



@router.get("/carbon-metadata")
def list_carbon_metadata(
    country: Optional[str] = Query(
        None, description="Filter by country of the validating institution (e.g. Brazil)"
    ),
    fixesNitrogen: Optional[bool] = Query(
        None, description="Restrict to leguminous (N-fixing) cover crops"
    ),
) -> JSONResponse:
    """
    **`agrin:CarbonSequestrationProfile` records** — AgriN pillar 4, reference data.

    Machine-readable carbon-sequestration metadata for the indigenous cover crops
    and green manures in the BRICS regenerative protocols (Embrapa Cerrado legumes,
    ICAR green manures, ARC covers), so a future carbon-credit aggregator can join
    on typed fields instead of re-keying prose out of extension PDFs.

    READ THE FLAGS BEFORE USING ANY NUMBER
    --------------------------------------
    Every record carries three independent claims:

      - `isReference: true`  the inputs are PUBLISHED LITERATURE, not a FloraNet
                             field measurement;
      - `derived: true`      FloraNet computed the SOC figure from those inputs
                             using the method in `derivation`;
      - `creditClaimable: false`
                             this is NOT an issued, verified or tradable carbon
                             credit. No baseline, additionality demonstration,
                             third-party verification or permanence accounting
                             has been performed.

    Every figure is a `{low, high}` range spanning both the published biomass
    spread and the conversion-efficiency spread, and `derivation` carries every
    assumption so a verifier can substitute their own values. This endpoint
    supports carbon ACCOUNTING metadata; it does not issue, certify or imply
    credit eligibility.
    """
    records: List[CarbonSequestrationProfile] = []
    for entry in carbon_sequestration.COVER_CROP_SOC_METADATA:
        if country and (entry.get("country") or "").lower() != country.lower():
            continue
        if fixesNitrogen is not None and bool(entry.get("fixes_nitrogen")) != fixesNitrogen:
            continue
        records.append(
            CarbonSequestrationProfile(**carbon_sequestration.to_agrin_fields(entry))
        )

    return JSONResponse(
        content={
            **agrin_envelope(records),
            "count": len(records),
            "disclaimer": (
                "Reference metadata for future carbon-credit AGGREGATION. These are "
                "published species-level literature ranges, not measurements, and "
                "creditClaimable is false on every record: no baseline, no "
                "additionality test, no third-party verification and no permanence "
                "accounting has been performed. Do not represent these figures as "
                "issued or verified carbon credits."
            ),
            "derivationDefaults": {
                "conversionEfficiency": carbon_sequestration.CONVERSION_EFFICIENCY,
                "dryMatterCarbonFraction": carbon_sequestration.DRY_MATTER_CARBON_FRACTION,
                "accountingMethod": carbon_sequestration.ACCOUNTING_METHOD,
                "measurementDepthCm": carbon_sequestration.MEASUREMENT_DEPTH_CM,
                "note": (
                    "Published so a verifier can re-derive every figure or replace "
                    "the assumptions; FloraNet holds no site measurement for any "
                    "record in this endpoint."
                ),
            },
        },
        media_type=JSON_LD,
    )


# ──────────────────────────────────────────────────────────────────────────────
# Agri-Kitchen — verified farm-made bio-input formulations (Sustainability)
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/agri-kitchen")
def get_agri_kitchen(
    country: Optional[str] = Query(
        None, description="Farmer's country; drives local-validation ordering"
    ),
    problem: Optional[str] = Query(
        None, description="Problem tag or free-text symptom, e.g. 'wilt', 'leaf blight'"
    ),
    limit: int = Query(4, ge=1, le=12, description="Maximum recipes to return"),
) -> JSONResponse:
    """
    **Agri-Kitchen** — the Sustainability pillar's formulation generator.

    Returns step-by-step, farm-made bio-input recipes ranked to put locally
    validated, high-local-material options first, over imported chemical
    fertilisers. Each recipe carries its ingredients with quantities and source
    hints, ordered preparation steps, dose, the institutions whose practice it
    follows, and a `spoken_script` for the read-aloud guide.

    `spoken_script` is generated from the SAME recipe record the text guide
    renders, so the audio and text can never disagree — a real risk when two
    copies of a protocol drift apart.

    Cross-region honesty: a recipe not validated for the farmer's country is
    still returned, but flagged `locally_validated: false` and ranked below
    local ones. Returning nothing would leave a Brazilian farmer with an empty
    panel instead of an honestly-labelled option.

    These are published extension protocols, so `isReference` is true
    throughout; see `validation_note` on each recipe for exactly which
    institutional guidance it rests on.
    """
    from app.knowledge import agri_kitchen

    recipes = agri_kitchen.recommend_recipes(country=country, problem=problem, limit=limit)
    for r in recipes:
        r["spoken_script"] = agri_kitchen.spoken_script(r)

    return JSONResponse(
        content={
            **agrin_envelope(recipes),
            "pillar": "Sustainability",
            "count": len(recipes),
            "country": country,
            "problem": problem,
            "basis": (
                "Published ICAR / Embrapa / ARC extension protocols for farm-made "
                "bio-inputs. Dosages are reference guidance calibrated per region — "
                "verify against your local extension bulletin before treating a "
                "commercial crop."
            ),
        },
        media_type=JSON_LD,
    )


# ──────────────────────────────────────────────────────────────────────────────
# GET /resilience-match — ranked cultivar response to an observed signal (live)
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/resilience-match")
async def get_resilience_match(
    lat: float = Query(18.5204, description="WGS84 latitude of the field"),
    lng: float = Query(73.8567, description="WGS84 longitude of the field"),
    scenarioUpliftPct: Optional[float] = Query(
        None,
        ge=0,
        le=300,
        description=(
            "OPTIONAL caller-supplied hypothetical drought-risk uplift, as a "
            "percentage (e.g. 30 for '30% higher chance of drought'). Applied on "
            "top of the OBSERVED signal. Omit to rank on observed conditions only."
        ),
    ),
    countries: Optional[str] = Query(
        None, description="Optional comma-separated country filter (e.g. 'India,South Africa')"
    ),
    limit: int = Query(8, ge=1, le=50, description="Number of ranked candidates to return"),
) -> JSONResponse:
    """
    **`agrin:ResilienceMatch` record** — AgriN pillar 4, live observation.

    Ranks the open/indigenous cultivar registry against the OBSERVED drought
    signal at a point, and publishes the full derivation: the index, its
    published interpretation, the severity factor, every scoring weight and a
    per-candidate breakdown. A recommendation a farmer cannot interrogate is a
    recommendation they will not act on, and one an institution cannot recompute
    is one they cannot federate.

    ON "30% HIGHER CHANCE OF DROUGHT"
    --------------------------------
    NASA POWER serves OBSERVED agro-climatology and issues no probabilities, so
    FloraNet does not invent one. This endpoint reports `droughtSignal` (the real
    observed SPEI, with its published interpretation) and `scenarioUpliftPct` (a
    CALLER-SUPPLIED hypothetical shift), the latter flagged
    `scenarioIsCallerSupplied: true`.

    Keeping an observed measurement and a caller scenario in separate, explicitly
    labelled fields is deliberate: silently merging them is how a public platform
    ends up telling farmers a forecast it never received.

    If POWER is unreachable this returns an explicit 503 — never a fabricated
    neutral signal, which during a real drought would be the worst possible lie.
    """
    from app.services import real_data, resilience_matcher

    country_filter = (
        [c for c in (countries or "").split(",") if c.strip()] if countries else None
    )

    try:
        power = await real_data.nasa_power_monthly(lat, lng)
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                f"NASA POWER monthly agro-climatology unavailable: {exc}. No cultivar "
                "ranking is issued without an observed signal — ranking on an "
                "invented one would misdirect farmers during a drought."
            ),
        )

    signal = resilience_matcher.compute_spei(power)
    observed_index = signal.get("index") if signal.get("available") else None

    # The uplift shifts the effective index, never the observed one. The observed
    # value is reported untouched so a consumer can always separate the
    # measurement from the planning scenario applied on top of it.
    effective_index = observed_index
    if scenarioUpliftPct is not None and observed_index is not None:
        effective_index = observed_index - (scenarioUpliftPct / 100.0) * 2.0

    severity = resilience_matcher.drought_severity(effective_index)
    ranking = resilience_matcher.rank_genetic_resources(
        severity, limit=limit, countries=country_filter
    )

    limitations = [
        "The cultivar trait scores are the issuing institutions' PUBLISHED "
        "CHARACTERISATIONS (isReference), not measurements taken by FloraNet and not "
        "verified for this specific field.",
        "Ranking is a transparent weighted rule engine, not a machine-learning "
        "model; it performs no cross-border quarantine, biosafety or trade-compliance "
        "screening.",
        "A climate-resilience ranking is not an agronomic suitability certificate. "
        "Local extension advice, seed availability and quarantine rules still apply.",
        "Replacing a local landrace with a registry line carries its own risk; "
        "on-farm trials remain the farmer's decision.",
    ]
    if scenarioUpliftPct is not None:
        limitations.insert(
            0,
            f"The {scenarioUpliftPct}% drought-risk uplift is a CALLER-SUPPLIED "
            "planning scenario, not a forecast or observation produced by FloraNet.",
        )
    if not signal.get("available"):
        limitations.insert(
            0,
            f"No usable drought index was computed ({signal.get('reason')}); "
            "candidates are ranked on neutral weights.",
        )

    record = ResilienceMatch(
        id=f"resilience-{lat:.4f}-{lng:.4f}",
        name=f"Indigenous resilience match at {lat:.4f}, {lng:.4f}",
        description=(
            "Ranked open/indigenous cultivars for a point, derived from the observed "
            "NASA POWER agro-climatic signal at that point."
        ),
        latitude=lat,
        longitude=lng,
        observedAt=_now(),
        analysisMethod=(
            "SPEI (Vicente-Serrano et al. 2010) over a 3-month accumulated "
            "precipitation-minus-PET water balance, standardised per calendar month "
            "against the POWER reference period; PET by Thornthwaite (1948). Severity "
            "is mapped piecewise-linearly onto 0–1 and shifts the published trait "
            "weights used for ranking."
        ),
        wasDerivedFrom=["https://power.larc.nasa.gov/"],
        droughtSignal=signal,
        scenarioUpliftPct=scenarioUpliftPct,
        scenarioIsCallerSupplied=scenarioUpliftPct is not None,
        droughtSeverityFactor=round(severity, 4),
        scoring=ranking["scoring"],
        rankedCandidates=ranking["ranked"],
        limitations=limitations,
        isReference=False,
    )

    payload = agrin_envelope(record)
    payload["poolSize"] = ranking["poolSize"]
    payload["countriesRequested"] = country_filter
    return JSONResponse(content=payload, media_type=JSON_LD)


# ──────────────────────────────────────────────────────────────────────────────
# GET /dataset — one DCAT Dataset spanning all three pillars
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/dataset")
def get_agrin_dataset() -> JSONResponse:
    """
    **One federable Dataset across all three AgriN pillars.**

    This is the endpoint a national portal harvests: a single JSON-LD document
    carrying DCAT distribution metadata (access URL, media type, licence) and a
    count per pillar, so ICAR / Embrapa / ARC can register FloraNet as a source
    without first discovering five separate routes.

    Soil profiles and diagnoses are live and depend on upstream services, so
    they are advertised as pointers rather than inlined here — this endpoint
    must never block on an upstream that happens to be down. Each pillar's
    availability is reported instead of being silently assumed.
    """
    return JSONResponse(
        content=_dataset(
            dataset_id=f"{AGRIIN_CONTEXT_IRI.rsplit('/context', 1)[0]}/dataset",
            name="FloraNet AgriN Federated Agricultural Dataset",
            description=(
                "Federable BRICS agricultural records under the AgriN profile: "
                "genetic resources (cultivars and germplasm accessions), agro-inputs "
                "(organic and biological protocols), live soil profiles (ERA5-Land + "
                "ISRIC SoilGrids) and crop disease diagnoses. Every record carries its "
                "own licence, provenance and an isReference flag distinguishing an "
                "institution's published characterisation from a live measurement."
            ),
            access_url="/api/v1/agrin/dataset",
            temporal="2024-01-01/present",
        )
        | {
            "pillars": {
                "geneticResources": {
                    "count": len(genetic_resources.GENETIC_RESOURCES),
                    "accessURL": "/api/v1/agrin/genetic-resources",
                    "isReference": True,
                },
                "agroInputs": {
                    "count": len(BIO_REMEDIES),
                    "accessURL": "/api/v1/agrin/agro-inputs",
                    "isReference": True,
                },
                "soilProfiles": {
                    "accessURL": "/api/v1/agrin/soil-profiles?lat=&lng=",
                    "isReference": False,
                    "note": "Live; returns HTTP 503 when the upstream reanalysis is unreachable.",
                },
                "diagnoses": {
                    "accessURL": "/api/v1/agrin/diagnoses",
                    "isReference": False,
                    "note": "Live; backed by the in-process task store (1 hour TTL).",
                },
                "carbonSequestration": {
                    "count": len(carbon_sequestration.COVER_CROP_SOC_METADATA),
                    "accessURL": "/api/v1/agrin/carbon-metadata",
                    "isReference": True,
                    "derived": True,
                    "note": (
                        "Published literature ranges for future carbon-credit "
                        "aggregation. creditClaimable is false on every record: no "
                        "baseline, additionality test, third-party verification or "
                        "permanence accounting has been performed."
                    ),
                },
                "resilienceMatch": {
                    "accessURL": (
                        "/api/v1/agrin/resilience-match?lat=&lng=&scenarioUpliftPct="
                    ),
                    "isReference": False,
                    "note": (
                        "Live; ranks the open/indigenous registry against the observed "
                        "NASA POWER signal. A caller-supplied scenarioUpliftPct is "
                        "flagged scenarioIsCallerSupplied and is never presented as a "
                        "forecast."
                    ),
                },
            },
            "memberInstitutions": BARP_MEMBER_INSTITUTIONS,
        },
        media_type=JSON_LD,
    )
