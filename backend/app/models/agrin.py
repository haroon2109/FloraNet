"""
AgriN Profile — FloraNet's implementation of the AgriN interoperability profile
=============================================================================

AgriN (Agro-Inputs, Genetic Resources and Information Network) is the
interoperability profile proposed by BARP, the BRICS Agricultural Research
Platform, so that a record produced by one national portal can be ingested
directly by another (ICAR, Embrapa, ARC, CAAS …) without bespoke translation.

This module is the SINGLE SOURCE OF TRUTH for AgriN in FloraNet. Every
AgriN-emitting router imports its context from here, which resolves a
long-standing defect: the codebase previously published two different
`@context` documents (`http://purl.org/agrin/schema/` in the DPG node and
`https://agrin.org/schema/v1/` in the soil router). Two contexts means two
incompatible term sets, which is precisely the interoperability failure the
standard exists to prevent. `scripts/check_agrin.py` fails the build if a
second context ever reappears.

AgriN's three pillars, and how this profile maps them:

    Pillar                AgriN class             Backing vocabulary
    --------------------  ----------------------  -----------------------
    Agro-Inputs           agrin:AgroInput         schema.org + SKOS
    Genetic Resources     agrin:GeneticResource   schema.org + SKOS + AgroVOC
    Information Network   agrin:SoilProfile       schema.org + GeoSPARQL
                          agrin:DiseaseDiagnosis  schema.org + PROV-O

HONESTY NOTES (consistent with the rest of the codebase)
--------------------------------------------------------
- The backbone is deliberately built from REAL, resolvable W3C/Schema
  vocabularies — schema.org, DCAT, PROV-O, SKOS, Dublin Core, GeoSPARQL, AgroVOC
  and ISO 3166-1. AgriN-specific terms are minted in a single FloraNet-
  controlled namespace. Nothing is invented that a consumer cannot dereference.
- `conformance` states plainly that this is an IMPLEMENTATION PROFILE pending
  formal BARP ratification, not a claim of official conformance.
- No value here is synthetic. Records carry an explicit provenance block naming
  the upstream source and method, and an `isReference` flag wherever a figure
  is an institution's published characterisation rather than a FloraNet
  measurement.
"""

from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

AGRIIN_VERSION = "1.0.0"

# FloraNet-hosted and therefore resolvable: the IRI every AgriN document
# emitted by this service points at.
AGRIIN_BASE = "https://floranet.ai/schema/agrin"
AGRIIN_CONTEXT_IRI = f"{AGRIIN_BASE}/{AGRIIN_VERSION}/context.jsonld"
AGRIIN_PROFILE_IRI = f"{AGRIIN_BASE}/{AGRIIN_VERSION}/profile"

# Namespace AgriN terms are minted in. Provisional: expected to move under a
# BARP-controlled purl once ratified, hence the pinned version in the IRI.
AGRIIN_NS = f"{AGRIIN_BASE}/term/"

LICENSE_CC_BY_4 = "https://creativecommons.org/licenses/by/4.0/"

# BARP-aligned national research portals. `iso3` follows ISO 3166-1 alpha-3 so
# consumers can join to UN/CEFACT country lists without a bespoke lookup.
BARP_MEMBER_INSTITUTIONS: List[Dict[str, str]] = [
    {"id": "ICAR", "name": "Indian Council of Agricultural Research", "country": "India", "iso3": "IND"},
    {"id": "ICRISAT", "name": "International Crops Research Institute for the Semi-Arid Tropics", "country": "India", "iso3": "IND"},
    {"id": "EMBRAPA", "name": "Embrapa (Empresa Brasileira de Pesquisa Agropecuaria)", "country": "Brazil", "iso3": "BRA"},
    {"id": "ARC", "name": "Agricultural Research Council", "country": "South Africa", "iso3": "ZAF"},
    {"id": "CAAS", "name": "Chinese Academy of Agricultural Sciences", "country": "China", "iso3": "CHN"},
    {"id": "VNIISHKH", "name": "V.I. Vernadsky National Institute of Soil Science", "country": "Russia", "iso3": "RUS"},
    {"id": "EARI", "name": "Ethiopian Agricultural Research Institute partner network", "country": "Ethiopia", "iso3": "ETH"},
]


