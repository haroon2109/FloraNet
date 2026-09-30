from pydantic import BaseModel, Field
from typing import List

class CropPhase(BaseModel):
    phase_number: int = Field(description="The phase number (e.g., 1, 2, 3)")
    season: str = Field(description="Season or time of year")
    recommended_crop: str = Field(description="The recommended crop or cover crop")
    justification: str = Field(description="Why this crop is chosen (e.g., nitrogen fixation, biomass)")
    estimated_duration_days: int = Field(description="Estimated duration of this phase in days")

class MicroclimateAlert(BaseModel):
    alert_type: str = Field(description="Type of alert (e.g., Heatwave, Frost, Heavy Rain)")
    severity: str = Field(description="Severity level (e.g., Low, Medium, High)")
    actionable_prep_steps: List[str] = Field(description="Actionable preparation steps for the farmer")

class RegenerativePlanResponse(BaseModel):
    plan_overview: str = Field(description="High-level overview of the 3-year regenerative strategy")
    current_soil_health_assessment: str = Field(description="Assessment based on NDVI, NDRE, moisture, and soil type")
    soil_degradation_index: float = Field(description="Calculated soil stress level (0.0 to 1.0, where 1.0 is highly degraded)")
    phases: List[CropPhase] = Field(description="Detailed phases for the crop rotation")
    estimated_soc_improvement_percent: float = Field(description="Estimated percentage improvement in Soil Organic Carbon (SOC) after 3 years")
    microclimate_alerts: List[MicroclimateAlert] = Field(description="Real-time actionable weather alerts combined with soil conditions")
