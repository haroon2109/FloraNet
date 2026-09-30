from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict


class AgriNJsonLD(BaseModel):
    """Base schema for standard JSON-LD interoperability across DPG nodes"""
    context: str = Field(alias="@context", default="https://schema.org")
    type: str = Field(alias="@type")

class PestOutbreakVector(BaseModel):
    """Schema for transboundary pest outbreaks"""
    id: str = Field(description="Unique identifier for the outbreak event")
    pest_name: str = Field(description="Scientific or common name of the pest")
    latitude: float = Field(description="Current epicenter latitude")
    longitude: float = Field(description="Current epicenter longitude")
    severity: str = Field(description="Severity level (e.g., high, medium, low)")
    vector_direction: str = Field(description="Estimated trajectory or wind-assisted direction (e.g., North-East)")
    affected_crop: str = Field(description="Primary crop affected")
    origin_country: str = Field(description="Country where the outbreak originated")
    date_observed: Optional[str] = Field(
        default=None,
        description="ISO-8601 timestamp of the source's latest observation, when the feed carries one",
    )

class OutbreakCollectionLD(AgriNJsonLD):
    """JSON-LD wrapper for a collection of pest outbreaks"""
    type: str = Field(alias="@type", default="Dataset")
    name: str = Field(default="BRICS Transboundary Pest Outbreaks")
    data: List[PestOutbreakVector] = Field(description="List of current active outbreaks")

class CarbonEstimate(BaseModel):
    """Derived carbon-sequestration estimate — an explicit calculation, never a
    measurement and never a randomized number.

    Every payload carries the rate, the method and the WDI indicator the figure
    was computed from so a consumer can re-derive or override it.
    """
    value_t_c_per_year: float = Field(
        description="Estimated tonnes of carbon (elemental C) sequestered per year"
    )
    value_tco2e_per_year: float = Field(
        description="The same estimate expressed as tonnes of CO2 equivalent (x 44/12)"
    )
    rate_t_c_per_ha: float = Field(
        description="Sequestration rate assumption applied, in tonnes C per hectare per year"
    )
    derived: bool = Field(
        default=True,
        description="Always true — flags this value as a derived estimate, not an observation",
    )
    method: str = Field(
        description="Exact arithmetic used, e.g. 'arable_land_ha (2021) x 0.4 t C/ha/yr'"
    )
    basis_indicator: str = Field(
        description="WDI indicator code the estimate is computed from"
    )
    rate_basis: str = Field(
        description="Provenance of the rate assumption applied to the real WDI datum"
    )


class SOCRegionStats(BaseModel):
    """Macro-analytics for Soil Organic Carbon & policy indicators.

    Field names state exactly what the value is: all raw values are World Bank
    WDI v2 observations carrying their own data year, and `carbon_estimate` is
    the only derived figure (flagged via `derived: true`).
    """
    region: str = Field(description="Geographic region or state (e.g., Mato Grosso, Maharashtra)")
    country: str = Field(description="BRICS nation")
    fertilizer_intensity_pct: Optional[float] = Field(
        description=(
            "Fertilizer consumption (% of production), WDI AG.CON.FERT.PT.ZS. "
            "Lower values indicate lower synthetic-input intensity."
        )
    )
    agri_land_pct: Optional[float] = Field(
        description="Agricultural land (% of land area), WDI AG.LND.AGRI.ZS"
    )
    arable_land_ha: Optional[float] = Field(
        description="Arable land in hectares, WDI AG.LND.ARBL.HA"
    )
    carbon_estimate: Optional[CarbonEstimate] = Field(
        description="Derived sequestration estimate computed from arable_land_ha (never a measurement)"
    )
    data_vintage: str = Field(
        description="WDI data year(s) behind this row, e.g. 'WDI fertilizer 2022 · arable 2021'"
    )


class SOCTrackerSummary(BaseModel):
    """Regional macro-aggregates across the reporting BRICS nations."""
    countries_reporting: int = Field(description="Nations that returned at least one WDI datum")
    mean_fertilizer_intensity_pct: Optional[float] = Field(
        description="Unweighted mean of fertilizer_intensity_pct across reporting nations"
    )
    mean_agri_land_pct: Optional[float] = Field(
        description="Unweighted mean of agri_land_pct across reporting nations"
    )
    total_arable_land_ha: Optional[float] = Field(
        description="Sum of arable_land_ha across reporting nations"
    )
    total_carbon_estimate_t_c_per_year: Optional[float] = Field(
        description="Sum of the derived per-nation carbon estimates"
    )
    rate_t_c_per_ha: float = Field(
        description="Sequestration rate assumption applied to every derived estimate in this payload"
    )


class SOCTrackerCollectionLD(AgriNJsonLD):
    """JSON-LD wrapper for SOC regional statistics"""
    type: str = Field(alias="@type", default="Dataset")
    name: str = Field(default="BRICS Regional SOC & Policy Tracker")
    source: str = Field(
        default="World Bank WDI v2 API (CC-BY 4.0); carbon figures are derived estimates"
    )
    summary: SOCTrackerSummary = Field(description="Macro-aggregates across reporting nations")
    data: List[SOCRegionStats] = Field(description="Per-nation SOC & policy indicators")

class DiseaseModelRecord(BaseModel):
    """A localized disease model registered by a cross-border institution."""
    model_name: str = Field(description="Name of the disease prediction model")
    institution: str = Field(description="Reporting institution (e.g., ICAR, Embrapa, ARC)")
    target_pathogen: str = Field(description="Pathogen the model detects/predicts")
    model_version: str = Field(description="Version string of the model")
    parameters_required: List[str] = Field(
        default_factory=list,
        description="Input parameters the model requires (e.g., temp, humidity, leaf_wetness)",
    )
    endpoint_url: Optional[str] = Field(
        default=None, description="Endpoint if the model is hosted externally"
    )
    registry_id: Optional[str] = Field(
        default=None, description="Receipt id returned by the ingestion registry"
    )
    received_at: Optional[str] = Field(
        default=None, description="UTC timestamp (ISO-8601) the registry received the model"
    )


class DiseaseModelCollectionLD(AgriNJsonLD):
    """JSON-LD wrapper for the shared/federated disease-model registry."""
    type: str = Field(alias="@type", default="Dataset")
    name: str = Field(default="BRICS Federated Disease Model Registry")
    storage: str = Field(
        description="Where these records were read from (supabase, or in-memory when unconfigured)"
    )
    count: int = Field(description="Number of records in this response")
    data: List[DiseaseModelRecord] = Field(description="Registered localized disease models")


class DiseaseModelIngest(BaseModel):
    """Standardized schema for institutions to push disease models"""
    institution: str = Field(description="Name of the reporting institution (e.g., ICAR, Embrapa)")
    model_name: str = Field(description="Name of the disease prediction model")
    target_pathogen: str = Field(description="Pathogen the model detects/predicts")
    model_version: str = Field(description="Version string of the model")
    parameters_required: List[str] = Field(description="List of input parameters (e.g., temp, humidity, leaf_wetness)")
    endpoint_url: Optional[str] = Field(description="Optional endpoint if the model is hosted externally", default=None)