# ──────────────────────────────────────────────────────────────────────────────
# The canonical JSON-LD context
# ──────────────────────────────────────────────────────────────────────────────
# `@vocab` is schema.org so unprefixed keys resolve to a vocabulary every JSON-LD
# consumer already knows. AgriN-specific classes are minted in `agrin:`; every
# other term delegates to the real standard vocabularies.
AGRIIN_CONTEXT: Dict[str, Any] = {
    "@vocab": "https://schema.org/",
    "agrin": AGRIIN_NS,
    "dcat": "http://www.w3.org/ns/dcat#",
    "dcterms": "http://purl.org/dc/terms/",
    "prov": "http://www.w3.org/ns/prov#",
    "skos": "http://www.w3.org/2004/02/skos/core#",
    "geo": "http://www.w3.org/2003/01/geo/wgs84_pos#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "fao": "http://aims.fao.org/aos/agrovoc/",
    # ── AgriN pillars ───────────────────────────────────────────────────────
    "AgroInput": "agrin:AgroInput",
    "GeneticResource": "agrin:GeneticResource",
    "SoilProfile": "agrin:SoilProfile",
    "DiseaseDiagnosis": "agrin:DiseaseDiagnosis",
    # ── Pillar 4 additions: carbon accounting + climate resilience ─────────────
    # Carbon sequestration metadata (cover crops / green manures) and the ranked
    # resilience response to an observed agro-climatic signal. Both are needed
    # for a BRICS-wide carbon-credit aggregator, which cannot join on prose.
    "CarbonSequestrationProfile": "agrin:CarbonSequestrationProfile",
    "ResilienceMatch": "agrin:ResilienceMatch",
    # ── AgriN properties ────────────────────────────────────────────────────
    "pillar": {"@id": "agrin:pillar", "@type": "@vocab"},
    "cultivarName": "agrin:cultivarName",
    "cropName": {"@id": "agrin:cropName", "@type": "@vocab"},
    "institutionRef": {"@id": "agrin:institutionRef", "@type": "@id"},
    "countryOfOrigin": {"@id": "agrin:countryOfOrigin", "@type": "@vocab"},
    "isoCountryCode": "agrin:isoCountryCode",
    "accessionNumber": "agrin:accessionNumber",
    "isReference": {"@id": "agrin:isReference", "@type": "xsd:boolean"},
    "conformance": "agrin:conformance",
    "profileVersion": "agrin:profileVersion",
    "institutionCode": "agrin:institutionCode",
    "institutionCountry": "agrin:institutionCountry",
    "layerDepth": {"@id": "agrin:layerDepth", "@type": "xsd:double"},
    "depthUnit": "agrin:depthUnit",
    "observedAt": {"@id": "agrin:observedAt", "@type": "xsd:dateTime"},
    "analysisMethod": "agrin:analysisMethod",
    "diseaseName": "agrin:diseaseName",
    "pathogenName": "agrin:pathogenName",
    "confidence": {"@id": "agrin:confidence", "@type": "xsd:double"},
    "benchmarkValidation": "agrin:benchmarkValidation",
    # ── Carbon-accounting properties ──────────────────────────────────────────
    # `low`/`high` paired properties are deliberately RANGES rather than point
    # values: these are published species-level literature figures and a
    # fabricated single number would imply a precision nobody has measured.
    "cropRole": "agrin:cropRole",
    "fixesNitrogen": "agrin:fixesNitrogen",
    "validatedInSystem": "agrin:validatedInSystem",
    "additionalBenefits": "agrin:additionalBenefits",
    "biomassDryMatterKgPerHaPerCycle": "agrin:biomassDryMatterKgPerHaPerCycle",
    "biomassCarbonInputKgPerHaPerCycle": "agrin:biomassCarbonInputKgPerHaPerCycle",
    "socStockChangeTCPerHaPerYear": "agrin:socStockChangeTCPerHaPerYear",
    "socStockChangeTCO2ePerHaPerYear": "agrin:socStockChangeTCO2ePerHaPerYear",
    "measurementDepthCm": {"@id": "agrin:measurementDepthCm", "@type": "xsd:double"},
    "accountingMethod": "agrin:accountingMethod",
    "derivation": "agrin:derivation",
    "creditReadiness": "agrin:creditReadiness",
    "creditClaimable": {"@id": "agrin:creditClaimable", "@type": "xsd:boolean"},
    "derived": {"@id": "agrin:derived", "@type": "xsd:boolean"},
    # ── Climate-resilience properties ─────────────────────────────────────────
    "droughtSignal": "agrin:droughtSignal",
    "scenarioUpliftPct": {"@id": "agrin:scenarioUpliftPct", "@type": "xsd:double"},
    "scenarioIsCallerSupplied": {"@id": "agrin:scenarioIsCallerSupplied", "@type": "xsd:boolean"},
    "droughtSeverityFactor": {"@id": "agrin:droughtSeverityFactor", "@type": "xsd:double"},
    "scoring": "agrin:scoring",
    "rankedCandidates": "agrin:rankedCandidates",
    "resilienceScore": {"@id": "agrin:resilienceScore", "@type": "xsd:double"},
    "whyRecommended": "agrin:whyRecommended",
    "missingTraits": "agrin:missingTraits",
    "traitsAreReferenceData": {"@id": "agrin:traitsAreReferenceData", "@type": "xsd:boolean"},
    # Standard terms that need no minted equivalent.
    "Dataset": "dcat:Dataset",
    "Distribution": "dcat:Distribution",
    "wasDerivedFrom": {"@id": "prov:wasDerivedFrom", "@type": "@id"},
    "generatedAtTime": {"@id": "prov:generatedAtTime", "@type": "xsd:dateTime"},
    "wasAttributedTo": {"@id": "prov:wasAttributedTo", "@type": "@id"},
    "Entity": "prov:Entity",
    "Activity": "prov:Activity",
    "Agent": "prov:Agent",
    "license": {"@id": "dcterms:license", "@type": "@id"},
    "publisher": {"@id": "dcterms:publisher", "@type": "@id"},
    "conformsTo": {"@id": "dcterms:conformsTo", "@type": "@id"},
    "temporalCoverage": "dcat:temporalCoverage",
    "spatialCoverage": "dcat:spatialCoverage",
    "distribution": {"@id": "dcat:distribution", "@type": "@id"},
    "accessURL": {"@id": "dcat:accessURL", "@type": "@id"},
    "mediaType": "dcat:mediaType",
}

