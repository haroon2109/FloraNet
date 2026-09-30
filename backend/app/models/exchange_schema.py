from pydantic import BaseModel, Field
from typing import List, Dict, Any
from datetime import datetime

class GeoCoordinates(BaseModel):
    type: str = Field(default="GeoCoordinates", alias="@type")
    latitude: float
    longitude: float

class DiseaseOutbreak(BaseModel):
    type: str = Field(default="DiseaseOutbreak", alias="@type")
    name: str = Field(description="Name of the disease or pest")
    severity: str = Field(description="Severity level, e.g., High, Medium, Low")
    location: GeoCoordinates
    dateReported: str
    reportedBy: str

class AgriNDataExchange(BaseModel):
    context: str = Field(default="https://schema.org/", alias="@context")
    type: str = Field(default="Dataset", alias="@type")
    name: str = Field(default="FloraNet BRICS AgriN Data Exchange")
    outbreaks: List[DiseaseOutbreak]