AGRIIN_CONFORMANCE = (
    "AgriN implementation profile v1.0.0, emitted by FloraNet. This node maps its "
    "records onto schema.org, DCAT, PROV-O, SKOS, Dublin Core and GeoSPARQL so they "
    "are machine-readable without a proprietary vocabulary. The AgriN term namespace "
    "is provisional and pinned by version; it is expected to migrate to a "
    "BARP-controlled permanent IRI once the standard is ratified. Consumers should "
    "follow `sameAs` and re-project onto ratified terms as they are issued."
)


# ──────────────────────────────────────────────────────────────────────────────
# Shared record scaffolding
# ──────────────────────────────────────────────────────────────────────────────
class AgriNRecord(BaseModel):
    """Fields every federable AgriN record carries.

    Subclasses set `@type` to their AgriN class. `context` is not declared here:
    it is attached once, at serialisation time by `agrin_envelope`, so the
    context can never drift between records.
    """

    id: str = Field(description="Node-local stable identifier")
    name: str = Field(description="Human-readable record name")
    description: Optional[str] = Field(default=None, description="What this record is")
    sameAs: Optional[str] = Field(
        default=None, description="Canonical URI for this record in its issuing portal"
    )
    license_: str = Field(
        default=LICENSE_CC_BY_4, alias="license", description="Reuse licence (CC-BY 4.0)"
    )
    isReference: bool = Field(
        default=True,
        description=(
            "True when the values come from a cited institutional publication or "
            "reference dataset rather than a live measurement by FloraNet"
        ),
    )
    profileVersion: str = Field(
        default=AGRIIN_VERSION, description="AgriN profile version that produced this record"
    )
    institutionCode: Optional[str] = Field(
        default=None, description="Issuing institution code (ICAR, EMBRAPA, ARC …)"
    )
    institutionCountry: Optional[str] = Field(
        default=None, description="Issuing institution country (ISO 3166-1 alpha-3)"
    )

    model_config = {"populate_by_name": True}


class AgriNDataset(BaseModel):
    """A DCAT Dataset wrapping one or more AgriN records for federation."""

    type: str = Field(default="Dataset", alias="@type")
    id: str = Field(alias="@id")
    name: str
    description: str
    publisher: Dict[str, Any] = Field(
        default_factory=lambda: {
            "@type": "Organization",
            "@id": "https://floranet.ai",
            "name": "FloraNet",
        },
        description="dcterms:publisher as a nested prov:Agent",
    )
    license: str = Field(default=LICENSE_CC_BY_4)
    conformsTo: str = Field(alias="conformsTo", default=AGRIIN_PROFILE_IRI)
    conformance: str = Field(default=AGRIIN_CONFORMANCE)
    profileVersion: str = Field(default=AGRIIN_VERSION)
    temporalCoverage: str = Field(alias="temporalCoverage")
    spatialCoverage: str = Field(alias="spatialCoverage", default="BRICS member nations")
    distribution: Optional[Dict[str, Any]] = Field(
        default=None, alias="distribution", description="dcat:Distribution for this dataset"
    )

    model_config = {"populate_by_name": True}




# ──────────────────────────────────────────────────────────────────────────────
# Pillar 1 & 2: Genetic resources and agro-inputs
# ──────────────────────────────────────────────────────────────────────────────
class GeneticResourceRecord(AgriNRecord):
    """A cultivar / germplasm accession — the AgriN Genetic Resources pillar.

    Trait scores are the issuing institution's published characterisation
    (`isReference` stays true). They are deliberately optional: a portal holding
    only a name and an accession number is still a valid, ingestable record, and
    inventing a 0 or a null-equivalent would be worse than honest omission.
    """

    type: str = Field(default="agrin:GeneticResource", alias="@type")
    pillar: str = Field(default="agrin:GeneticResources")
    cultivarName: Optional[str] = Field(default=None, description="Cultivar / variety name")
    cropName: Optional[str] = Field(default=None, description="Crop species name")
    accessionNumber: Optional[str] = Field(
        default=None, description="Institutional germplasm accession identifier"
    )
    institutionRef: Optional[str] = Field(
        default=None, description="Issuing institution as a resolvable URI"
    )
    countryOfOrigin: Optional[str] = Field(default=None, description="Country of origin")
    isoCountryCode: Optional[str] = Field(
        default=None, description="ISO 3166-1 alpha-3 country code"
    )
    pedigree: Optional[str] = Field(default=None, description="Parentage / lineage")
    droughtResistance: Optional[float] = Field(
        default=None, ge=0, le=100, description="Published drought-tolerance score (%)"
    )
    heatTolerance: Optional[float] = Field(
        default=None, ge=0, le=100, description="Published heat-tolerance score (%)"
    )
    germinationRate: Optional[float] = Field(
        default=None, ge=0, le=100, description="Published germination rate (%)"
    )
    pestResistance: Optional[str] = Field(default=None, description="Published pest/disease resistance")
    soilMatch: Optional[str] = Field(default=None, description="Published soil-type affinity")
    nitrogenFixing: Optional[str] = Field(default=None, description="Nitrogen-fixing ability")
    socSequestration: Optional[str] = Field(
        default=None, description="Published soil-organic-carbon potential"
    )
    yearReleased: Optional[int] = Field(default=None, description="Year of institutional release")


class AgroInputRecord(AgriNRecord):
    """A bio-input / agro-input — the AgriN Agro-Inputs pillar.

    Sourced from app.knowledge.bio_inputs, which already carries an institution
    attribution and a citation string per entry, so every federated record stays
    traceable to the protocol it came from.
    """

    type: str = Field(default="agrin:AgroInput", alias="@type")
    pillar: str = Field(default="agrin:AgroInputs")
    category: Optional[str] = Field(default=None, description="Input category (bio-fungicide …)")
    targets: List[str] = Field(
        default_factory=list, description="Problem tags this input is indicated for"
    )
    form: Optional[str] = Field(default=None, description="How the input is applied")
    protocol: Optional[str] = Field(default=None, description="Published application protocol")
    mechanism: Optional[str] = Field(default=None, description="Stated mode of action")
    restoresMicrobiota: Optional[bool] = Field(
        default=None, description="Whether the input is stated to restore soil microbiota"
    )
    citation: Optional[str] = Field(default=None, description="Source document / citation")
    source: Optional[str] = Field(default=None, description="Named publishing institution")


class SoilLayerRecord(BaseModel):
    """One depth band of a soil profile."""

    layerDepth: float = Field(description="Depth of this layer, in centimetres below surface")
    depthUnit: str = Field(default="cm", description="Unit for `layerDepth` (UN/CEFACT Rec 20)")
    moisture: Optional[float] = Field(
        default=None, description="Mean volumetric water content (m³/m³) over the window"
    )
    temperature: Optional[float] = Field(
        default=None, description="Mean soil temperature (°C) over the window"
    )

    model_config = {"populate_by_name": True}


class SoilProfileRecord(AgriNRecord):
    """A soil profile observation — the AgriN Information Network pillar.

    Backed by real ERA5-Land reanalysis (Open-Meteo Archive, CC-BY 4.0) and
    ISRIC SoilGrids, so `isReference` is false: these ARE live/model
    measurements, unlike the cultivar trait scores.
    """

    type: str = Field(default="agrin:SoilProfile", alias="@type")
    pillar: str = Field(default="agrin:InformationNetwork")
    isReference: bool = Field(
        default=False,
        description="False — derived from live ERA5-Land reanalysis and ISRIC SoilGrids, not a publication",
    )
    observedAt: Optional[str] = Field(
        default=None, description="ISO-8601 instant the profile describes"
    )
    analysisMethod: Optional[str] = Field(
        default=None, description="Upstream dataset and computation actually used"
    )
    wasDerivedFrom: Optional[List[str]] = Field(
        default=None, description="Resolvable upstream source URIs (PROV-O)"
    )
    latitude: Optional[float] = Field(default=None, description="WGS84 latitude of the profile point")
    longitude: Optional[float] = Field(default=None, description="WGS84 longitude of the profile point")
    soilType: Optional[str] = Field(default=None, description="Soil classification (WRB / local)")
    currentCrop: Optional[str] = Field(default=None, description="Crop in season at the point")
    country: Optional[str] = Field(default=None, description="Country of the profile point")
    isoCountryCode: Optional[str] = Field(default=None, description="ISO 3166-1 alpha-3")
    layers: List[SoilLayerRecord] = Field(
        default_factory=list, description="Depth-resolved measurements"
    )
    soilOrganicCarbonPct: Optional[float] = Field(
        default=None, description="SOC stock in the 0–5 cm horizon (%), ISRIC SoilGrids"
    )
    soilPh: Optional[float] = Field(default=None, description="Soil pH, ISRIC SoilGrids")
    soilTexture: Optional[str] = Field(default=None, description="Soil texture class, ISRIC SoilGrids")


class DiagnosisRecord(AgriNRecord):
    """A crop disease diagnosis — the AgriN Information Network pillar.

    `isReference` is false because the diagnosis is produced by FloraNet's own
    inference at request time. `benchmarkValidation` is carried verbatim from
    the PlantVillage cross-check, including the case where the model's label
    falls OUTSIDE the open benchmark vocabulary — that flag is never smoothed
    away, because a federated portal needs to see it.
    """

    type: str = Field(default="agrin:DiseaseDiagnosis", alias="@type")
    pillar: str = Field(default="agrin:InformationNetwork")
    isReference: bool = Field(
        default=False, description="False — produced by FloraNet inference, not a publication"
    )
    diseaseName: str = Field(description="Identified disease, pest or condition")
    pathogenName: Optional[str] = Field(default=None, description="Causal organism, where known")
    cropName: Optional[str] = Field(default=None, description="Affected crop")
    confidence: Optional[float] = Field(
        default=None, ge=0, le=1, description="Model confidence, 0.0–1.0"
    )
    analysisMethod: Optional[str] = Field(
        default=None, description="Model and grounding corpus used"
    )
    observedAt: Optional[str] = Field(default=None, description="ISO-8601 instant of the observation")
    wasDerivedFrom: Optional[List[str]] = Field(
        default=None, description="Resolvable upstream source URIs (PROV-O)"
    )
    latitude: Optional[float] = Field(default=None, description="WGS84 latitude, when reported")
    longitude: Optional[float] = Field(default=None, description="WGS84 longitude, when reported")
    benchmarkValidation: Optional[str] = Field(
        default=None,
        description="Verbatim PlantVillage vocabulary cross-check, including out-of-benchmark flags",
    )
    organicRemedies: List[Dict[str, Any]] = Field(
        default_factory=list, description="Organic / regenerative interventions"
    )
    chemicalAlternatives: List[Dict[str, Any]] = Field(
        default_factory=list, description="Chemical alternatives where the condition is severe"
    )
    additionalNotes: Optional[str] = Field(default=None, description="Contextual agronomic advice")


class CarbonSequestrationProfile(AgriNRecord):
    """A cover crop / green manure with carbon-sequestration metadata.

    Pillar 4. Exists so a future carbon-credit aggregator can join on typed
    fields rather than re-keying prose out of extension PDFs.

    The flags carry three DISTINCT claims and must not be collapsed:

    - `isReference: true` → the inputs are published literature, not a
      FloraNet field measurement.
    - `derived: true`     → FloraNet computed the SOC figure from other numbers
      using the method published in `derivation`.
    - `creditClaimable: false` → this is NOT an issued, verified or tradable
      credit, and no amount of reading it as one makes it so.

    Every numeric field is a `{low, high}` range. A point value here would imply
    a measurement precision that does not exist.
    """

    type: str = Field(default="agrin:CarbonSequestrationProfile", alias="@type")
    pillar: str = Field(default="agrin:CarbonSequestration")
    cultivarName: Optional[str] = Field(default=None, description="Cultivar / variety name")
    accessionNumber: Optional[str] = Field(default=None, description="Germplasm accession")
    cropRole: Optional[str] = Field(default=None, description="cover_crop, green_manure, …")
    validatedInSystem: Optional[str] = Field(
        default=None, description="Named national system the practice is validated in"
    )
    fixesNitrogen: Optional[bool] = Field(default=None, description="Leguminous N fixation")
    additionalBenefits: List[str] = Field(
        default_factory=list, description="Co-benefits beyond carbon (pest control, structure)"
    )
    biomassDryMatterKgPerHaPerCycle: Optional[Dict[str, Any]] = Field(
        default=None, description="Published dry-matter yield range per cover cycle"
    )
    biomassCarbonInputKgPerHaPerCycle: Optional[Dict[str, Any]] = Field(
        default=None, description="Derived biomass carbon input range"
    )
    socStockChangeTCPerHaPerYear: Optional[Dict[str, Any]] = Field(
        default=None, description="DERIVED soil-organic-carbon stock-change range, t C/ha/yr"
    )
    socStockChangeTCO2ePerHaPerYear: Optional[Dict[str, Any]] = Field(
        default=None, description="Same range expressed as t CO2e/ha/yr"
    )
    cycleDays: Optional[Dict[str, Any]] = Field(default=None, description="Cover-cycle length")
    measurementDepthCm: Optional[float] = Field(
        default=None, description="Soil depth the stock change refers to (cm)"
    )
    accountingMethod: Optional[str] = Field(
        default=None, description="Published accounting method / tier"
    )
    derivation: Optional[Dict[str, Any]] = Field(
        default=None, description="Every assumption used to derive the figures above"
    )
    creditReadiness: List[str] = Field(
        default_factory=list,
        description="What is still missing before this could support a carbon claim",
    )
    creditClaimable: bool = Field(
        default=False, description="Always false — no verification has occurred in FloraNet"
    )
    derived: bool = Field(
        default=True, description="True — the figures are computed from published inputs"
    )
    citation: Optional[str] = Field(default=None, description="Source publication / protocol")
    source: Optional[str] = Field(default=None, description="Named publishing institution")
    institutionRef: Optional[str] = Field(default=None, description="Issuing institution URI")


class ResilienceMatch(AgriNRecord):
    """A ranked, explained cultivar recommendation for one point on the planet.

    Pillar 4. Bundles the OBSERVED agro-climatic signal with the ranked response
    to it, so a federating consumer can audit the causal chain from telemetry to
    recommendation instead of receiving an unexplained list.

    `isReference` is false: the signal is an observation from NASA POWER and the
    ranking is computed at request time. The underlying cultivar traits remain
    reference data and each candidate says so via `traitsAreReferenceData`.
    """

    type: str = Field(default="agrin:ResilienceMatch", alias="@type")
    pillar: str = Field(default="agrin:InformationNetwork")
    isReference: bool = Field(
        default=False, description="False — observed signal plus request-time computation"
    )
    latitude: Optional[float] = Field(default=None, description="WGS84 latitude")
    longitude: Optional[float] = Field(default=None, description="WGS84 longitude")
    observedAt: Optional[str] = Field(default=None, description="ISO-8601 instant of the signal")
    analysisMethod: Optional[str] = Field(default=None, description="Index + scoring method used")
    wasDerivedFrom: Optional[List[str]] = Field(
        default=None, description="Resolvable upstream source URIs (PROV-O)"
    )
    droughtSignal: Optional[Dict[str, Any]] = Field(
        default=None, description="Observed SPEI and its published interpretation"
    )
    scenarioUpliftPct: Optional[float] = Field(
        default=None, description="Caller-supplied hypothetical risk uplift, as a percentage"
    )
    scenarioIsCallerSupplied: bool = Field(
        default=False,
        description="True when the uplift is a caller scenario, not a FloraNet observation",
    )
    droughtSeverityFactor: Optional[float] = Field(
        default=None, ge=0, le=1, description="Normalised 0–1 severity driving the weights"
    )
    scoring: Optional[Dict[str, Any]] = Field(
        default=None, description="Published weights and method, so the ranking is recomputable"
    )
    rankedCandidates: List[Dict[str, Any]] = Field(
        default_factory=list, description="Ranked cultivars with score components and reasons"
    )
    limitations: List[str] = Field(
        default_factory=list, description="What this record does NOT establish"
    )


def agrin_envelope(payload: Any) -> Dict[str, Any]:
    """Attach the canonical `@context` to a record, dataset or list of records.

    Centralised on purpose: the single most damaging AgriN defect is two
    documents claiming different contexts. Every AgriN response in FloraNet goes
    through here, so the context is attached exactly once per document.
    """
    if isinstance(payload, list):
        return {
            "@context": AGRIIN_CONTEXT,
            "records": [
                p.model_dump(by_alias=True, exclude_none=True)
                if hasattr(p, "model_dump")
                else p
                for p in payload
            ],
        }
    if hasattr(payload, "model_dump"):
        data = payload.model_dump(by_alias=True, exclude_none=True)
    else:
        data = dict(payload)
    return {"@context": AGRIIN_CONTEXT, **data}

